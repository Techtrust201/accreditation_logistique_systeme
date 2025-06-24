"use client";
import { useEffect } from "react";

interface Data {
  message: string;
  consent: boolean;
}

interface Props {
  data: Data;
  update: (patch: Partial<Data>) => void;
  onValidityChange: (v: boolean) => void;
}

export default function StepThree({ data, update, onValidityChange }: Props) {
  const { message, consent } = data;

  const valid = consent; // message optionnel
  useEffect(() => onValidityChange(valid), [valid, onValidityChange]);

  return (
    <div className="flex flex-col w-full lg:min-h-[560px]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <img
            src="/accreditation/progressbar/Vector (2).svg"
            alt="Message"
            className="w-5 h-5"
          />
          <h2 className="text-lg font-bold">Message</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">&bull; Optionnel</p>

        <label htmlFor="msg" className="text-sm font-medium block mb-1">
          Votre message
        </label>
        <textarea
          id="msg"
          rows={4}
          value={message}
          onChange={(e) => update({ message: e.target.value })}
          placeholder="Écrivez ici..."
          className="w-full border border-[#C6C6C6] rounded-md px-3 py-2 focus:ring-primary focus:border-primary mb-4"
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => update({ consent: e.target.checked })}
            className="accent-primary"
          />
          Je consens à la politique de confidentialité
        </label>
      </div>
    </div>
  );
}
