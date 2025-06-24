"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Accreditation, AccreditationStatus } from "@/types";

export default function AccreditationDetail({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const [data, setData] = useState<Accreditation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/accreditations/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus: AccreditationStatus) {
    if (!data || newStatus === data.status) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/accreditations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur maj");
      const updated = await res.json();
      setData(updated);
    } catch (err) {
      alert("Impossible de mettre à jour le statut");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="p-6">Chargement…</p>;
  if (!data) return <p className="p-6">Aucune donnée</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-primary underline"
      >
        ← Retour
      </button>

      <h1 className="text-xl font-bold">Accréditation #{data.id}</h1>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Entreprise:</span>{" "}
          {data.stepOneData.company}
        </p>
        <p>
          <span className="font-semibold">Stand:</span> {data.stepOneData.stand}
        </p>
        <p>
          <span className="font-semibold">Statut:</span>{" "}
          {data.status === "ATTENTE" && (
            <span className="text-blue-600">Attente</span>
          )}
          {data.status === "ENTREE" && (
            <span className="text-green-700">Entrée</span>
          )}
          {data.status === "SORTIE" && (
            <span className="text-red-600">Sortie</span>
          )}
        </p>
        <p>
          <span className="font-semibold">Entrée:</span>{" "}
          {data.entryAt ? new Date(data.entryAt).toLocaleString("fr-FR") : "-"}
        </p>
        <p>
          <span className="font-semibold">Sortie:</span>{" "}
          {data.exitAt ? new Date(data.exitAt).toLocaleString("fr-FR") : "-"}
        </p>
      </div>

      {/* Changement statut */}
      <div>
        <label className="font-semibold mr-2">Modifier le statut:</label>
        <select
          value={data.status}
          onChange={(e) => updateStatus(e.target.value as AccreditationStatus)}
          disabled={updating}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="ATTENTE">Attente</option>
          <option value="ENTREE">Entrée</option>
          <option value="SORTIE">Sortie</option>
        </select>
      </div>

      {/* Détails véhicules simplifiés */}
      <h2 className="text-lg font-semibold mt-8">Véhicules</h2>
      {data.vehicles.map((v, idx) => (
        <div key={v.id} className="border p-4 rounded mb-4 text-sm">
          <h3 className="font-semibold mb-2">Véhicule {idx + 1}</h3>
          <p>Plaque: {v.plate}</p>
          <p>Taille: {v.size}</p>
          <p>
            Arrivée prévue: {v.date} {v.time}
          </p>
        </div>
      ))}
    </div>
  );
}
