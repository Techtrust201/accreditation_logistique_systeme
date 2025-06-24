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
        return (
          <button
            key={idx}
            onClick={() => gotoStep(idx + 1)}
            className={`w-9 h-9 rounded border flex items-center justify-center text-sm transition-colors ${
              active
                ? "bg-primary text-white"
                : done
                ? "bg-green-500 text-white"
                : "bg-white border-gray-300 text-gray-600"
            }`}
          >
            <span className="material-icons text-base" aria-hidden>
              {icon}
            </span>
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
