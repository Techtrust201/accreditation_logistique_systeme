import Link from "next/link";

export interface FilterBarProps {
  searchParams: Record<string, string>;
  statusOptions: { value: string; label: string }[];
  showNewButton?: boolean;
}

export function FilterBar({
  searchParams,
  statusOptions,
  showNewButton = true,
}: FilterBarProps) {
  const { q = "", status = "", from = "", to = "" } = searchParams;
  return (
    <>
      {/* Mobile/tablette : card grise, labels, boutons larges, bouton nouvelle demande espacé */}
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
              className="w-full px-4 py-2 rounded-xl bg-[#4F587E] text-white font-bold shadow hover:bg-[#3B4252] transition text-base"
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
        {/* {showNewButton && (
          <Link
            href="/logisticien/nouveau?step=1"
            className="w-full max-w-full block px-4 py-3 rounded-2xl bg-[#4F587E] text-white font-bold text-base shadow hover:bg-[#3B4252] transition text-center flex items-center justify-center gap-2 overflow-hidden"
          >
            <Plus size={20} /> Nouvelle demande
          </Link>
        )} */}
      </div>
      {/* Desktop : disposition actuelle */}
      <form
        method="get"
        className="hidden sm:grid gap-2 md:flex md:flex-wrap md:items-end md:gap-3"
      >
        <input
          type="text"
          name="q"
          defaultValue={q as string}
          placeholder="Rechercher... (ID, plaque, statut, date)"
          className="w-full md:w-60 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="status"
          defaultValue={status as string}
          className="w-full md:w-auto px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            name="from"
            defaultValue={from as string}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="date"
            name="to"
            defaultValue={to as string}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          Filtrer
        </button>
        <Link
          href="/logisticien"
          className="px-4 py-2 rounded border text-primary hover:bg-primary/10 transition-colors text-center"
        >
          Réinitialiser
        </Link>
        {showNewButton && (
          <Link
            href="/logisticien/nouveau?step=1"
            className="ml-4 px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary-dark hidden md:inline-block"
          >
            Nouvelle demande
          </Link>
        )}
      </form>
    </>
  );
}
