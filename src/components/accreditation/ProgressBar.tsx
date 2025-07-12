"use client";

interface Props {
  current: number; // current step index starting at 1
  gotoStep: (n: number) => void;
}

const STEPS = [
  { icon: "image", label: "Ident." },
  { icon: "directions_car", label: "Véhicule" },
  { icon: "chat_bubble", label: "Msg" },
  { icon: "picture_as_pdf", label: "PDF" },
];

export default function ProgressBar({ current, gotoStep }: Props) {
  return (
    <div className="flex gap-3 mb-6 justify-center lg:justify-start">
      {STEPS.map(({ icon, label }, idx) => {
        const active = current === idx + 1;
        const done = current > idx + 1;
        // Couleurs user-friendly
        const bg = done
          ? "bg-[#D1FADF] border-[#A7F3D0]"
          : active
            ? "bg-[#E3EDFF] border-[#93C5FD]"
            : "bg-[#F3F4F6] border-[#D1D5DB]";
        const iconColor = done
          ? "text-[#16A34A]"
          : active
            ? "text-[#2563EB]"
            : "text-[#9CA3AF]";
        return (
          <button
            key={idx}
            onClick={() => gotoStep(idx + 1)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-colors duration-200 ${bg}`}
          >
            <span
              className={`material-icons text-base ${iconColor}`}
              aria-hidden
            >
              {icon}
            </span>
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
