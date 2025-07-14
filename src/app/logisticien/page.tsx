import { readAccreditations } from "@/lib/store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FilterBar } from "@/components/logisticien/FilterBar";
import AccreditationTable from "@/components/logisticien/AccreditationTable";
import { buildLink } from "@/lib/url";
import AccreditationFormCard from "@/components/logisticien/AccreditationFormCard";
import type { SortDirection } from "@/components/ui/table";

/* ---------- Page Dashboard ---------- */
export default async function LogisticienDashboard(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  // Next.js 15 : searchParams est une Promise → on attend son résultat.
  const paramsObj = await searchParams;
  const data = await readAccreditations();

  const {
    q = "",
    status = "",
    from = "",
    to = "",
    page = "1",
    sort = "createdAt",
    dir = "desc",
    sel = "",
  } = paramsObj;

  // --- Filtering ---
  let filtered = data;

  if (status && status !== "all") {
    filtered = filtered.filter((acc) => (acc.status as string) === status);
  }

  const hasFrom = Boolean(from);
  const hasTo = Boolean(to);

  if (hasFrom || hasTo) {
    const fromDate = hasFrom ? new Date(from) : new Date(0);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = hasTo ? new Date(to) : new Date(8640000000000000); // max date
    toDate.setHours(23, 59, 59, 999);

    // swap if user inverted
    const [start, end] =
      fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate];

    filtered = filtered.filter((acc) => {
      if (!acc.createdAt) return false;
      const d = new Date(acc.createdAt);
      return d >= start && d <= end;
    });
  }

  if (q.trim()) {
    const query = q.trim().toLowerCase();
    filtered = filtered.filter((acc) => {
      const idMatch = String(acc.id).includes(query);
      const plateMatch = acc.vehicles?.[0]?.plate
        ?.toLowerCase()
        .includes(query);
      const statusMatch = (acc.status as string).toLowerCase().includes(query);
      const dateMatch = acc.createdAt
        ? new Date(acc.createdAt)
            .toLocaleDateString("fr-FR")
            .toLowerCase()
            .includes(query)
        : false;
      return idMatch || plateMatch || statusMatch || dateMatch;
    });
  }

  // --- Sorting ---
  const validSortKeys = [
    "status",
    "id",
    "createdAt",
    "company",
    "stand",
    "event",
    "entryAt",
    "exitAt",
    "duration",
  ] as const;
  const sortKey = (validSortKeys as readonly string[]).includes(sort)
    ? (sort as (typeof validSortKeys)[number])
    : "createdAt";
  const direction = dir === "asc" ? 1 : -1;

  filtered.sort((a, b) => {
    let aVal: string | number | Date | undefined;
    let bVal: typeof aVal;

    switch (sortKey) {
      case "status":
        aVal = (a.status as string) ?? "";
        bVal = (b.status as string) ?? "";
        break;
      case "id":
        aVal = a.id;
        bVal = b.id;
        break;
      case "company":
        aVal = (a.company as string) ?? "";
        bVal = (b.company as string) ?? "";
        break;
      case "stand":
        aVal = (a.stand as string) ?? "";
        bVal = (b.stand as string) ?? "";
        break;
      case "event":
        aVal = (a.event as string) ?? "";
        bVal = (b.event as string) ?? "";
        break;
      case "entryAt":
        aVal = a.entryAt ? new Date(a.entryAt) : new Date(0);
        bVal = b.entryAt ? new Date(b.entryAt) : new Date(0);
        break;
      case "exitAt":
        aVal = a.exitAt ? new Date(a.exitAt) : new Date(0);
        bVal = b.exitAt ? new Date(b.exitAt) : new Date(0);
        break;
      case "duration":
        // Calcul de la durée en millisecondes
        const getDuration = (acc: typeof a) => {
          if (!acc.entryAt || !acc.exitAt) return 0;
          return (
            new Date(acc.exitAt).getTime() - new Date(acc.entryAt).getTime()
          );
        };
        aVal = getDuration(a);
        bVal = getDuration(b);
        break;
      default:
        // createdAt
        aVal = a.createdAt ? new Date(a.createdAt) : new Date(0);
        bVal = b.createdAt ? new Date(b.createdAt) : new Date(0);
    }

    if (aVal === undefined || bVal === undefined) return 0;

    if (aVal < bVal) return -1 * direction;
    if (aVal > bVal) return 1 * direction;
    return 0;
  });

  // --- Pagination ---
  const perPage = 15;
  const currentPage = Math.max(1, Number(page));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  if (currentPage > totalPages) {
    redirect(buildLink(paramsObj, totalPages));
  }

  const sliceStart = (currentPage - 1) * perPage;
  const pageData = filtered.slice(sliceStart, sliceStart + perPage);

  // ---- Selected accreditation ----
  let selected = filtered.find((a) => String(a.id) === sel);
  if (!selected) {
    selected = pageData[0] ?? filtered[0];
  }

  const statusOptions = [
    { value: "", label: "Tous statuts" },
    { value: "NOUVEAU", label: "Nouveau" },
    { value: "ATTENTE", label: "Attente" },
    { value: "ENTREE", label: "Entrée" },
    { value: "SORTIE", label: "Sortie" },
    { value: "REFUS", label: "Refusé" },
    { value: "ABSENT", label: "Absent" },
  ];

  return (
    <div className="h-screen flex flex-col ">
      {/* Header fixe */}
      <div className="flex-shrink-0 p-2">
        <div className="flex justify-between items-center">
          <FilterBar searchParams={paramsObj} statusOptions={statusOptions} />
          <Link
            href="/logisticien/nouveau?step=1"
            className="px-4 py-2 bg-[#4F587E] text-white rounded-lg text-sm hover:bg-[#3B4252] transition-colors duration-200 font-medium"
          >
            Nouvelle demande
          </Link>
        </div>
      </div>

      {/* Contenu fixe */}
      <div className="flex-1 px-8 pb-8">
        <div className="grid md:grid-cols-2 gap-8 h-full">
          <AccreditationTable
            pageData={pageData}
            currentPage={currentPage}
            totalPages={totalPages}
            filteredCount={filtered.length}
            perPage={perPage}
            searchParams={paramsObj}
            sort={sortKey}
            dir={dir as SortDirection}
          />

          <div className="hidden md:block">
            {selected && (
              <AccreditationFormCard key={selected.id} acc={selected} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
