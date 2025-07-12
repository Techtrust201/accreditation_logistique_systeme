import Link from "next/link";
import { Pencil, Trash2, Building2, Calendar, Car, Clock } from "lucide-react";
import StatusPill from "./StatusPill";
import type { Accreditation } from "@/types";

interface MobileAccreditationListProps {
  pageData: Accreditation[];
  onDelete: (id: string) => void;
}

export default function MobileAccreditationList({
  pageData,
  onDelete,
}: MobileAccreditationListProps) {
  return (
    <div className="block sm:hidden w-full space-y-4 overflow-x-hidden pb-20">
      {pageData.map((acc) => (
        <div
          key={acc.id}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-xl transition-all duration-200"
        >
          {/* Header avec statut et date */}
          <div className="flex items-center justify-between">
            <StatusPill status={acc.status as string} />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} />
              <span>
                {acc.createdAt
                  ? new Date(acc.createdAt).toLocaleDateString("fr-FR")
                  : "-"}
              </span>
            </div>
          </div>

          {/* Informations principales */}
          <div className="space-y-3">
            {/* Société */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Société
                </span>
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {acc.company}
                </p>
              </div>
            </div>

            {/* Véhicules */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Car size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Véhicules
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {acc.vehicles && acc.vehicles.length > 0 ? (
                    <>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {acc.vehicles[0].plate}
                      </span>
                      {acc.vehicles.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{acc.vehicles.length - 1}
                        </span>
                      )}
                      {acc.vehicles.length === 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {acc.vehicles[1].plate}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Aucun véhicule
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Heures si disponibles */}
            {(acc.entryAt || acc.exitAt) && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock size={16} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Horaires
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {acc.entryAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Entrée:{" "}
                        {new Date(acc.entryAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {acc.exitAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Sortie:{" "}
                        {new Date(acc.exitAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link
              href={`/logisticien/${acc.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow-lg hover:bg-[#3B4252] transition-all duration-200 text-sm"
            >
              <Pencil size={16} />
              Éditer
            </Link>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold shadow-lg hover:bg-red-100 transition-all duration-200 text-sm border border-red-200"
              onClick={() => onDelete(acc.id)}
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
