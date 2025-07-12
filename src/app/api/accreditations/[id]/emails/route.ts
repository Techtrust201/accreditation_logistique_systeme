import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const history = await prisma.accreditationEmailHistory.findMany({
    where: { accreditationId: id },
    orderBy: { sentAt: "desc" },
    select: { email: true, sentAt: true },
  });

  return Response.json(history);
}
