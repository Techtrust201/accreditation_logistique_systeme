import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await req.json();
    // data doit contenir les champs du véhicule
    const created = await prisma.vehicle.create({
      data: {
        ...data,
        accreditationId: params.id,
      },
    });
    return Response.json(created, { status: 201 });
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
}
