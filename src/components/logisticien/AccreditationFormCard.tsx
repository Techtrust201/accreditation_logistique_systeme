"use client";

import React, { useState, useEffect } from "react";
import StatusPill from "./StatusPill";
import type { Accreditation, AccreditationStatus } from "@/types";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Info } from "lucide-react";
import VehicleForm from "@/components/accreditation/VehicleForm";

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

  const [phoneCode, setPhoneCode] = useState(
    acc.vehicles[0]?.phoneCode ?? "+33"
  );
  const [phoneNumber, setPhoneNumber] = useState(
    acc.vehicles[0]?.phoneNumber ?? ""
  );
  const [arrDate, setArrDate] = useState(acc.vehicles[0]?.date ?? "");
  const [arrTime, setArrTime] = useState(acc.vehicles[0]?.time ?? "");
  const [size, setSize] = useState(acc.vehicles[0]?.size ?? "");
  const [city, setCity] = useState(acc.vehicles[0]?.city ?? "");
  const [event, setEvent] = useState(acc.event ?? "");
  const [message, setMessage] = useState(acc.message ?? "");
  const [unloadSide, setUnloadSide] = useState(
    acc.vehicles[0]?.unloading ?? "lat"
  );

  const [email, setEmail] = useState(acc.email ?? "");
  const [sending, setSending] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    size: "",
    phoneCode: "+33",
    phoneNumber: "",
    date: "",
    time: "",
    city: "",
    unloading: "lat",
  });

  const [emailHistory, setEmailHistory] = useState<
    { email: string; sentAt: string }[]
  >([]);
  async function refreshEmailHistory() {
    const res = await fetch(`/api/accreditations/${acc.id}/emails`);
    if (res.ok) setEmailHistory(await res.json());
  }
  useEffect(() => {
    refreshEmailHistory();
  }, [acc.id]);

  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editVehicle, setEditVehicle] = useState<any>(null);
  async function handleEditVehicle(v) {
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
  async function handleDeleteVehicle(id) {
    if (!confirm("Supprimer ce véhicule ?")) return;
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Erreur suppression véhicule");
  }

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
              phoneCode,
              phoneNumber,
              date: arrDate,
              time: arrTime,
              size,
              city,
              unloading: unloadSide,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      router.refresh();
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
        unloading: "lat",
      });
      router.refresh();
    } else {
      alert("Erreur ajout véhicule");
    }
  }

  const [showEntryConfirm, setShowEntryConfirm] = useState(false);

  function formatDuration(entryAt, exitAt) {
    if (!entryAt || !exitAt) return "-";
    const d1 = new Date(entryAt);
    const d2 = new Date(exitAt);
    const ms = d2 - d1;
    if (ms <= 0) return "-";
    const min = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return `${h}h ${min}min`;
  }

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg md:rounded-2xl shadow-lg w-full max-h-[85vh] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="bg-[#4F587E] text-white rounded-t-2xl px-8 py-5 shadow flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Info size={22} />
          </div>
          Info accréditation
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
                          {v.unloading === "lat" ? "Latéral" : "Arrière"}
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
                              data={editVehicle}
                              update={(patch) =>
                                setEditVehicle((veh) => ({ ...veh, ...patch }))
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
                  onChange={async (e) => {
                    const val = e.target.value as AccreditationStatus;
                    if (val === "SORTIE") {
                      // Appel API pour enregistrer la sortie
                      const res = await fetch(`/api/accreditations/${acc.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "SORTIE" }),
                      });
                      if (res.ok) {
                        setStatus("SORTIE");
                        router.refresh();
                      } else {
                        alert("Erreur lors de la clôture de la présence");
                      }
                    }
                  }}
                >
                  <option value="ENTREE" disabled>
                    Entrée
                  </option>
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
                  className={`w-full h-10 rounded-lg md:rounded-xl border border-gray-400 px-3 md:px-4 focus:ring-2 focus:ring-[#4F587E] focus:border-[#4F587E] transition-all duration-200 bg-white text-sm md:text-base ${status === "ENTREE" ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value as AccreditationStatus;
                    if (status !== "ENTREE" && val === "ENTREE") {
                      setShowEntryConfirm(true);
                    } else if (status === "ENTREE" && val !== "ENTREE") {
                      alert(
                        "Impossible de revenir à un statut antérieur après l'entrée."
                      );
                    } else {
                      setStatus(val);
                    }
                  }}
                >
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="ATTENTE">Attente</option>
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                  <option value="REFUS">Refus</option>
                  <option value="ABSENT">Absent</option>
                </select>
              )}
              {status === "ENTREE" && (
                <span className="text-xs text-gray-500 mt-1">
                  Passer à 'Sortie' pour clôturer la présence
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
              Nom de l'entreprise
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
              value={formatDuration(acc.entryAt, acc.exitAt)}
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
            onClick={() => setShowAddVehicle((v) => !v)}
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
                data={newVehicle}
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
              Historique des envois d'e-mails
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden min-w-full shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      E-mail
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Date d'envoi
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
        {/* Modal de confirmation entrée */}
        {showEntryConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">
                Confirmer l'entrée du véhicule
              </h2>
              <p className="mb-6 text-gray-700 leading-relaxed text-center">
                Attention : si vous validez l'entrée, le chrono de présence sera
                activé pour ce véhicule.
                <br />
                <span className="font-semibold text-red-600">
                  Cette action est irréversible.
                </span>{" "}
                La durée sur site sera calculée automatiquement lors de la
                sortie.
                <br />
                Confirmez-vous l'entrée ?
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
                  Valider l'entrée
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
