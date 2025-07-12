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

export default function StepFour({ data, onReset }: Props) {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    try {
      setLoading(true);

      // 1. On enregistre la demande pour le logisticien
      const saveRes = await fetch("/api/accreditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveRes.ok) throw new Error("Erreur enregistrement");

      const created = await saveRes.json();

      // 2. On génère le PDF en incluant l'id retourné
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

      // reset form state
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
        {/* Header avec icône */}
        <div className="flex items-start gap-3">
          <Image
            src="/accreditation/progressbar/Vector (3).svg"
            alt="PDF"
            width={24}
            height={24}
            className="w-6 h-6 shrink-0 mt-0.5"
          />
          <h2 className="text-lg font-semibold">Demande créée</h2>
        </div>

        {/* Message */}
        <ul className="list-disc pl-9 text-sm">
          <li>
            Vous recevrez un SMS lorsqu&apos;un logisticien aura validé
            l&apos;accréditation.
          </li>
        </ul>

        {/* Bouton */}
        <button
          onClick={downloadPdf}
          disabled={loading}
          className="px-4 py-2 bg-[#3daaa4] text-white rounded shadow hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? "Génération…" : "Télécharger l'accréditation"}
        </button>
      </div>
    </div>
  );
}
