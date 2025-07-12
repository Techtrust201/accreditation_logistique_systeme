"use client";
import { useEffect } from "react";
import VehicleForm from "./VehicleForm";
import type { Vehicle } from "@/types";

interface Props {
  data: Vehicle;
  update: (v: Vehicle) => void;
  onValidityChange: (v: boolean) => void;
}

export default function StepTwo({ data, update, onValidityChange }: Props) {
  useEffect(() => {
    const valid =
      !!data.plate &&
      !!data.size &&
      !!data.phoneNumber &&
      !!data.date &&
      !!data.city &&
      !!data.unloading;
    onValidityChange(valid);
  }, [data, onValidityChange]);

  return (
    <div>
      <VehicleForm
        data={data}
        update={(patch) => update({ ...data, ...patch })}
        onValidityChange={onValidityChange}
      />
    </div>
  );
}
