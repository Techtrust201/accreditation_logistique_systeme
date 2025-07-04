"use client";

import { useState, useEffect } from "react";
import type { Accreditation, AccreditationStatus } from "@/types";
import { ArrowLeft, Save, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  acc: Accreditation;
  onSave?: (data: any) => void;
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

  useEffect(() => {
    setStatus(acc.status as AccreditationStatus);
    setCompany(acc.company ?? "");
    setStand(acc.stand ?? "");
    setUnloading(acc.unloading ?? "");
    setEvent(acc.event ?? "");
    setMessage(acc.message ?? "");
    setVehicles(acc.vehicles ?? []);
  }, [acc.id]);

  // Pour simplifier, on ne gère ici que l'édition des infos principales et des plaques

  return (
    <div className="block sm:hidden w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-4 space-y-6 pb-24">
      {/* Header + retour */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/logisticien" className="text-[#4F587E] p-2 -ml-2">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-lg font-bold text-[#4F587E]">
          Éditer l'accréditation
        </h2>
      </div>
      {/* Statut */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">Statut</label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value as AccreditationStatus)}
        >
          <option value="NOUVEAU">Nouveau</option>
          <option value="ATTENTE">Attente</option>
          <option value="ENTREE">Entrée</option>
          <option value="SORTIE">Sortie</option>
          <option value="REFUS">Refus</option>
          <option value="ABSENT">Absent</option>
        </select>
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
        <div className="font-semibold text-[#4F587E] mb-1">Véhicules</div>
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
              {/* Ici, on pourrait ajouter un bouton pour éditer/supprimer le véhicule */}
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
        {/* Ajout véhicule : à faire si besoin */}
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4F587E] text-white font-bold text-base shadow hover:bg-[#3B4252] transition mt-2"
        onClick={() =>
          onSave &&
          onSave({
            status,
            company,
            stand,
            unloading,
            event,
            message,
            vehicles,
          })
        }
        disabled={loading}
      >
        <Save size={20} /> Enregistrer
      </button>
    </div>
  );
}
