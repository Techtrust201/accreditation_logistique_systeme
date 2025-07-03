import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import type { AccreditationStatus } from "@/types";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const acc = await prisma.accreditation.findUnique({
    where: { id: params.id },
    include: { vehicles: true },
  });
  if (!acc) return new Response("Not found", { status: 404 });
  return Response.json(acc);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const acc = await prisma.accreditation.findUnique({
    where: { id: params.id },
  });
  if (!acc) return new Response("Not found", { status: 404 });

  const { status }: { status?: AccreditationStatus } = await req.json();
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
  }> = {
    status,
  };

  if (status === "ENTREE" && !acc.entryAt) {
    updates.entryAt = new Date();
  }
  if (status === "SORTIE" && !acc.exitAt) {
    updates.exitAt = new Date();
  }

  const updated = await prisma.accreditation.update({
    where: { id: params.id },
    data: updates,
    include: { vehicles: true },
  });

  return Response.json(updated);
}
