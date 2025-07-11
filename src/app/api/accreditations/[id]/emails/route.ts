import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } } // ← le typage reste identique
) {
  // 🔑 attendre params avant de lire id
  const { id } = context.params;

  const history = await prisma.accreditationEmailHistory.findMany({
    where: { accreditationId: id },
    orderBy: { sentAt: "desc" },
    select: { email: true, sentAt: true },
  });

  return Response.json(history);
}
