"use client";
import { useState, useEffect } from "react";
import VehicleForm from "./VehicleForm";
import type { Vehicle } from "@/types";

interface Props {
  data: Vehicle[];
  update: (v: Vehicle[]) => void;
  onValidityChange: (v: boolean) => void;
}

export default function StepTwo({ data, update, onValidityChange }: Props) {
  // track validity map
  const [validMap, setValidMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const allOk = data.length > 0 && data.every((v) => validMap[v.id]);
    onValidityChange(allOk);
  }, [validMap, data, onValidityChange]);

  function patch(id: number, patch: Partial<Vehicle>) {
    update(data.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function addVehicle() {
    const newV: Vehicle = {
      id: Date.now(),
      plate: "",
      size: "",
      phoneCode: "+33",
      phoneNumber: "",
      date: "",
      time: "",
      city: "",
      unloading: "",
    };
    update([...data, newV]);
  }
  function removeVehicle(id: number) {
    update(data.filter((v) => v.id !== id));
    setValidMap((m) => {
      const copy = { ...m };
      delete copy[id];
      return copy;
    });
  }

  return (
    <div className="space-y-6">
      {data.map((v, idx) => {
        const HeaderContent = (
          <span className="font-bold">Véhicule {idx + 1}</span>
        );

        // Toujours un dropdown pour cohérence UI
        return (
          <details key={v.id} className="border-b pb-2 group" open>
            <summary className="cursor-pointer py-3 px-4 select-none flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-md">
              {HeaderContent}
              <div className="flex items-center gap-2">
                {data.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeVehicle(v.id);
                    }}
                    className="text-red-600 p-1 hover:bg-red-50 rounded-full"
                    aria-label="Supprimer le véhicule"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V3h3.75a.75.75 0 010 1.5H18l-.528 11.056A2.25 2.25 0 0115.224 17.75H8.776a2.25 2.25 0 01-2.247-2.194L6 4.5H3.75a.75.75 0 010-1.5H7.5v-.75zM8.25 7.5a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6zm4.5 0a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <div className="w-6 h-6 flex items-center justify-center rounded-full border bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </summary>
            <div className="pt-4 pb-6 space-y-4">
              <VehicleForm
                data={v}
                update={(p) => patch(v.id, p)}
                onValidityChange={(ok) =>
                  setValidMap((m) => ({ ...m, [v.id]: ok }))
                }
              />
            </div>
          </details>
        );
      })}

      <button
        onClick={addVehicle}
        className="px-4 py-2 border rounded text-sm flex items-center gap-2"
      >
        <img
          src="/accreditation/pict_page2/Vector (4).svg"
          className="w-4 h-4"
        />{" "}
        + Ajouter
      </button>
    </div>
  );
}
