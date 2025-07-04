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
      bg: "bg-[#E0F7F4] border border-[#B2DFDB] shadow-sm",
      text: "text-[#4F587E]",
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
      className={`inline-flex justify-center items-center min-w-[90px] h-7 rounded-2xl text-xs font-medium px-4 py-1 ${cfg.bg} ${cfg.text}`}
      style={{ boxShadow: "0 1px 4px 0 rgba(79,88,126,0.07)" }}
    >
      <span className="hidden lg:inline">{cfg.full}</span>
      <span className="inline lg:hidden">{cfg.short}</span>
    </span>
  );
}
