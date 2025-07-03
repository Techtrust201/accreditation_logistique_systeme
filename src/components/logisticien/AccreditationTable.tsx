import Link from "next/link";
import { List, ChevronDown, Pencil } from "lucide-react";
import { buildLink } from "@/lib/url";
import StatusPill from "./StatusPill";
import type { Accreditation } from "@/types";

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
  return (
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
              {[
                { key: "status", label: "Statut" },
                { key: "id", label: "#ID" },
                { key: "plate", label: "Plaque" },
                { key: "createdAt", label: "Date" },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-2 font-medium first:p-4">
                  <Link
                    href={buildLink(
                      {
                        ...searchParams,
                        sort: key,
                        dir: sort === key && dir === "asc" ? "desc" : "asc",
                      },
                      1
                    )}
                    className="flex items-center gap-1 hover:underline"
                  >
                    {label}
                    {key === "createdAt" ? null : null}
                    <ChevronDown
                      size={12}
                      className={`text-[#4F587E] transition-transform ${
                        sort === key && dir === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {pageData.map((acc, idx) => (
              <tr key={`${acc.id}-${idx}`} className="hover:bg-gray-50">
                <td className="py-2 px-4">
                  <StatusPill status={(acc.status as string) || "NOUV"} />
                </td>
                <td className="px-4 whitespace-nowrap">
                  <Link
                    href={buildLink(searchParams, currentPage, {
                      sel: String(acc.id),
                    })}
                    className="hover:underline text-primary"
                  >
                    #{acc.id}
                  </Link>
                </td>
                <td className="px-4">{acc.vehicles[0]?.plate ?? "-"}</td>
                <td className="px-4 whitespace-nowrap">
                  {acc.createdAt
                    ? new Date(acc.createdAt).toLocaleDateString("fr-FR")
                    : "-"}
                </td>
                <td className="px-4 text-right">
                  <Link
                    href={buildLink(searchParams, currentPage, {
                      sel: String(acc.id),
                    })}
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

      {/* Pagination */}
      <div className="px-4 py-2 bg-gray-50 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-gray-500">
        <span>
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
