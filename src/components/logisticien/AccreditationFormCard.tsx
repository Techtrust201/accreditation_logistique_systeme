"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatusPill from "./StatusPill";
import type { Accreditation, AccreditationStatus } from "@/types";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Info, PlusCircle } from "lucide-react";
import VehicleForm from "@/components/accreditation/VehicleForm";
import AccreditationHistory from "./AccreditationHistory";
import type { Vehicle } from "@/types";

const EVENT_OPTIONS = [
  { value: "festival", label: "Festival du Film" },
  { value: "miptv", label: "MIPTV" },
  { value: "mipcom", label: "MIPCOM" },
];

interface Props {
  acc: Accreditation;
}

export default function AccreditationFormCard({ acc }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AccreditationStatus>(
    acc.status as AccreditationStatus
  );
  const [company, setCompany] = useState(acc.company ?? "");
  const [stand, setStand] = useState(acc.stand ?? "");
  const [unloading, setUnloading] = useState(acc.unloading ?? "");
  const [saving, setSaving] = useState(false);

  const [event, setEvent] = useState(acc.event ?? "");
  const [message, setMessage] = useState(acc.message ?? "");

  const [email, setEmail] = useState(acc.email ?? "");
  const [sending, setSending] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    size: "" as Vehicle["size"],
    phoneCode: "+33",
    phoneNumber: "",
    date: "",
    time: "",
    city: "",
    unloading: ["lat"] as Vehicle["unloading"],
  });

  const [emailHistory, setEmailHistory] = useState<
    { email: string; sentAt: string }[]
  >([]);

  const refreshEmailHistory = useCallback(async () => {
    const res = await fetch(`/api/accreditations/${acc.id}/emails`);
    if (res.ok) setEmailHistory(await res.json());
  }, [acc.id]);

  useEffect(() => {
    refreshEmailHistory();
  }, [refreshEmailHistory]);

  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  async function handleEditVehicle(v: Vehicle) {
    setEditVehicleId(v.id);
    setEditVehicle({ ...v });
  }
  async function handleSaveEditVehicle() {
    const res = await fetch(`/api/vehicles/${editVehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editVehicle),
    });
    if (res.ok) {
      setEditVehicleId(null);
      setEditVehicle(null);
      router.refresh();
    } else {
      alert("Erreur modification véhicule");
    }
  }
  async function handleDeleteVehicle(id: number) {
    if (!confirm("Supprimer ce véhicule ?")) return;
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Erreur suppression véhicule");
  }

  const [historyVersion, setHistoryVersion] = useState(0);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/accreditations/${acc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          company,
          stand,
          unloading,
          event,
          message,
          vehicles: [
            {
              ...acc.vehicles[0],
              phoneCode: acc.vehicles[0]?.phoneCode ?? "+33",
              phoneNumber: acc.vehicles[0]?.phoneNumber ?? "",
              date: acc.vehicles[0]?.date ?? "",
              time: acc.vehicles[0]?.time ?? "",
              size: acc.vehicles[0]?.size ?? "",
              city: acc.vehicles[0]?.city ?? "",
              unloading: acc.vehicles[0]?.unloading ?? "lat",
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      router.refresh();
      setHistoryVersion((v) => v + 1);
    } catch {
      alert("Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function sendAccreditation() {
    if (!email) return;
    try {
      setSending(true);
      const res = await fetch(`/api/accreditations/${acc.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur envoi");
      await refreshEmailHistory();
      router.refresh();
      alert("E-mail envoyé");
      setHistoryVersion((v) => v + 1);
    } catch {
      alert("Impossible d'envoyer l'e-mail");
    } finally {
      setSending(false);
    }
  }

  async function handleAddVehicle() {
    const res = await fetch(`/api/accreditations/${acc.id}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle),
    });
    if (res.ok) {
      setShowAddVehicle(false);
      setNewVehicle({
        plate: "",
        size: "",
        phoneCode: "+33",
        phoneNumber: "",
        date: "",
        time: "",
        city: "",
        unloading: ["lat"],
      });
      router.refresh();
      setHistoryVersion((v) => v + 1);
    } else {
      alert("Erreur ajout véhicule");
    }
  }

  const [showEntryConfirm, setShowEntryConfirm] = useState(false);

  function formatDuration(entryAt: string | null, exitAt: string | null) {
    if (!entryAt || !exitAt) return "-";
    const d1 = new Date(entryAt);
    const d2 = new Date(exitAt);
    const ms = d2.getTime() - d1.getTime();
    if (ms <= 0) return "-";
    const min = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return `${h}h ${min}min`;
  }

  const handleDuplicateForNewVehicle = () => {
    // On prépare tous les champs à dupliquer
    const params = new URLSearchParams({
      step: "1",
      company,
      stand,
      unloading,
      event,
      message: message || "",
      email: email || "",
      // On prend la ville du premier véhicule s'il existe
      city: acc.vehicles[0]?.city || "",
    });
    router.push(`/logisticien/nouveau?${params.toString()}`);
  };

  // Ajout de la fonction pour les transitions métier
  const getNextStatusOptions = (current: AccreditationStatus) => {
    // Toujours inclure le statut actuel pour permettre de le voir
    const allOptions = [
      { value: "NOUVEAU", label: "Nouveau" },
      { value: "ATTENTE", label: "Attente" },
      { value: "ENTREE", label: "Entrée" },
      { value: "SORTIE", label: "Sortie" },
      { value: "REFUS", label: "Refusé" },
      { value: "ABSENT", label: "Absent" },
    ];

    // Si le statut est SORTIE, on ne peut plus changer
    if (current === "SORTIE") {
      return allOptions.filter((option) => option.value === current);
    }

    // Pour tous les autres statuts, permettre tous les changements
    return allOptions;
  };

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg md:rounded-2xl shadow-lg w-full max-h-[85vh] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="bg-[#4F587E] text-white rounded-t-2xl px-8 py-5 shadow flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Info size={22} />
          </div>
          Infos accréditations
        </h1>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden p-8">
        {/* Liste des véhicules existants */}
        {acc.vehicles && acc.vehicles.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-base text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4F587E] rounded-full"></div>
              Véhicules accrédités
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 rounded-xl overflow-hidden mb-6 min-w-full shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Plaque
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Taille
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Téléphone
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Date
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Heure
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Ville
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Déchargement
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {acc.vehicles.map((v) => (
                    <React.Fragment key={v.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-200">
                        <td className="p-4 font-medium text-gray-800">
                          {v.plate}
                        </td>
                        <td className="p-4 text-gray-700">{v.size}</td>
                        <td className="p-4 text-gray-700">
                          {v.phoneCode} {v.phoneNumber}
                        </td>
                        <td className="p-4 text-gray-700">{v.date}</td>
                        <td className="p-4 text-gray-700">{v.time}</td>
                        <td className="p-4 text-gray-700">{v.city}</td>
                        <td className="p-4 text-gray-700">
                          {v.unloading.includes("lat") &&
                          v.unloading.includes("rear")
                            ? "Latéral + Arrière"
                            : v.unloading.includes("lat")
                              ? "Latéral"
                              : v.unloading.includes("rear")
                                ? "Arrière"
                                : "Non défini"}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => handleEditVehicle(v)}
                            title="Éditer"
                            className="text-[#4F587E] hover:bg-gray-200 rounded-lg p-2 transition-all duration-200"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v.id)}
                            title="Supprimer"
                            className="text-red-400 hover:text-red-600 rounded-lg p-2 transition-all duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                      {editVehicleId === v.id && (
                        <tr>
                          <td colSpan={8} className="bg-gray-50 p-6">
                            <VehicleForm
                              data={editVehicle!}
                              update={(patch) =>
                                setEditVehicle((veh) =>
                                  veh ? { ...veh, ...patch } : null
                                )
                              }
                              onValidityChange={() => {}}
                            />
                            <div className="flex gap-3 justify-end mt-4">
                              <button
                                onClick={() => {
                                  setEditVehicleId(null);
                                  setEditVehicle(null);
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-200 transition-colors duration-200"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={handleSaveEditVehicle}
                                className="px-4 py-2 rounded-lg bg-[#4F587E] text-white hover:bg-[#3B4252] transition-colors duration-200"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-sm bg-white rounded-lg md:rounded-2xl p-3 md:p-8 border border-gray-200 mb-4 md:mb-8 w-full">
          {/* Statut */}
          <div className="flex flex-col col-span-1">
            <label className="font-semibold mb-3 text-gray-800">Statut</label>
            <div className="flex items-center gap-3">
              {status === "ENTREE" ? (
                <select
                  className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value as AccreditationStatus;
                    if (val === "SORTIE") {
                      setStatus("SORTIE");
                    }
                  }}
                >
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                </select>
              ) : status === "SORTIE" ? (
                <select
                  className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 bg-gray-100 cursor-not-allowed text-gray-400 text-sm md:text-base"
                  value={status}
                  disabled
                >
                  <option value="SORTIE">Sortie</option>
                </select>
              ) : (
                <select
                  className={`w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base ${(status as AccreditationStatus) === "ENTREE" ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value as AccreditationStatus;
                    if (
                      (status as AccreditationStatus) !== "ENTREE" &&
                      val === "ENTREE"
                    ) {
                      setShowEntryConfirm(true);
                    } else if (
                      (status as AccreditationStatus) === "ENTREE" &&
                      val !== "ENTREE"
                    ) {
                      alert(
                        "Impossible de revenir à un statut antérieur après l'entrée."
                      );
                    } else {
                      setStatus(val);
                    }
                  }}
                >
                  {getNextStatusOptions(status).map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === status}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {status === "ENTREE" && (
                <span className="text-xs text-gray-500 mt-1">
                  Passer à &apos;Sortie&apos; pour clôturer la présence
                </span>
              )}
              {status === "SORTIE" && (
                <span className="text-xs text-gray-500 mt-1">
                  Statut final, durée calculée
                </span>
              )}
              <StatusPill status={status} />
            </div>
          </div>
          {/* ID */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-gray-800">#ID</label>
            <input
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={acc.id}
              readOnly
            />
          </div>
          {/* Company */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-gray-800">
              Nom de l&apos;entreprise
            </label>
            <input
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          {/* Stand */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-gray-800">
              Stand desservi
            </label>
            <input
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={stand}
              onChange={(e) => setStand(e.target.value)}
            />
          </div>
          {/* Unloading */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-gray-800">
              Déchargement par
            </label>
            <select
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={unloading}
              onChange={(e) => setUnloading(e.target.value)}
            >
              <option value="">Choisir</option>
              <option value="Palais">Palais</option>
              <option value="SVMM">SVMM</option>
              <option value="Autonome">Autonome</option>
            </select>
          </div>
          {/* Event */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-gray-800">
              Événement
            </label>
            <select
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            >
              <option value="">Choisir un événement</option>
              {/* Affiche l'option associée même si elle n'est pas dans EVENT_OPTIONS */}
              {event && !EVENT_OPTIONS.some((o) => o.value === event) && (
                <option value={event}>{event}</option>
              )}
              {EVENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {/* Message */}
          <div className="flex flex-col col-span-full">
            <label className="font-semibold mb-3 text-gray-800">
              Message du conducteur
            </label>
            <textarea
              className="w-full rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 py-2 md:py-3 min-h-[80px] md:min-h-[100px] focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 resize-none text-sm md:text-base"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {/* Durée (readonly) */}
          <div className="flex flex-col">
            <label className="font-semibold mb-3 text-red-700">
              Durée sur site
            </label>
            <input
              className="w-full h-12 rounded-xl border border-gray-400 px-4 bg-gray-100 text-red-700 font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              value={formatDuration(
                acc.entryAt?.toISOString() ?? null,
                acc.exitAt?.toISOString() ?? null
              )}
              readOnly
            />
          </div>
          {/* Email */}
          <div className="flex flex-col col-span-full">
            <label className="font-semibold mb-3 text-gray-800">
              E-mail du destinataire
            </label>
            <input
              type="email"
              className="w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="conducteur@email.com"
            />
          </div>
        </div>

        <div className="px-2 md:px-6 pb-4 md:pb-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-6">
          <button
            disabled={saving}
            onClick={save}
            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Enregistrer
          </button>

          <button
            onClick={sendAccreditation}
            disabled={sending || !email}
            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {sending ? "Envoi…" : "Envoyer l'accréditation"}
          </button>
          <button
            onClick={handleDuplicateForNewVehicle}
            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-xl border border-gray-400 hover:bg-gray-300 transition font-semibold shadow text-sm md:text-base"
          >
            {showAddVehicle ? "Annuler" : "+ Ajouter un véhicule"}
          </button>
        </div>
        {showAddVehicle && (
          <div className="px-6 pb-6 mt-4">
            <div className="rounded-xl border border-[#4F587E] bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#4F587E] rounded-lg">
                  <PlusCircle className="text-white" size={20} />
                </div>
                <span className="font-semibold text-[#4F587E] text-lg">
                  Ajouter un véhicule
                </span>
              </div>
              <VehicleForm
                data={newVehicle as Vehicle}
                update={(patch) => setNewVehicle((v) => ({ ...v, ...patch }))}
                onValidityChange={() => {}}
              />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleAddVehicle}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition"
                >
                  Ajouter ce véhicule
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Historique des emails envoyés */}
        {emailHistory.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="font-semibold mb-4 text-base text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Historique des envois d&apos;e-mails
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden min-w-full shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      E-mail
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Date d&apos;envoi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emailHistory.map((h, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-green-50/50 transition-all duration-200"
                    >
                      <td className="p-4 font-medium">{h.email}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(h.sentAt).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Historique des modifications */}
        <div className="px-6 pb-6">
          <AccreditationHistory accreditationId={acc.id} key={historyVersion} />
        </div>
        {/* Modal de confirmation entrée */}
        {showEntryConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">
                Confirmer l&apos;entrée du véhicule
              </h2>
              <p className="mb-6 text-gray-700 leading-relaxed text-center">
                Attention : si vous validez l&apos;entrée, le chrono de présence
                sera activé pour ce véhicule.
                <br />
                <span className="font-semibold text-red-600">
                  Cette action est irréversible.
                </span>{" "}
                La durée sur site sera calculée automatiquement lors de la
                sortie.
                <br />
                Confirmez-vous l&apos;entrée ?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
                <button
                  onClick={() => setShowEntryConfirm(false)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-400 bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition shadow"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setStatus("ENTREE");
                    setShowEntryConfirm(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition"
                >
                  Valider l&apos;entrée
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
