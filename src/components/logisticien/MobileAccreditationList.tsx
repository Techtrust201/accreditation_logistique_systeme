import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import StatusPill from "./StatusPill";
import type { Accreditation } from "@/types";

interface MobileAccreditationListProps {
  pageData: Accreditation[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  searchParams: Record<string, string>;
  currentPage: number;
}

export default function MobileAccreditationList({
  pageData,
  onEdit,
  onDelete,
  searchParams,
  currentPage,
}: MobileAccreditationListProps) {
  return (
    <div className="block sm:hidden w-full space-y-4 overflow-x-hidden pb-20">
      {pageData.map((acc) => (
        <div
          key={acc.id}
          className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <StatusPill status={acc.status as string} />
            <span className="text-xs text-gray-500">
              {acc.createdAt
                ? new Date(acc.createdAt).toLocaleDateString("fr-FR")
                : "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-semibold">ID</span>
            <span className="font-mono text-sm text-[#4F587E] break-all">
              {acc.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-semibold">Plaque</span>
            <span className="flex flex-wrap gap-1">
              {acc.vehicles && acc.vehicles.length > 0 ? (
                <>
                  <span className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700 mr-1">
                    {acc.vehicles[0].plate}
                  </span>
                  {acc.vehicles.length > 2 && (
                    <span className="inline-block bg-gray-200 rounded px-2 py-0.5 text-xs text-gray-500">
                      +{acc.vehicles.length - 1}
                    </span>
                  )}
                  {acc.vehicles.length === 2 && (
                    <span className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700 mr-1">
                      {acc.vehicles[1].plate}
                    </span>
                  )}
                </>
              ) : (
                "-"
              )}
            </span>
          </div>
          <div className="flex flex-col gap-3 mt-3 sm:flex-row">
            <Link
              href={{
                pathname: "/logisticien",
                query: {
                  ...searchParams,
                  sel: String(acc.id),
                  page: currentPage,
                },
              }}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition text-sm"
              onClick={() => onEdit(acc.id)}
            >
              <Pencil size={18} /> Éditer
            </Link>
            <button
              className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition text-sm"
              onClick={() => onDelete(acc.id)}
            >
              <Trash2 size={18} /> Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
