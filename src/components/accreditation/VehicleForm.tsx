"use client";
import { useEffect, useId } from "react";
import type { Vehicle } from "@/types";
import CityAutocomplete from "@/components/CityAutocomplete";
import Image from "next/image";

interface Props {
  data: Vehicle;
  update: (patch: Partial<Vehicle>) => void;
  onValidityChange: (v: boolean) => void;
}

const SIZE_OPTIONS = [
  {
    value: "-10",
    label: "- de 10 m3",
    icon: "/accreditation/pict_page2/Vector (6).svg",
  },
  {
    value: "10-14",
    label: "10 m3 - 14 m3",
    icon: "/accreditation/pict_page2/Vector (7).svg",
  },
  {
    value: "15-20",
    label: "15 m3 - 20 m3",
    icon: "/accreditation/pict_page2/Vector (8).svg",
  },
  {
    value: "+20",
    label: "+ de 20 m3",
    icon: "/accreditation/pict_page2/Vector (9).svg",
  },
];

export default function VehicleForm({ data, update, onValidityChange }: Props) {
  const uid = useId();
  const valid =
    (data.plate ?? "").trim() &&
    (data.size ?? "").trim() &&
    (data.phoneNumber ?? "").trim() &&
    (data.date ?? "").trim() &&
    (data.city ?? "").trim() &&
    Array.isArray(data.unloading) &&
    data.unloading.length > 0;

  // onValidityChange est stable du point de vue logique ;
  // l'omettre des dépendances évite que le hook se déclenche à chaque nouveau render
  // car StepTwo recrée une nouvelle fonction à chaque fois.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onValidityChange(!!valid), [valid]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 p-1 min-w-0">
        {/* Plaque */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Group 1.svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="Plaque"
            />{" "}
            Plaque
          </label>
          <input
            value={data.plate ?? ""}
            onChange={(e) => update({ plate: e.target.value })}
            placeholder="XX-123-YY"
            className={`w-full rounded-md px-3 py-1.5 text-sm shadow-sm focus:ring-primary focus:border-primary ${
              !data.plate ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {/* Taille */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Vector (14).svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="Taille du véhicule"
            />{" "}
            Taille du véhicule
          </label>
          <select
            value={data.size ?? ""}
            onChange={(e) =>
              update({ size: e.target.value as Vehicle["size"] })
            }
            className={`w-full rounded-md px-3 py-1.5 text-sm shadow-sm bg-white focus:ring-primary focus:border-primary ${
              !data.size ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Choisir une taille</option>
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {/* Téléphone */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Vector (15).svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="N° du conducteur"
            />{" "}
            N° du conducteur
          </label>
          <div className="flex gap-2">
            <select
              value={data.phoneCode}
              onChange={(e) => update({ phoneCode: e.target.value })}
              className="max-w-16 rounded-md px-2 py-1.5 text-sm shadow-sm bg-white border-gray-300 focus:ring-primary focus:border-primary flex-shrink-0"
            >
              {["+33", "+32", "+41", "+34"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="tel"
              value={data.phoneNumber ?? ""}
              onChange={(e) =>
                update({ phoneNumber: e.target.value.replace(/\D/g, "") })
              }
              placeholder="0912345678"
              className={`w-full flex-1 min-w-0 rounded-md px-3 py-1.5 text-sm shadow-sm focus:ring-primary focus:border-primary ${
                !data.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </div>
        {/* Date */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Vector (10).svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="Date d'arrivée"
            />{" "}
            Date d&apos;arrivée
          </label>
          <input
            type="date"
            value={data.date ?? ""}
            onChange={(e) => update({ date: e.target.value })}
            className={`w-full rounded-md px-3 py-1.5 text-sm shadow-sm focus:ring-primary focus:border-primary ${
              !data.date ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {/* Time */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Vector (11).svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="Heure d'arrivée"
            />{" "}
            Heure d&apos;arrivée
            <span className="font-normal text-xs text-gray-500">
              (optionnel)
            </span>
          </label>
          <select
            value={data.time}
            onChange={(e) => update({ time: e.target.value })}
            className="w-full rounded-md px-3 py-1.5 text-sm shadow-sm bg-white border-gray-300 focus:ring-primary focus:border-primary"
          >
            <option value="">--:--</option>
            {Array.from({ length: 48 }).map((_, i) => {
              const hh = String(Math.floor(i / 2)).padStart(2, "0");
              const mm = i % 2 === 0 ? "00" : "30";
              const val = `${hh}:${mm}`;
              return (
                <option key={val} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
        {/* City */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-semibold flex items-center gap-1 mb-1">
            <Image
              src="/accreditation/pict_page2/Vector (13).svg"
              width={16}
              height={16}
              className="w-4 h-4"
              alt="Ville de départ"
            />{" "}
            Ville de départ
          </label>
          <CityAutocomplete
            value={data.city ?? ""}
            onChange={(v) => update({ city: v })}
            className={`w-full rounded-md px-3 py-1.5 text-sm shadow-sm focus:ring-primary focus:border-primary ${
              !data.city ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {/* Km supprimé */}
      </div>

      {/* Unloading */}
      <div>
        <p className="text-sm font-semibold mb-2">Déchargement</p>
        <div className="flex gap-6 items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={`unload-arr-${uid}`}
              value="arr"
              checked={data.unloading.includes("arr")}
              onChange={(e) => {
                if (e.target.checked) {
                  update({
                    unloading: Array.from(
                      new Set([...(data.unloading || []), "arr"])
                    ),
                  });
                } else {
                  update({
                    unloading: (data.unloading || []).filter(
                      (u) => u !== "arr"
                    ),
                  });
                }
              }}
            />
            <Image
              src="/accreditation/pict_page2/Vector (5).svg"
              width={24}
              height={24}
              className="w-7 h-6"
              alt="Arrière"
            />{" "}
            Arrière
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={`unload-lat-${uid}`}
              value="lat"
              checked={data.unloading.includes("lat")}
              onChange={(e) => {
                if (e.target.checked) {
                  update({
                    unloading: Array.from(
                      new Set([...(data.unloading || []), "lat"])
                    ),
                  });
                } else {
                  update({
                    unloading: (data.unloading || []).filter(
                      (u) => u !== "lat"
                    ),
                  });
                }
              }}
            />
            <Image
              src="/accreditation/pict_page2/Vector (4).svg"
              width={24}
              height={24}
              className="w-6 h-6"
              alt="Latéral"
            />{" "}
            Latéral
          </label>
        </div>
      </div>
    </div>
  );
}
