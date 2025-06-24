import Link from "next/link";
import { readAccreditations } from "@/lib/store";
import { List, ChevronDown, Calendar, Pencil } from "lucide-react";

/* ---------- Composant Badge Statut ---------- */
function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    { bg: string; text: string; full: string; short: string }
  > = {
    NOUV: {
      bg: "bg-badge-new-bg",
      text: "text-accent",
      full: "Nouveau",
      short: "Nouv",
    },
    NOUVEAU: {
      bg: "bg-badge-new-bg",
      text: "text-accent",
      full: "Nouveau",
      short: "Nouv",
    },
    ATTENTE: {
      bg: "bg-gray-200",
      text: "text-[#337BFF]",
      full: "Attente",
      short: "Att",
    },
    ENTREE: {
      bg: "bg-badge-in-bg",
      text: "text-badge-in-bg",
      full: "Entrée",
      short: "Ent",
    },
    SORTIE: {
      bg: "bg-badge-out-bg",
      text: "text-badge-out-bg",
      full: "Sortie",
      short: "Sortie",
    },
    REFUS: {
      bg: "bg-badge-ref-bg",
      text: "text-[#EE0000]",
      full: "Refus",
      short: "Refus",
    },
    ABSENT: {
      bg: "bg-badge-abs-bg",
      text: "text-badge-abs-bg",
      full: "Absent",
      short: "Abs",
    },
  };
  const cfg = map[status] ?? {
    bg: "bg-gray-200",
    text: "text-gray-800",
    full: status,
    short: status.slice(0, 4),
  };

  return (
    <span
      className={`inline-flex items-center min-w-[84px] h-6 rounded-badge text-xs font-bold ${cfg.bg} ${cfg.text}`}
    >
      <span className="hidden lg:inline">{cfg.full}</span>
      <span className="inline lg:hidden">{cfg.short}</span>
    </span>
  );
}

/* ---------- Page Dashboard ---------- */
export default async function LogisticienDashboard() {
  const data = await readAccreditations();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      {/* Barre de recherche */}
      <div>
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full md:w-72 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Carte */}
      <div className="rounded-card shadow-card bg-white overflow-hidden text-xs sm:text-sm">
        {/* Titre */}
        <div className="flex items-center justify-between p-4 h-header bg-[#4F587E] text-white font-semibold text-sm rounded-t-card">
          <h1 className="flex items-center gap-2">
            <List size={16} />
            Liste d&apos;accréditations
          </h1>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="text-gray-600 whitespace-nowrap border-b border-[#E5E8F1]">
              <tr>
                <th className="p-4 font-medium">
                  <div className="flex items-center gap-1">
                    Statut
                    <ChevronDown size={12} className="text-[#4F587E]" />
                  </div>
                </th>
                <th className="px-4 py-2 font-medium">
                  <div className="flex items-center gap-1">
                    #ID
                    <ChevronDown size={12} className="text-[#4F587E]" />
                  </div>
                </th>
                <th className="px-4 py-2 font-medium">
                  <div className="flex items-center gap-1">
                    Plaque
                    <ChevronDown size={12} className="text-[#4F587E]" />
                  </div>
                </th>
                <th className="px-4 py-2 font-medium">
                  <div className="flex items-center gap-1">
                    Date
                    <Calendar size={16} className="text-[#4F587E]" />
                    <ChevronDown size={12} className="text-[#4F587E]" />
                  </div>
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <StatusPill status={(acc.status as string) || "NOUV"} />
                  </td>
                  <td className="px-4 whitespace-nowrap">#{acc.id}</td>
                  <td className="px-4">{acc.vehicles[0]?.plate ?? "-"}</td>
                  <td className="px-4 whitespace-nowrap">
                    {acc.createdAt
                      ? new Date(acc.createdAt).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-4 text-right">
                    <Link
                      href={`/logisticien/${acc.id}`}
                      className="text-primary hover:underline"
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (statique) */}
        <div className="px-4 py-2 bg-gray-50 text-gray-500 flex items-center justify-between">
          <span>
            1–{data.length} sur {data.length}
          </span>
          <div className="space-x-1">
            <button
              className="px-2 py-1 border rounded bg-white disabled:opacity-50"
              disabled
            >
              {"<"}
            </button>
            <button className="px-2 py-1 border rounded bg-white">{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
