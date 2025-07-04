"use client";

import { useState, useEffect } from "react";
import type { Accreditation, AccreditationStatus } from "@/types";
import { ArrowLeft, Save, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  acc: Accreditation;
  onSave?: (data: {
    status: AccreditationStatus;
    company: string;
    stand: string;
    unloading: string;
    event: string;
    message: string;
    vehicles: import("@/types").Vehicle[];
  }) => void;
  loading?: boolean;
}

export default function MobileAccreditationEditCard({
  acc,
  onSave,
  loading,
}: Props) {
  const [status, setStatus] = useState<AccreditationStatus>(
    acc.status as AccreditationStatus
  );
  const [company, setCompany] = useState(acc.company ?? "");
  const [stand, setStand] = useState(acc.stand ?? "");
  const [unloading, setUnloading] = useState(acc.unloading ?? "");
  const [event, setEvent] = useState(acc.event ?? "");
  const [message, setMessage] = useState(acc.message ?? "");
  const [vehicles, setVehicles] = useState(acc.vehicles ?? []);
  const [showEntryConfirm, setShowEntryConfirm] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    size: "",
    phoneCode: "",
    phoneNumber: "",
    date: "",
    time: "",
    city: "",
    unloading: "lat",
  });
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(acc.status as AccreditationStatus);
    setCompany(acc.company ?? "");
    setStand(acc.stand ?? "");
    setUnloading(acc.unloading ?? "");
    setEvent(acc.event ?? "");
    setMessage(acc.message ?? "");
    setVehicles(acc.vehicles ?? []);
  }, [acc.id]);

  const handleStatusChange = (newStatus: AccreditationStatus) => {
    if (status === "ENTREE") {
      // Si on est en statut "ENTREE", seule la "SORTIE" est autorisée
      if (newStatus === "SORTIE") {
        setStatus(newStatus);
      }
    } else if (status === "SORTIE") {
      // Si on est en statut "SORTIE", aucun changement possible
      return;
    } else {
      // Pour les autres statuts
      if (newStatus === "ENTREE") {
        // Demander confirmation pour passer à "ENTREE"
        setShowEntryConfirm(true);
      } else {
        setStatus(newStatus);
      }
    }
  };

  // Ajout véhicule local
  const handleAddVehicle = () => {
    if (
      !newVehicle.plate ||
      !newVehicle.size ||
      !newVehicle.phoneNumber ||
      !newVehicle.date ||
      !newVehicle.time ||
      !newVehicle.city
    ) {
      alert("Merci de remplir tous les champs obligatoires");
      return;
    }
    setVehicles((prev) => [...prev, { ...newVehicle, id: Date.now() }]);
    setShowAddVehicle(false);
    setNewVehicle({
      plate: "",
      size: "",
      phoneCode: "",
      phoneNumber: "",
      date: "",
      time: "",
      city: "",
      unloading: "lat",
    });
  };

  // Nouvelle fonction save
  const save = async () => {
    setSaving(true);
    setSaveMessage(null);
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
          vehicles,
        }),
      });
      if (!res.ok) throw new Error("Erreur d'enregistrement");
      setSaveMessage("Modifications enregistrées ✅");
      router.refresh && router.refresh();
    } catch (e) {
      setSaveMessage("Erreur lors de l'enregistrement ❌");
    } finally {
      setSaving(false);
    }
  };

  // Pour simplifier, on ne gère ici que l'édition des infos principales et des plaques

  return (
    <div className="block sm:hidden w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-4 space-y-6 pb-24">
      {/* Header + retour */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/logisticien" className="text-[#4F587E] p-2 -ml-2">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-lg font-bold text-[#4F587E]">
          Éditer l&apos;accréditation
        </h2>
      </div>
      {/* Statut */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">Statut</label>
        {status === "ENTREE" ? (
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as AccreditationStatus)
            }
          >
            <option value="ENTREE" disabled>
              Entrée
            </option>
            <option value="SORTIE">Sortie</option>
          </select>
        ) : status === "SORTIE" ? (
          <select
            className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed text-gray-400"
            value={status}
            disabled
          >
            <option value="SORTIE">Sortie</option>
          </select>
        ) : (
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as AccreditationStatus)
            }
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
            Passer à &apos;Sortie&apos; pour clôturer la présence
          </span>
        )}
        {status === "SORTIE" && (
          <span className="text-xs text-gray-500 mt-1">
            Statut final, durée calculée
          </span>
        )}
      </div>
      {/* Infos générales */}
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Entreprise
          </label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Stand desservi
          </label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={stand}
            onChange={(e) => setStand(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Déchargement
          </label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={unloading}
            onChange={(e) => setUnloading(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Événement
          </label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
          />
        </div>
      </div>
      {/* Véhicules */}
      <div className="space-y-2">
        <div className="font-semibold text-[#4F587E] mb-1 flex items-center justify-between">
          <span>Véhicules</span>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4F587E] text-white text-xs font-semibold shadow hover:bg-[#3B4252]"
            onClick={() => setShowAddVehicle(true)}
          >
            <PlusCircle size={16} /> Ajouter
          </button>
        </div>
        {vehicles.length === 0 && (
          <div className="text-xs text-gray-500">Aucun véhicule</div>
        )}
        {vehicles.map((v, i) => (
          <div
            key={v.id || i}
            className="bg-gray-50 rounded-lg border p-3 flex flex-col gap-1 mb-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Plaque : {v.plate}</span>
              <button
                type="button"
                className="text-red-500 hover:bg-red-100 rounded-full p-1 ml-2"
                aria-label="Supprimer le véhicule"
                onClick={() => {
                  if (window.confirm("Supprimer ce véhicule ?")) {
                    setVehicles(vehicles.filter((_, idx) => idx !== i));
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="text-xs text-gray-600">
              Taille : {v.size} | Téléphone : {v.phoneCode} {v.phoneNumber}
            </div>
            <div className="text-xs text-gray-600">
              Date : {v.date} | Heure : {v.time} | Ville : {v.city}
            </div>
            <div className="text-xs text-gray-600">
              Déchargement : {v.unloading === "lat" ? "Latéral" : "Arrière"}
            </div>
          </div>
        ))}
      </div>
      {/* Message conducteur */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          Message du conducteur
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white min-h-[60px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {/* Bouton enregistrer */}
      <button
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4F587E] text-white font-bold text-base shadow hover:bg-[#3B4252] transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={save}
        disabled={saving}
      >
        <Save size={20} /> {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
      {saveMessage && (
        <div
          className={`text-center text-sm mt-2 ${saveMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}
        >
          {saveMessage}
        </div>
      )}

      {/* Modal de confirmation entrée */}
      {showEntryConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">
              Confirmer l&apos;entrée du véhicule
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-center text-sm">
              Attention : si vous validez l&apos;entrée, le chrono de présence
              sera activé pour ce véhicule.
              <br />
              <span className="font-semibold text-red-600">
                Cette action est irréversible.
              </span>{" "}
              La durée sur site sera calculée automatiquement lors de la sortie.
              <br />
              Confirmez-vous l&apos;entrée ?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowEntryConfirm(false)}
                className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition shadow"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setStatus("ENTREE");
                  setShowEntryConfirm(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition"
              >
                Valider l&apos;entrée
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal ajout véhicule */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">
              Ajouter un véhicule
            </h2>
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Plaque*"
                value={newVehicle.plate}
                onChange={(e) =>
                  setNewVehicle((v) => ({ ...v, plate: e.target.value }))
                }
              />
              <select
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={newVehicle.size}
                onChange={(e) =>
                  setNewVehicle((v) => ({ ...v, size: e.target.value }))
                }
              >
                <option value="">Taille*</option>
                <option value="-10">-10</option>
                <option value="10-14">10-14</option>
                <option value="15-20">15-20</option>
                <option value="+20">+20</option>
              </select>
              <div className="flex gap-2">
                <input
                  className="w-1/3 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Indicatif"
                  value={newVehicle.phoneCode}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, phoneCode: e.target.value }))
                  }
                />
                <input
                  className="w-2/3 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Téléphone*"
                  value={newVehicle.phoneNumber}
                  onChange={(e) =>
                    setNewVehicle((v) => ({
                      ...v,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <input
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Date*"
                  type="date"
                  value={newVehicle.date}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, date: e.target.value }))
                  }
                />
                <input
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Heure*"
                  type="time"
                  value={newVehicle.time}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, time: e.target.value }))
                  }
                />
              </div>
              <input
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Ville*"
                value={newVehicle.city}
                onChange={(e) =>
                  setNewVehicle((v) => ({ ...v, city: e.target.value }))
                }
              />
              <select
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={newVehicle.unloading}
                onChange={(e) =>
                  setNewVehicle((v) => ({ ...v, unloading: e.target.value }))
                }
              >
                <option value="lat">Déchargement latéral</option>
                <option value="rear">Déchargement arrière</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddVehicle(false)}
                className="w-1/2 px-4 py-2 rounded-lg border border-gray-400 bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition shadow"
              >
                Annuler
              </button>
              <button
                onClick={handleAddVehicle}
                className="w-1/2 px-4 py-2 rounded-lg bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
