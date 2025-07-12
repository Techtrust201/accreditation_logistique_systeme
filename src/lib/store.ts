import type { Accreditation, Vehicle } from "@/types";
import prisma from "@/lib/prisma";

export async function readAccreditations(): Promise<Accreditation[]> {
  const rows = await prisma.accreditation.findMany({
    include: { vehicles: true },
  });

  // Adaptation vers la forme attendue par le front (stepOneData, stepThreeData…)
  return rows.map(
    (a): Accreditation => ({
      id: a.id,
      createdAt: a.createdAt, // On garde le type Date pour correspondre au type attendu
      company: a.company,
      stand: a.stand,
      unloading: a.unloading,
      event: a.event,
      message: a.message || "",
      consent: a.consent,
      status: a.status as Accreditation["status"],
      entryAt: a.entryAt ?? undefined,
      exitAt: a.exitAt ?? undefined,
      vehicles: a.vehicles.map(
        (v): Vehicle => ({
          id: v.id,
          plate: v.plate,
          size: (v.size as Vehicle["size"]) || "",
          phoneCode: v.phoneCode,
          phoneNumber: v.phoneNumber,
          date: v.date,
          time: v.time,
          city: v.city,
          unloading: v.unloading as Vehicle["unloading"],
          kms: v.kms || undefined,
        })
      ),
    })
  );
}

export function generateId(): string {
  return crypto.randomUUID();
}
