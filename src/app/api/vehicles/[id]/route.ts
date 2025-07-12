import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await req.json();
    const updated = await prisma.vehicle.update({
      where: { id: Number(params.id) },
      data,
    });
    return Response.json(updated);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.vehicle.delete({
      where: { id: Number(params.id) },
    });
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
