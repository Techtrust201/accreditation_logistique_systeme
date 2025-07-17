import Link from "next/link";
import { Search, Filter, Calendar, X } from "lucide-react";

export interface FilterBarProps {
  searchParams: Record<string, string>;
  statusOptions: { value: string; label: string }[];
}

export function FilterBar({ searchParams, statusOptions }: FilterBarProps) {
  const { q = "", status = "", from = "", to = "" } = searchParams;

  return (
    <>
      {/* Mobile/tablette : card grise, labels, boutons larges */}
      <div className="block sm:hidden w-full pb-10">
        <div className="bg-gray-50 rounded-2xl shadow p-4 mb-4 border border-gray-100">
          <form method="get" className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="q"
                className="text-xs font-semibold text-gray-700"
              >
                Recherche
              </label>
              <input
                id="q"
                type="text"
                name="q"
                defaultValue={q as string}
                placeholder="ID, plaque, statut, date..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="status"
                className="text-xs font-semibold text-gray-700"
              >
                Statut
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status as string}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 w-1/2">
                <label
                  htmlFor="from"
                  className="text-xs font-semibold text-gray-700"
                >
                  Début
                </label>
                <input
                  id="from"
                  type="date"
                  name="from"
                  defaultValue={from as string}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label
                  htmlFor="to"
                  className="text-xs font-semibold text-gray-700"
                >
                  Fin
                </label>
                <input
                  id="to"
                  type="date"
                  name="to"
                  defaultValue={to as string}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-[#4F587E] text-white font-bold shadow hover:bg-[#3B4252] transition-colors text-base"
            >
              Filtrer
            </button>
            <Link
              href="/logisticien"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors text-center text-base font-semibold"
            >
              Réinitialiser
            </Link>
          </form>
        </div>
        {/* SUPPRESSION du bouton Nouvelle demande mobile */}
      </div>

      {/* Desktop : Version moderne et user-friendly */}
      <div className="hidden sm:block w-full mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <form method="get" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800">
                  Filtres de recherche
                </h2>
              </div>
              {/* SUPPRESSION du bouton Nouvelle demande desktop */}
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Rechercher par ID, plaque, statut, date..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Statut
                </label>
                <select
                  name="status"
                  defaultValue={status}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-gray-50"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Date de début
                </label>
                <input
                  type="date"
                  name="from"
                  defaultValue={from}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Date de fin
                </label>
                <input
                  type="date"
                  name="to"
                  defaultValue={to}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-gray-50"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F587E] text-white font-semibold rounded-xl hover:bg-[#3B4252] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Filter className="w-4 h-4" />
                Appliquer les filtres
              </button>
              <Link
                href="/logisticien"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
