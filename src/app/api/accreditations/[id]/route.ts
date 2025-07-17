import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import type { AccreditationStatus } from "@/types";
import {
  addHistoryEntry,
  createStatusChangeEntry,
  createInfoUpdatedEntry,
} from "@/lib/history";

/* ----------------------- GET ----------------------- */
export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
  const acc = await prisma.accreditation.findUnique({
    where: { id },
    include: { vehicles: true },
  });
  if (!acc) return new Response("Not found", { status: 404 });
  // Désérialisation unloading (toujours tableau)
  const safeAcc = {
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
  };
  return Response.json(safeAcc);
}

/* ---------------------- PATCH ---------------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accreditationId } = await params;
  const acc = await prisma.accreditation.findUnique({
    where: { id: accreditationId },
    include: { vehicles: true },
  });
  if (!acc) return new Response("Not found", { status: 404 });

  const body = await req.json();
  const { status, company, stand, unloading, event, message, vehicles } = body;

  if (
    !status ||
    !["ATTENTE", "ENTREE", "SORTIE", "NOUVEAU", "REFUS", "ABSENT"].includes(
      status
    )
  ) {
    return new Response("Invalid status", { status: 400 });
  }

  const updates: Partial<{
    status: AccreditationStatus;
    entryAt?: Date;
    exitAt?: Date;
    company?: string;
    stand?: string;
    unloading?: string;
    event?: string;
    message?: string;
  }> = { status, company, stand, unloading, event, message };

  if (status === "ENTREE" && !acc.entryAt) updates.entryAt = new Date();
  if (status === "SORTIE" && !acc.exitAt) updates.exitAt = new Date();

  await prisma.accreditation.update({
    where: { id: accreditationId },
    data: updates,
  });

  // Enregistrer l'historique des changements
  const changes: Promise<boolean>[] = [];

  // Changement de statut
  if (status !== acc.status) {
    changes.push(
      addHistoryEntry(
        createStatusChangeEntry(accreditationId, acc.status, status, "system")
      )
    );
  }

  // Changements d'informations
  if (company && company !== acc.company) {
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "company",
          acc.company,
          company,
          "system"
        )
      )
    );
  }
  if (stand && stand !== acc.stand) {
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "stand",
          acc.stand,
          stand,
          "system"
        )
      )
    );
  }
  if (unloading && unloading !== acc.unloading) {
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "unloading",
          acc.unloading,
          unloading,
          "system"
        )
      )
    );
  }
  if (event && event !== acc.event) {
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "event",
          acc.event,
          event,
          "system"
        )
      )
    );
  }
  if (message !== acc.message) {
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "message",
          acc.message || "",
          message || "",
          "system"
        )
      )
    );
  }

  // Attendre que tous les changements d'historique soient enregistrés
  await Promise.all(changes);

  /* -- remplacement véhicules -- */
  if (Array.isArray(vehicles)) {
    await prisma.vehicle.deleteMany({ where: { accreditationId } });
    if (vehicles.length) {
      await prisma.vehicle.createMany({
        data: vehicles.map((vehicle) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...vehicleData } = vehicle;
          return {
            ...vehicleData,
            unloading: JSON.stringify(vehicle.unloading),
            accreditationId,
          };
        }),
      });
    }
    // Historique véhicules (trace brute, améliorable)
    changes.push(
      addHistoryEntry(
        createInfoUpdatedEntry(
          accreditationId,
          "vehicles",
          JSON.stringify(acc.vehicles),
          JSON.stringify(vehicles),
          "system"
        )
      )
    );
  }

  // renvoi de la version à jour
  const accWithVehicles = await prisma.accreditation.findUnique({
    where: { id: accreditationId },
    include: { vehicles: true },
  });
  // Désérialisation unloading (toujours tableau)
  const safeAccWithVehicles = {
    ...accWithVehicles,
    vehicles:
      accWithVehicles?.vehicles.map((v) => ({
        ...v,
        unloading: Array.isArray(v.unloading)
          ? v.unloading
          : typeof v.unloading === "string" && v.unloading.startsWith("[")
            ? JSON.parse(v.unloading)
            : v.unloading
              ? [v.unloading]
              : [],
      })) ?? [],
  };
  return Response.json(safeAccWithVehicles);
}

/* --------------------- DELETE ---------------------- */
export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
  try {
    await prisma.accreditation.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
