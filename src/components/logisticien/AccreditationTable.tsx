"use client";

import Link from "next/link";
import { List, Pencil, Trash2 } from "lucide-react";
import { buildLink } from "@/lib/url";
import StatusPill from "./StatusPill";
import type { Accreditation } from "@/types";
import { useRouter } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import MobileAccreditationList from "./MobileAccreditationList";

export interface AccreditationTableProps {
  pageData: Accreditation[];
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  perPage: number;
  searchParams: Record<string, string>;
  sort: string;
  dir: string;
}

export function AccreditationTable({
  pageData,
  currentPage,
  totalPages,
  filteredCount,
  perPage,
  searchParams,
  sort,
  dir,
}: AccreditationTableProps) {
  const router = useRouter();
  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette accréditation ?")) return;
    const res = await fetch(`/api/accreditations/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Erreur suppression");
  }
  return (
    <>
      {/* Version mobile : cards responsives */}
      <MobileAccreditationList pageData={pageData} onDelete={handleDelete} />
      {/* Version desktop : tableau classique */}
      <div className="bg-gray-50 border border-gray-300 rounded-2xl shadow-lg flex flex-col h-[85vh] hidden sm:flex">
        {/* Header */}
        <div className="bg-[#4F587E] text-white rounded-t-2xl px-8 py-5 shadow flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <List size={22} />
            </div>
            Liste d&apos;accréditations
          </h1>
        </div>
        {/* Tableau */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="min-w-full text-xs md:text-base">
            <thead className="text-gray-800 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-2 md:px-6 py-2 md:py-4 font-semibold text-xs md:text-base first:pl-2 md:first:pl-8 text-center">
                  Statut
                </th>
                <th className="px-6 py-2 font-semibold text-xs md:text-base text-center">
                  Société
                </th>
                <th className="px-6 py-2 font-semibold text-xs md:text-base text-center">
                  Heure d&apos;entrée
                </th>
                <th className="px-6 py-2 font-semibold text-xs md:text-base text-center">
                  Heure sur site
                </th>
                <th className="px-6 py-2 font-semibold text-xs md:text-base text-center">
                  Heure de sortie
                </th>
                <th className="px-6 py-2" />
              </tr>
            </thead>
            <tbody>
              {pageData.map((acc, idx) => (
                <tr
                  key={`${acc.id}-${idx}`}
                  className="hover:bg-gray-100 transition-all duration-200 border-b border-gray-200 group"
                >
                  <td className="py-2 md:py-4 px-2 md:px-8 text-center">
                    <StatusPill status={(acc.status as string) || "NOUV"} />
                  </td>
                  <td className="px-6 font-medium text-gray-900 text-center">
                    {acc.company}
                  </td>
                  <td className="px-6 whitespace-nowrap text-gray-700 text-center">
                    {acc.entryAt
                      ? new Date(acc.entryAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-6 whitespace-nowrap text-gray-700 text-center">
                    {acc.entryAt && acc.exitAt
                      ? (() => {
                          const d1 = new Date(acc.entryAt);
                          const d2 = new Date(acc.exitAt);
                          const ms = d2 - d1;
                          if (ms <= 0) return "-";
                          const min = Math.floor(ms / 60000) % 60;
                          const h = Math.floor(ms / 3600000);
                          return `${h}h ${min}min`;
                        })()
                      : "-"}
                  </td>
                  <td className="px-6 whitespace-nowrap text-gray-700 text-center">
                    {acc.exitAt
                      ? new Date(acc.exitAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-2 group">
                      <Link
                        href={buildLink(searchParams, currentPage, {
                          sel: String(acc.id),
                        })}
                        className="text-[#4F587E] hover:text-[#3B4252] p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
                      >
                        <Pencil size={18} color="#4F587E" />
                      </Link>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="text-red-400 hover:text-red-600 p-2 transition-all duration-200"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-gray-700 flex-shrink-0 border-t border-gray-300 rounded-b-2xl">
          <span className="font-medium">
            {filteredCount === 0
              ? 0
              : Math.min((currentPage - 1) * perPage + 1, filteredCount)}
            –{Math.min(currentPage * perPage, filteredCount)} sur{" "}
            {filteredCount}
          </span>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage === 1 ? (
                  <PaginationPrevious href="#" disabled />
                ) : (
                  <PaginationPrevious
                    href={buildLink(searchParams, currentPage - 1)}
                  />
                )}
              </PaginationItem>

              {/* pages */}
              {(() => {
                const pages: number[] = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4);
                    pages.push(-1);
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push(-1);
                    for (let i = totalPages - 3; i <= totalPages; i++)
                      pages.push(i);
                  } else {
                    pages.push(
                      1,
                      -1,
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      -1,
                      totalPages
                    );
                  }
                }
                return pages.map((p, idx) =>
                  p === -1 ? (
                    <PaginationItem key={`el-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={buildLink(searchParams, p)}
                        isActive={p === currentPage}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              })()}

              <PaginationItem>
                {currentPage === totalPages ? (
                  <PaginationNext href="#" disabled />
                ) : (
                  <PaginationNext
                    href={buildLink(searchParams, currentPage + 1)}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
