export default function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    { bg: string; text: string; full: string; short: string }
  > = {
    NOUVEAU: {
      bg: "bg-[#FFF1CC]",
      text: "text-[#FFAA00]",
      full: "Nouveau",
      short: "Nouv",
    },
    ATTENTE: {
      bg: "bg-[#CCE4FF]",
      text: "text-[#0079FF]",
      full: "Attente",
      short: "Att",
    },
    ENTREE: {
      bg: "bg-[#CCF4EF]",
      text: "text-[#009987]",
      full: "Entrée",
      short: "Ent",
    },
    SORTIE: {
      bg: "bg-[#DCDEE5]",
      text: "text-[#4F587E]",
      full: "Sortie",
      short: "Sort",
    },
    REFUS: {
      bg: "bg-[#FCCCCC]",
      text: "text-[#EE0000]",
      full: "Refusé",
      short: "Ref",
    },
    ABSENT: {
      bg: "bg-[#EADAFF]",
      text: "text-[#9747FF]",
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
      className={`inline-flex justify-center items-center min-w-[84px] h-6 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}
    >
      <span className="hidden lg:inline">{cfg.full}</span>
      <span className="inline lg:hidden">{cfg.short}</span>
    </span>
  );
}
