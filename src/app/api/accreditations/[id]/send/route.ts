import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = (await req.json()) as { email?: string };

    const acc = await prisma.accreditation.findUnique({
      where: { id: params.id },
      include: { vehicles: true },
    });
    if (!acc) return new Response("Not found", { status: 404 });

    // @ts-ignore - propriétés ajoutées par migration
    const targetEmail = email || (acc as any).email;
    if (!targetEmail) return new Response("Email manquant", { status: 400 });

    // Met à jour le champ email si nouvel email
    if (!(acc as any).email && email) {
      await prisma.accreditation.update({
        where: { id: acc.id },
        data: { email },
      });
    }

    // Génération PDF via appel interne
    const origin = process.env.INTERNAL_BASE_URL || "http://localhost:3000";
    const pdfRes = await fetch(`${origin}/api/accreditation/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: acc.id,
        company: acc.company,
        stand: acc.stand,
        unloading: acc.unloading,
        event: acc.event,
        vehicles: acc.vehicles,
        message: acc.message ?? "",
        consent: acc.consent,
        status: acc.status,
        entryAt: acc.entryAt?.toISOString(),
        exitAt: acc.exitAt?.toISOString(),
      }),
    });
    if (!pdfRes.ok) return new Response("PDF error", { status: 500 });
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: targetEmail,
      subject: "Votre accréditation véhicule",
      html: `<p>Bonjour,<br/>Veuillez trouver ci-joint votre accréditation véhicule pour le Palais des Festivals.<br/>Cordialement,</p>`,
      attachments: [
        {
          filename: "accreditation.pdf",
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
      ],
    });

    await prisma.accreditation.update({
      where: { id: acc.id },
      data: { sentAt: new Date(), email: targetEmail } as any,
    });

    await prisma.accreditationEmailHistory.create({
      data: {
        accreditationId: acc.id,
        email: targetEmail,
      },
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erreur envoi", { status: 500 });
  }
}
