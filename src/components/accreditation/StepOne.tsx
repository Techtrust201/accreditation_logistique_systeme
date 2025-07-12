"use client";
import { useEffect } from "react";
import Image from "next/image";

type EventKey = "festival" | "miptv" | "mipcom";

interface Data {
  company: string;
  stand: string;
  unloading: string;
  event: string;
}

interface Props {
  data: Data;
  update: (patch: Partial<Data>) => void;
  onValidityChange: (v: boolean) => void;
}

const EVENTS: Record<EventKey, { label: string; logo: string }> = {
  festival: {
    label: "Festival du Film",
    logo: "/accreditation/pict_page1/festival.png",
  },
  miptv: {
    label: "MIPTV",
    logo: "/accreditation/pict_page1/miptv.jpg",
  },
  mipcom: {
    label: "MIPCOM",
    logo: "/accreditation/pict_page1/mipcom.jpg",
  },
};

export default function StepOne({ data, update, onValidityChange }: Props) {
  const { company, stand, unloading, event } = data;

  const missingCompany = !company.trim();
  const missingStand = !stand.trim();
  const missingUnload = !unloading;

  const isValid = !!(company && stand && unloading && event);

  useEffect(() => onValidityChange(isValid), [isValid, onValidityChange]);

  return (
    <div className="flex flex-col w-full ">
      <div className="flex-1 p-0 sm:p-0 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4">Identification</h2>
          {/* Inputs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Entreprise */}
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <label
                htmlFor="company"
                className="text-sm font-semibold text-gray-700"
              >
                Nom de l&apos;entreprise
              </label>
              <input
                id="company"
                value={company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder="Nom de l'entreprise"
                className={`w-full rounded-md px-3 py-2 shadow-sm focus:ring-primary focus:border-primary ${
                  missingCompany ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {/* Stand */}
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <label
                htmlFor="stand"
                className="text-sm font-semibold text-gray-700"
              >
                Stand desservi
              </label>
              <input
                id="stand"
                value={stand}
                onChange={(e) => update({ stand: e.target.value })}
                placeholder="Nom du stand"
                className={`w-full rounded-md px-3 py-2 shadow-sm focus:ring-primary focus:border-primary ${
                  missingStand ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {/* Déchargement */}
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <label
                htmlFor="unloading"
                className="text-sm font-semibold text-gray-700"
              >
                Déchargement par
              </label>
              <select
                id="unloading"
                value={unloading}
                onChange={(e) => update({ unloading: e.target.value })}
                className={`w-full rounded-md px-3 py-2 shadow-sm bg-white focus:ring-primary focus:border-primary ${
                  missingUnload ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Choisir un prestataire
                </option>
                <option value="Palais">Palais</option>
                <option value="SVMM">SVMM</option>
                <option value="Autonome">Autonome</option>
              </select>
            </div>
          </div>

          {/* Events */}
          <p className="text-sm font-medium mb-2">
            Sélectionnez un évènement :
          </p>
          <div className="flex gap-4 flex-wrap mb-8">
            {Object.entries(EVENTS).map(([key, { label, logo }]) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ event: key as string })}
                className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-1 w-28 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  event === key
                    ? "border-primary bg-gray-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className="bg-white shadow-md rounded flex items-center justify-center p-2 mb-1 w-full h-16">
                  <Image
                    src={logo}
                    alt={label}
                    width={48}
                    height={32}
                    className="object-contain w-12 h-8"
                  />
                </div>
                <span className="text-xs text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {!isValid && (
          <p className="text-red-500 text-sm mt-2">
            Complétez tous les champs obligatoires pour continuer.
          </p>
        )}
      </div>
    </div>
  );
}
