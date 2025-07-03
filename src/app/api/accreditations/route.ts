import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import type { Vehicle } from "@/types";
// import type { Accreditation } from "@/types";

export async function GET() {
  const list = await prisma.accreditation.findMany({
    include: { vehicles: true },
  });
  return Response.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();

    // Nouvelle version: { company, stand, ... vehicle }
    if (raw.company) {
      const body = raw as {
        company: string;
        stand: string;
        unloading: string;
        event: string;
        message?: string;
        consent?: boolean;
        vehicle: {
          plate: string;
          size: string;
          phoneCode: string;
          phoneNumber: string;
          date: string;
          time: string;
          city: string;
          unloading: string;
        };
      };

      const created = await prisma.accreditation.create({
        data: {
          company: body.company,
          stand: body.stand,
          unloading: body.unloading,
          event: body.event,
          message: body.message ?? "",
          consent: body.consent ?? true,
          status: "ATTENTE",
          vehicles: {
            create: {
              ...body.vehicle,
            },
          },
        },
        include: { vehicles: true },
      });

      return Response.json(created, { status: 201 });
    }

    // Ancienne version: { stepOneData, vehicles, stepThreeData }
    if (raw.stepOneData) {
      const {
        stepOneData,
        vehicles: vehs,
        stepThreeData,
      } = raw as {
        stepOneData: {
          company: string;
          stand: string;
          unloading: string;
          event: string;
        };
        vehicles: Vehicle[];
        stepThreeData: { message: string; consent: boolean };
      };

      const created = await prisma.accreditation.create({
        data: {
          company: stepOneData.company,
          stand: stepOneData.stand,
          unloading: stepOneData.unloading,
          event: stepOneData.event,
          message: stepThreeData?.message ?? "",
          consent: stepThreeData?.consent ?? true,
          status: "ATTENTE",
          vehicles: {
            create: vehs.map((v) => ({
              plate: v.plate,
              size: v.size,
              phoneCode: v.phoneCode,
              phoneNumber: v.phoneNumber,
              date: v.date,
              time: v.time,
              city: v.city,
              unloading: v.unloading,
              kms: v.kms ?? "",
            })),
          },
        },
        include: { vehicles: true },
      });

      return Response.json(created, { status: 201 });
    }

    return new Response("Invalid payload", { status: 400 });
  } catch (err) {
    console.error(err);
    return new Response("Invalid payload", { status: 400 });
  }
}
