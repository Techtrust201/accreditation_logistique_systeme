"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";
import type { Accreditation, AccreditationStatus } from "@/types";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";

const EVENT_OPTIONS = [
  { value: "festival", label: "Festival du Film" },
  { value: "miptv", label: "MIPTV" },
  { value: "mipcom", label: "MIPCOM" },
];

const SIZE_OPTIONS = ["-10", "10-14", "15-20", "+20"];

interface Props {
  acc: Accreditation;
}

export default function AccreditationFormCard({ acc }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AccreditationStatus>(
    acc.status as AccreditationStatus
  );
  const [company, setCompany] = useState(acc.stepOneData.company);
  const [stand, setStand] = useState(acc.stepOneData.stand);
  const [unloading, setUnloading] = useState(acc.stepOneData.unloading);
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
  const [event, setEvent] = useState(acc.stepOneData.event);
  const [message, setMessage] = useState(acc.stepThreeData?.message ?? "");
  const [unloadSide, setUnloadSide] = useState(
    acc.vehicles[0]?.unloading ?? "lat"
  );

  const [email, setEmail] = useState(acc.email ?? "");
  const [sending, setSending] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/accreditations/${acc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          stepOneData: { company, stand, unloading, event },
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
          stepThreeData: { message, consent: true },
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
      router.refresh();
      alert("E-mail envoyé");
    } catch {
      alert("Impossible d'envoyer l'e-mail");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-card shadow-card bg-white w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-header bg-[#4F587E] text-white font-semibold text-sm rounded-t-card">
        <h1 className="flex items-center gap-2">
          <List size={16} />
          Info accréditation
        </h1>
      </div>

      {/* Form grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Statut */}
        <div className="flex flex-col col-span-1">
          <label className="font-semibold mb-1">Statut</label>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded border px-2"
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
            <StatusPill status={status} />
          </div>
        </div>
        {/* ID */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">#ID</label>
          <input
            className="h-9 rounded border px-2 bg-gray-100"
            value={acc.id}
            readOnly
          />
        </div>
        {/* Plaque */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Plaque</label>
          <input
            className="h-9 rounded border px-2 bg-gray-100"
            value={acc.vehicles[0]?.plate ?? ""}
            readOnly
          />
        </div>
        {/* Company */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Nom de l'entreprise</label>
          <input
            className="h-9 rounded border px-2"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        {/* Stand */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Stand desservi</label>
          <input
            className="h-9 rounded border px-2"
            value={stand}
            onChange={(e) => setStand(e.target.value)}
          />
        </div>
        {/* Unloading */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Déchargement par</label>
          <select
            className="h-9 rounded border px-2"
            value={unloading}
            onChange={(e) => setUnloading(e.target.value)}
          >
            <option value="">Choisir</option>
            <option value="Palais">Palais</option>
            <option value="SVMM">SVMM</option>
            <option value="Autonome">Autonome</option>
          </select>
        </div>
        {/* Téléphone conducteur */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Téléphone du conducteur</label>
          <div className="flex gap-2">
            <input
              className="h-9 w-20 rounded border px-2"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
            />
            <input
              className="h-9 flex-1 rounded border px-2"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
        {/* Date arrivée */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Date d'arrivée</label>
          <input
            type="date"
            className="h-9 rounded border px-2"
            value={arrDate}
            onChange={(e) => setArrDate(e.target.value)}
          />
        </div>
        {/* Heure arrivée */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Heure d'arrivée</label>
          <input
            type="time"
            className="h-9 rounded border px-2"
            value={arrTime}
            onChange={(e) => setArrTime(e.target.value)}
          />
        </div>
        {/* Taille */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Taille du véhicule</label>
          <select
            className="h-9 rounded border px-2"
            value={size}
            onChange={(e) => setSize(e.target.value as any)}
          >
            <option value="">Choisir une taille</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {/* Event */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Événement</label>
          <select
            className="h-9 rounded border px-2"
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
        {/* Ville départ */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Ville de départ</label>
          <input
            className="h-9 rounded border px-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        {/* Déchargement side */}
        <div className="flex flex-col col-span-full">
          <label className="font-semibold mb-1">Déchargement</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="side"
                value="lat"
                checked={unloadSide === "lat"}
                onChange={() => setUnloadSide("lat")}
              />
              <span>Latéral</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="side"
                value="rear"
                checked={unloadSide === "rear"}
                onChange={() => setUnloadSide("rear")}
              />
              <span>Arrière</span>
            </label>
          </div>
        </div>
        {/* Message */}
        <div className="flex flex-col col-span-full">
          <label className="font-semibold mb-1">Message du conducteur</label>
          <textarea
            className="rounded border px-2 py-2 min-h-[80px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {/* Durée (readonly) */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-red-600">
            Durée sur site
          </label>
          <input
            className="h-9 rounded border px-2 bg-gray-100 text-red-600 font-semibold"
            value={(acc as any).durationOnSite ?? "-"}
            readOnly
          />
        </div>
        {/* Email */}
        <div className="flex flex-col col-span-full">
          <label className="font-semibold mb-1">E-mail du destinataire</label>
          <input
            type="email"
            className="h-9 rounded border px-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="conducteur@email.com"
          />
        </div>
      </div>

      <div className="px-6 pb-6 flex justify-end">
        <button
          disabled={saving}
          onClick={save}
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
        >
          Enregistrer
        </button>

        <button
          onClick={sendAccreditation}
          disabled={sending || !email}
          className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
        >
          {sending ? "Envoi…" : "Envoyer l'accréditation"}
        </button>
      </div>
    </div>
  );
}
