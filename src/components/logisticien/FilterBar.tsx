import Link from "next/link";

export interface FilterBarProps {
  searchParams: Record<string, string>;
  statusOptions: { value: string; label: string }[];
}

export function FilterBar({ searchParams, statusOptions }: FilterBarProps) {
  const { q = "", status = "", from = "", to = "" } = searchParams;
  return (
    <form
      method="get"
      className="grid gap-2 md:flex md:flex-wrap md:items-end md:gap-3"
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
    </form>
  );
}
