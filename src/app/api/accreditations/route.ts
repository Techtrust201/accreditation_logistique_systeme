import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
// import type { Accreditation } from "@/types";
import { addHistoryEntry, createCreatedEntry } from "@/lib/history";

export async function GET() {
  const list = await prisma.accreditation.findMany({
    include: { vehicles: true },
  });
  // Désérialisation unloading (toujours tableau)
  const safeList = list.map((acc) => ({
    ...acc,
    vehicles: acc.vehicles.map((v) => ({
      ...v,
      unloading: Array.isArray(v.unloading)
        ? v.unloading
        : typeof v.unloading === "string" && v.unloading.startsWith("[")
          ? JSON.parse(v.unloading)
          : v.unloading
            ? [v.unloading]
            : [],
    })),
  }));
  return Response.json(safeList);
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const { company, stand, unloading, event, message, consent, vehicles } =
      raw;
    if (
      !company ||
      !stand ||
      !unloading ||
      !event ||
      !Array.isArray(vehicles) ||
      vehicles.length === 0 ||
      vehicles.some(
        (v) =>
          !v.plate ||
          !v.size ||
          !v.phoneCode ||
          !v.phoneNumber ||
          !v.date ||
          !v.time ||
          !v.city ||
          !v.unloading
      )
    ) {
      return new Response("Invalid payload: missing vehicle fields", {
        status: 400,
      });
    }
    const created = await prisma.accreditation.create({
      data: {
        company,
        stand,
        unloading,
        event,
        message: message ?? "",
        consent: consent ?? true,
        status: raw.status ?? "ATTENTE",
        vehicles: {
          create: vehicles.map((v) => ({
            plate: v.plate,
            size: v.size,
            phoneCode: v.phoneCode,
            phoneNumber: v.phoneNumber,
            date: v.date,
            time: v.time,
            city: v.city,
            unloading: JSON.stringify(v.unloading),
            kms: v.kms ?? "",
          })),
        },
      },
      include: { vehicles: true },
    });
    // Ajout historique création
    await addHistoryEntry(createCreatedEntry(created.id, "system"));
    // Désérialisation unloading pour la réponse
    const safeCreated = {
      ...created,
      vehicles: created.vehicles.map((v) => ({
        ...v,
        unloading: Array.isArray(v.unloading)
          ? v.unloading
          : typeof v.unloading === "string" && v.unloading.startsWith("[")
            ? JSON.parse(v.unloading)
            : v.unloading
              ? [v.unloading]
              : [],
      })),
    };
    return Response.json(safeCreated, { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response("Invalid payload", { status: 400 });
  }
}
