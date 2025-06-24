/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

interface Vehicle {
  id: number;
  plate: string;
  size: string;
  phoneCode: string;
  phoneNumber: string;
  date: string;
  time: string;
  city: string;
  unloading: string;
  kms?: string;
}

interface AccreditationPayload {
  id?: string;
  stepOneData: {
    company: string;
    stand: string;
    unloading: string;
    event: string;
  };
  vehicles: Vehicle[];
  stepThreeData: {
    message: string;
    consent: boolean;
  };
  status?: "ATTENTE" | "ENTREE" | "SORTIE";
  entryAt?: string;
  exitAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AccreditationPayload = await req.json();
    const { id, stepOneData, vehicles, status, entryAt, exitAt } = body;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawText = (
      page: any,
      text: string,
      x: number,
      y: number,
      size = 12,
      options: { color?: [number, number, number] } = {}
    ) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: options.color ? rgb(...options.color) : rgb(0, 0, 0),
      });
    };

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // === HEADER ===
    const todayStr = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

    drawText(page, "Accréditation Véhicule", 50, height - 50, 22);
    drawText(
      page,
      "Palais des Festivals et des Congrès de Cannes",
      50,
      height - 75,
      14
    );
    drawText(page, `Date d'émission: ${todayStr}`, 50, height - 95, 10);

    // séparation
    page.drawLine({
      start: { x: 50, y: height - 105 },
      end: { x: width - 50, y: height - 105 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
      dashArray: [3, 3],
    });

    // === INFOS GÉNÉRALES ===
    let y = height - 130;
    drawText(page, "Informations Générales de la Demande", 50, y, 14);
    y -= 25;

    const addLabelVal = (label: string, val: string) => {
      drawText(page, `${label}:`, 50, y);
      drawText(page, val, 200, y);
      y -= 18;
    };

    addLabelVal("Nom de l'entreprise", stepOneData.company);
    addLabelVal("Stand desservi", stepOneData.stand);
    addLabelVal("Déchargement par", stepOneData.unloading.toUpperCase());

    // Statut
    drawText(page, "Statut Actuel:", 50, y);
    const statusColor: [number, number, number] =
      status === "ENTREE"
        ? [0, 0.55, 0.2]
        : status === "SORTIE"
        ? [0.7, 0, 0]
        : [0, 0, 0.6];
    drawText(page, status || "ATTENTE", 200, y, 12, { color: statusColor });
    y -= 18;

    addLabelVal(
      "Heure d'entrée",
      entryAt
        ? new Date(entryAt).toLocaleString("fr-FR")
        : "L'accréditation doit être validée par un logisticien pour vous attribuer un horaire d'arrivée."
    );
    addLabelVal(
      "Heure de sortie",
      exitAt
        ? new Date(exitAt).toLocaleString("fr-FR")
        : "Votre présence est tracée, un logisticien renseignera l'heure de votre départ."
    );

    // séparation 2
    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
      dashArray: [3, 3],
    });
    y -= 25;

    // === DÉTAILS VÉHICULES ===
    drawText(page, "Détails des Véhicules Accrédités", 50, y, 14);
    y -= 25;

    for (let i = 0; i < vehicles.length; i += 1) {
      const v = vehicles[i];
      const boxTop = y;

      drawText(page, `Véhicule ${i + 1}`, 55, y, 12);
      y -= 18;

      addLabelVal("Plaque", v.plate);
      addLabelVal("Taille du véhicule", v.size);
      addLabelVal("Téléphone du conducteur", `${v.phoneCode} ${v.phoneNumber}`);
      addLabelVal("Date d'arrivée prévue", v.date);
      addLabelVal("Heure d'arrivée prévue", v.time || "--:--");
      addLabelVal("Ville de départ", v.city);
      addLabelVal(
        "Type de déchargement",
        v.unloading === "lat" ? "Latéral" : "Arrière"
      );

      if (v.kms) {
        addLabelVal("Km parcourus", v.kms);
      }

      // message spécial (ex: taille >30) -> placeholder, skipped here

      // Encadré
      const boxBottom = y + 10;
      page.drawRectangle({
        x: 50,
        y: boxBottom,
        width: width - 100,
        height: boxTop - boxBottom + 8,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      y -= 30;
    }

    // === MESSAGE & CONSENTEMENT ===
    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
      dashArray: [3, 3],
    });
    y -= 25;

    drawText(page, "Message et Conditions", 50, y, 14);
    y -= 25;

    // message d'intervention
    drawText(page, "Message d'intervention:", 50, y);
    y -= 18;

    if (body.stepThreeData?.message) {
      // dessiner cadre jaune clair si message
      const msg = body.stepThreeData.message;
      const msgHeight = 50; // approx
      page.drawRectangle({
        x: 50,
        y: y - msgHeight + 10,
        width: width - 100,
        height: msgHeight,
        color: rgb(1, 1, 0.9),
        opacity: 0.3,
        borderColor: rgb(0.9, 0.9, 0.7),
        borderWidth: 1,
      });
      drawText(page, msg, 55, y - 5, 11);
      y -= msgHeight + 10;
    } else {
      drawText(page, "Aucun message.", 50, y, 11, { color: [0.4, 0.4, 0.4] });
      y -= 20;
    }

    // consentement
    if (body.stepThreeData?.consent) {
      drawText(page, "☑ Je consens à la politique de confidentialité", 50, y);
    } else {
      drawText(page, "☐ Je consens à la politique de confidentialité", 50, y);
    }
    y -= 25;

    // rappel validité
    const noteLines = [
      "Cette accréditation est valable pour une durée de 24 heures à compter de l'heure d'entrée validée.",
      "Veuillez présenter ce document à l'entrée du site.",
    ];
    noteLines.forEach((l) => {
      drawText(page, l, 50, y, 9);
      y -= 12;
    });

    // QR code global (id)
    if (id) {
      const qrBuffer: Buffer = await QRCode.toBuffer(JSON.stringify({ id }), {
        type: "png",
      });
      const qrImage = await pdfDoc.embedPng(qrBuffer);
      const qrDims = qrImage.scale(0.4);
      page.drawImage(qrImage, {
        x: width - qrDims.width - 50,
        y: 50,
        width: qrDims.width,
        height: qrDims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=accreditation.pdf",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
