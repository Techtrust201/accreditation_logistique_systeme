"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import StepOne from "@/components/accreditation/StepOne";
import StepTwo from "@/components/accreditation/StepTwo";
import StepThree from "@/components/accreditation/StepThree";
import StepFour from "@/components/accreditation/StepFour";
import { useState, useEffect } from "react";
import type { Vehicle } from "@/types";

export default function AccreditationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = Number(searchParams.get("step") ?? "1");

  const [stepValid, setStepValid] = useState(false);

  // utilitaires de persistance
  function safeLoad<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined") {
      localStorage.removeItem(key);
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  }

  function defaultVehicle(): Vehicle {
    return {
      id: 1,
      plate: "",
      size: "",
      phoneCode: "+33",
      phoneNumber: "",
      date: "",
      time: "",
      city: "",
      unloading: "",
    };
  }

  // 1. Définir les états par objet pour chaque étape
  const [stepOneData, setStepOneData] = useState({
    company: "",
    stand: "",
    unloading: "",
    event: "",
  });
  const [vehicle, setVehicle] = useState<Vehicle>(defaultVehicle());
  const [stepThreeData, setStepThreeData] = useState({
    message: "",
    consent: false,
  });

  // 2. Fonctions de patch partiel pour chaque objet
  const patchStepOne = (patch: Partial<typeof stepOneData>) =>
    setStepOneData((prev) => ({ ...prev, ...patch }));
  const patchStepThree = (patch: Partial<typeof stepThreeData>) =>
    setStepThreeData((prev) => ({ ...prev, ...patch }));

  // hydrate from localStorage after mount
  useEffect(() => {
    setStepOneData(safeLoad("acc_step1", stepOneData));
    setVehicle(safeLoad<Vehicle>("acc_vehicle", vehicle));
    setStepThreeData(safeLoad("acc_step3", stepThreeData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reset validity when step changes
  useEffect(() => {
    setStepValid(false);
  }, [step]);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem("acc_step1", JSON.stringify(stepOneData));
  }, [stepOneData]);

  useEffect(() => {
    localStorage.setItem("acc_vehicle", JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem("acc_step3", JSON.stringify(stepThreeData));
  }, [stepThreeData]);

  function gotoStep(n: number) {
    router.push(`/accreditation?step=${n}`);
  }

  function resetAll() {
    setStepOneData({ company: "", stand: "", unloading: "", event: "" });
    setVehicle(defaultVehicle());
    setStepThreeData({ message: "", consent: false });
    localStorage.removeItem("acc_step1");
    localStorage.removeItem("acc_vehicle");
    localStorage.removeItem("acc_step3");
    gotoStep(1);
  }

  return (
    <div
      className="min-h-screen flex flex-col text-gray-900"
      style={{
        background: "linear-gradient(#353c52 0 50%, #ffffff 0 100%)",
      }}
    >
      {/* Header bandeau bleu */}
      {/* <header className="px-4 flex flex-col items-center text-white gap-1">
        <h1 className="text-4xl font-bold">Demande d&apos;accréditation</h1>
        <p className="text-lg opacity-80">
          Suivez les étapes pour réaliser votre demande
        </p>
      </header> */}

      <main className="mb-48 flex-1 flex flex-col justify-evenly items-center px-4 sm:px-6 lg:px-8">
        <div className="px-4 flex flex-col items-center text-white gap-1">
          <h1 className="text-4xl font-bold">Demande d&apos;accréditation</h1>
          <p className="text-lg opacity-80">
            Suivez les étapes pour réaliser votre demande
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-11/12 lg:w-3/4 lg:max-h-[65vh]">
          {/* Static Image */}
          <div
            className={`relative lg:w-[35%] h-80 ${
              step === 2 ? "lg:h-full" : "lg:h-auto"
            } p-6 hidden lg:block`}
          >
            {/* <img
              src="/accreditation/pict_page1/palais.jpg"
              alt="Palais des Festivals"
              className="object-cover grayscale contrast-125 rounded-lg w-full h-full"
            /> */}
            <Image
              src="/accreditation/pict_page1/palais.jpg"
              alt="Palais des Festivals"
              width={1000}
              height={100}
              // fill       // l’image occupe tout le conteneur
              className="object-cover grayscale contrast-125 rounded-lg w-full h-full"
            />
          </div>

          {/* Right side */}
          <div className={`flex-1 p-8 sm:p-7 flex flex-col`}>
            {/* Progress bar */}
            <div className="flex items-center mb-6 w-full max-w-md mx-auto">
              {Array.from({ length: 4 }).map((_, idx) => {
                const active = step === idx + 1;
                const done = step > idx + 1;
                const svgPath = `/accreditation/progressbar/Vector${
                  idx === 0 ? "" : ` (${idx})`
                }.svg`;

                return (
                  <div key={idx} className="flex items-center gap-0.5 flex-1">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                        done
                          ? "bg-[#3DAAA4] border-[#3DAAA4]"
                          : active
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-300"
                      }`}
                    >
                      <Image
                        src={svgPath}
                        alt={`step ${idx + 1}`}
                        width={20}
                        height={20}
                      />
                    </div>
                    {idx < 3 && (
                      <div
                        className={`flex-1 h-1 ${
                          step > idx + 1 ? "bg-[#3DAAA4]" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zone scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {step === 1 && (
                <StepOne
                  data={stepOneData}
                  update={patchStepOne}
                  onValidityChange={setStepValid}
                />
              )}
              {step === 2 && (
                <StepTwo
                  data={vehicle}
                  update={(patch) => setVehicle((v) => ({ ...v, ...patch }))}
                  onValidityChange={setStepValid}
                />
              )}
              {step === 3 && (
                <StepThree
                  data={stepThreeData}
                  update={patchStepThree}
                  onValidityChange={setStepValid}
                />
              )}
              {step === 4 && (
                <StepFour
                  data={{
                    ...stepOneData,
                    ...stepThreeData,
                    vehicles: [vehicle],
                  }}
                  onReset={resetAll}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 shrink-0">
              {step > 1 ? (
                <button
                  onClick={() => gotoStep(step - 1)}
                  className="px-4 py-2 border rounded"
                >
                  Retour
                </button>
              ) : (
                <span />
              )}

              {step < 4 && (
                <button
                  onClick={() => gotoStep(step + 1)}
                  disabled={!stepValid}
                  className="px-6 py-2 rounded bg-[#353c52] text-white disabled:opacity-50 hover:bg-primary-dark"
                >
                  Suivant
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full py-3 px-6 bg-[#353c52] flex items-center shadow-md">
        <Link href="/" className="text-white text-sm hover:underline">
          &lt; Sortir
        </Link>
      </footer>
    </div>
  );
}
