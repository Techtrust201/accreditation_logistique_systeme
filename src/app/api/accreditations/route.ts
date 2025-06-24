import { NextRequest } from "next/server";
import {
  readAccreditations,
  writeAccreditations,
  generateId,
} from "@/lib/store";
import type { Accreditation } from "@/types";

export async function GET() {
  const list = await readAccreditations();
  return Response.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<
      Accreditation,
      "id" | "createdAt" | "status" | "entryAt" | "exitAt"
    >;

    const newAccreditation: Accreditation = {
      ...(body as any),
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: "ATTENTE",
      entryAt: undefined,
      exitAt: undefined,
    };

    const list = await readAccreditations();
    list.push(newAccreditation);
    await writeAccreditations(list);

    return Response.json(newAccreditation, { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response("Invalid payload", { status: 400 });
  }
}
