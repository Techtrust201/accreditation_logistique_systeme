import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import type { AccreditationStatus } from "@/types";

/* ----------------------- GET ----------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const acc = await prisma.accreditation.findUnique({
    where: { id },
    include: { vehicles: true },
  });
  if (!acc) return new Response("Not found", { status: 404 });
  return Response.json(acc);
}

/* ---------------------- PATCH ---------------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const acc = await prisma.accreditation.findUnique({
    where: { id },
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
    where: { id },
    data: updates,
  });

  /* -- remplacement véhicules -- */
  if (Array.isArray(vehicles)) {
    await prisma.vehicle.deleteMany({ where: { accreditationId: id } });
    if (vehicles.length) {
      await prisma.vehicle.createMany({
        data: vehicles.map(({ id: _unused, ...v }) => ({
          ...v,
          accreditationId: id,
        })),
      });
    }
  }

  // renvoi de la version à jour
  const accWithVehicles = await prisma.accreditation.findUnique({
    where: { id },
    include: { vehicles: true },
  });

  return Response.json(accWithVehicles);
}

/* --------------------- DELETE ---------------------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.accreditation.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
