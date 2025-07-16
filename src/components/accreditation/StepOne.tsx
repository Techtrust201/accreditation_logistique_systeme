"use client";
import { useEffect } from "react";
import React from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

const EVENTS = [
  {
    key: "festival",
    label: "Festival du Film",
    logo: "/accreditation/pict_page1/festival.png",
  },
  {
    key: "miptv",
    label: "MIPTV",
    logo: "/accreditation/pict_page1/miptv.jpg",
  },
  {
    key: "mipcom",
    label: "MIPCOM",
    logo: "/accreditation/pict_page1/mipcom.jpg",
  },
  {
    key: "plages",
    label: "Plages Électroniques",
    logo: "/accreditation/pict_page1/plages-electro.png",
  },
  {
    key: "palais",
    label: "Palais des Festivals",
    logo: "/accreditation/pict_page1/palais-des-festivals.png",
  },
];

export default function StepOne({ data, update, onValidityChange }: Props) {
  const { company, stand, unloading, event } = data;

  const isValid = !!(company && stand && unloading && event);

  useEffect(() => onValidityChange(isValid), [isValid, onValidityChange]);

  // Carousel state
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null
  );
  const [currentIdx, setCurrentIdx] = React.useState(0);

  React.useEffect(() => {
    if (!carouselApi) return;
    const updateIdx = () => setCurrentIdx(carouselApi.selectedScrollSnap());
    carouselApi.on("select", updateIdx);
    updateIdx();
    return () => {
      carouselApi.off("select", updateIdx);
    };
  }, [carouselApi]);

  React.useEffect(() => {
    // Quand on change de slide, on update le champ event
    update({ event: EVENTS[currentIdx].key });
    // eslint-disable-next-line
  }, [currentIdx]);

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
                className={cn(
                  "w-full rounded-md px-3 py-2 shadow-sm focus:ring-primary focus:border-primary",
                  !company.trim() ? "border-red-500" : "border-gray-300"
                )}
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
                className={cn(
                  "w-full rounded-md px-3 py-2 shadow-sm focus:ring-primary focus:border-primary",
                  !stand.trim() ? "border-red-500" : "border-gray-300"
                )}
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
                className={cn(
                  "w-full rounded-md px-3 py-2 shadow-sm bg-white focus:ring-primary focus:border-primary",
                  !unloading ? "border-red-500" : "border-gray-300"
                )}
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

          {/* Carrousel d'événements */}
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-sm font-medium mb-2 text-center">
              Sélectionnez un évènement :
            </p>
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
                <CarouselContent>
                  {EVENTS.map((ev, idx) => (
                    <CarouselItem
                      key={ev.key}
                      className="pl-0.5 md:basis-1/2 lg:basis-1/2 flex justify-center p-1"
                    >
                      <Card
                        className={cn(
                          "transition-all duration-300 shadow border flex flex-col items-center justify-center cursor-pointer h-24 md:h-32 w-20 md:w-28 bg-white rounded-lg p-1",
                          currentIdx === idx
                            ? "scale-100 border-primary ring-2 ring-primary/30 z-10"
                            : "scale-95 border-gray-200 opacity-80"
                        )}
                        onClick={() => {
                          setCurrentIdx(idx);
                          carouselApi?.scrollTo(idx);
                        }}
                      >
                        <CardContent className="flex flex-col items-center justify-center h-full p-1 w-full">
                          <Image
                            src={ev.logo}
                            alt={ev.label}
                            width={48}
                            height={36}
                            className="object-contain w-12 h-9 md:w-16 md:h-12 mb-1 rounded drop-shadow"
                            priority={idx === 0}
                          />
                          <span
                            className={cn(
                              "truncate w-full text-xs md:text-sm font-medium text-center overflow-hidden",
                              currentIdx === idx
                                ? "text-primary"
                                : "text-gray-700"
                            )}
                          >
                            {ev.label}
                          </span>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="w-6 h-6 -left-3 hidden sm:flex" />
                <CarouselNext className="w-6 h-6 -right-3 hidden sm:flex" />
              </Carousel>
              {/* Dots navigation */}
              <div className="flex justify-center gap-1 mt-2">
                {EVENTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentIdx === idx
                        ? "bg-primary scale-110"
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Aller à l'événement ${EVENTS[idx].label}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isValid && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Complétez tous les champs obligatoires pour continuer.
        </p>
      )}
    </div>
  );
}
