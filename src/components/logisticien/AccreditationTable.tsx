"use client";

import Link from "next/link";
import { List, ChevronDown, Pencil, Trash2 } from "lucide-react";
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
    <div className="bg-gray-50 border border-gray-300 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-200px)]">
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
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="min-w-full text-xs md:text-base">
          <thead className="text-gray-800 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
            <tr>
              {[
                { key: "status", label: "Statut" },
                { key: "id", label: "#ID" },
                { key: "plate", label: "Plaque" },
                { key: "createdAt", label: "Date" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-2 md:px-6 py-2 md:py-4 font-semibold text-xs md:text-base first:pl-2 md:first:pl-8"
                >
                  <Link
                    href={buildLink(
                      {
                        ...searchParams,
                        sort: key,
                        dir: sort === key && dir === "asc" ? "desc" : "asc",
                      },
                      1
                    )}
                    className="flex items-center gap-2 hover:text-[#4F587E] transition-colors duration-200"
                  >
                    {label}
                    <ChevronDown
                      size={16}
                      className={`text-white/70 transition-transform duration-200 ${
                        sort === key && dir === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                </th>
              ))}
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {pageData.map((acc, idx) => (
              <tr
                key={`${acc.id}-${idx}`}
                className="hover:bg-gray-100 transition-all duration-200 border-b border-gray-200 group"
              >
                <td className="py-2 md:py-4 px-2 md:px-8">
                  <StatusPill status={(acc.status as string) || "NOUV"} />
                </td>
                <td className="px-6 whitespace-nowrap text-[#4F587E] font-semibold">
                  <Link
                    href={buildLink(searchParams, currentPage, {
                      sel: String(acc.id),
                    })}
                    className="hover:text-[#3B4252] transition-colors duration-200 font-medium"
                  >
                    #{acc.id}
                  </Link>
                </td>
                <td className="px-6 font-medium text-gray-900">
                  {acc.vehicles[0]?.plate ?? "-"}
                </td>
                <td className="px-6 whitespace-nowrap text-gray-700">
                  {acc.createdAt
                    ? new Date(acc.createdAt).toLocaleDateString("fr-FR")
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
          –{Math.min(currentPage * perPage, filteredCount)} sur {filteredCount}
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
  );
}
