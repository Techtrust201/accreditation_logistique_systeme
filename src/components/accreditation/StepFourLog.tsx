"use client";

import { useState } from "react";
import Image from "next/image";
import type { Vehicle } from "@/types";

interface Props {
  data: {
    company: string;
    stand: string;
    unloading: string;
    event: string;
    vehicles: Vehicle[];
    message: string;
    consent: boolean;
  };
  onReset: () => void;
}

export default function StepFourLog({ data, onReset }: Props) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function downloadPdf() {
    try {
      if (!email) {
        alert("Veuillez saisir un e-mail");
        return;
      }
      setLoading(true);

      // 1. On enregistre la demande (sans email dans le payload)
      const saveRes = await fetch("/api/accreditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // <-- Correction ici : PAS de email à la racine
      });
      if (!saveRes.ok) throw new Error("Erreur enregistrement");
      const created = await saveRes.json();

      // 2. On envoie directement le mail (l'API backend va générer le PDF et l'envoyer à l'email)
      await fetch(`/api/accreditations/${created.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // <-- Ici, on ne passe QUE l'email, c'est suffisant
      });

      // 3. Génère et télécharge le PDF pour le logisticien aussi
      const res = await fetch("/api/accreditation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: created.id,
          email,
          status: created.status,
          entryAt: created.entryAt,
          exitAt: created.exitAt,
        }),
      });
      if (!res.ok) throw new Error("Erreur génération PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "accreditation.pdf";
      a.click();
      URL.revokeObjectURL(url);

      // reset form state
      onReset();
    } catch (err) {
      console.error(err);
      alert("Impossible de finaliser la demande");
    } finally {
      setLoading(false);
    }
  }

  async function downloadOnly() {
    try {
      setLoading(true);

      // enregistrer sans email
      const saveRes = await fetch("/api/accreditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!saveRes.ok) throw new Error("Erreur enregistrement");
      const created = await saveRes.json();

      // générer et télécharger
      const res = await fetch("/api/accreditation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: created.id,
          status: created.status,
          entryAt: created.entryAt,
          exitAt: created.exitAt,
        }),
      });
      if (!res.ok) throw new Error("Erreur génération PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "accreditation.pdf";
      a.click();
      URL.revokeObjectURL(url);

      onReset();
    } catch (err) {
      console.error(err);
      alert("Impossible de télécharger le PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div className="border-2 border-[#3daaa4] rounded-lg px-6 py-4 w-full max-w-xl text-left space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Image
            src="/accreditation/progressbar/Vector (3).svg"
            alt="PDF"
            width={24}
            height={24}
            className="w-6 h-6 shrink-0 mt-0.5"
          />
          <h2 className="text-lg font-semibold">Accréditation créée</h2>
        </div>

        {/* Message */}
        <ul className="list-disc pl-9 text-sm">
          <li>Un SMS de validation a été envoyé.</li>
        </ul>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="destEmail">
            E-mail du destinataire
          </label>
          <input
            id="destEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="conducteur@mail.com"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={downloadPdf}
            disabled={loading || !email}
            className="px-4 py-2 bg-[#3daaa4] text-white rounded shadow hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? "Traitement…" : "Envoyer l'accréditation"}
          </button>

          <button
            onClick={downloadOnly}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "…" : "Télécharger PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
