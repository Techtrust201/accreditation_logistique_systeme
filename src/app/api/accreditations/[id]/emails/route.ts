import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const history = await prisma.accreditationEmailHistory.findMany({
    where: { accreditationId: params.id },
    orderBy: { sentAt: "desc" },
    select: { email: true, sentAt: true },
  });
  return Response.json(history);
}
