import { NextRequest } from "next/server";
import { readAccreditations, writeAccreditations } from "@/lib/store";
import type { AccreditationStatus } from "@/types";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const list = await readAccreditations();
  const acc = list.find((a) => a.id === params.id);
  if (!acc) return new Response("Not found", { status: 404 });
  return Response.json(acc);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const list = await readAccreditations();
  const acc = list.find((a) => a.id === params.id);
  if (!acc) return new Response("Not found", { status: 404 });

  const { status }: { status?: AccreditationStatus } = await req.json();
  if (!status || !["ATTENTE", "ENTREE", "SORTIE"].includes(status)) {
    return new Response("Invalid status", { status: 400 });
  }

  if (status === acc.status) {
    return Response.json(acc); // rien à faire
  }

  // gestion des timestamps
  if (status === "ENTREE" && !acc.entryAt)
    acc.entryAt = new Date().toISOString();
  if (status === "SORTIE" && !acc.exitAt) acc.exitAt = new Date().toISOString();
  acc.status = status;

  await writeAccreditations(list);
  return Response.json(acc);
}
