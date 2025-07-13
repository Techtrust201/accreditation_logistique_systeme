import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accreditationId } = await params;

  try {
    const history = await prisma.accreditationHistory.findMany({
      where: { accreditationId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(history);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accreditationId } = await params;
  const body = await req.json();
  const { action, field, oldValue, newValue, description, userId, userAgent } =
    body;

  try {
    const historyEntry = await prisma.accreditationHistory.create({
      data: {
        accreditationId,
        action,
        field,
        oldValue,
        newValue,
        description,
        userId,
        userAgent,
      },
    });

    return Response.json(historyEntry, { status: 201 });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'entrée d'historique:",
      error
    );
    return new Response("Erreur serveur", { status: 500 });
  }
}
