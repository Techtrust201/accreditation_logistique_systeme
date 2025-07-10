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
  company: string;
  stand: string;
  unloading: string;
  event: string;
  vehicles: Vehicle[];
  message: string;
  consent: boolean;
  status?: "ATTENTE" | "ENTREE" | "SORTIE";
  entryAt?: string;
  exitAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AccreditationPayload = await req.json();
    const {
      id,
      company,
      stand,
      unloading,
      event,
      vehicles,
      message,
      consent,
      status,
      entryAt,
      exitAt,
    } = body;

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

    // Helper: retourne le nouveau y après dessin du texte wrap.
    const drawWrapped = (
      page: any,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      size = 12,
      options: { color?: [number, number, number] } = {}
    ) => {
      const words = text.split(" ");
      let line = "";
      const lineHeight = size + 4;
      for (let i = 0; i < words.length; i += 1) {
        const w = words[i];
        const test = line ? `${line} ${w}` : w;
        const testWidth = font.widthOfTextAtSize(test, size);
        if (testWidth > maxWidth) {
          drawText(page, line, x, y, size, options);
          y -= lineHeight;
          line = w;
        } else {
          line = test;
        }
      }
      if (line) {
        drawText(page, line, x, y, size, options);
        y -= lineHeight;
      }
      return y;
    };

    let page = pdfDoc.addPage();
    const height = page.getSize().height;
    const width = page.getSize().width;
    let y = page.getSize().height - 50;

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
    y = height - 130;
    drawText(page, "Informations Générales de la Demande", 50, y, 14, {
      color: [0, 0, 0],
    });
    y -= 25;

    // Nouvelle fonction pour aligner label/valeur sur une grille stricte
    const LABEL_X = 60;
    const LABEL_WIDTH = 150;
    const VALUE_X = LABEL_X + LABEL_WIDTH + 10;
    const VALUE_MAX_WIDTH = width - VALUE_X - 120; // on réserve 100px à droite pour le QR code
    const LINE_HEIGHT = 16;
    function addLabelVal(label: string, val: string) {
      drawText(page, `${label} :`, LABEL_X, y, 12, {
        color: [0.15, 0.15, 0.15],
      });
      y = drawWrapped(page, val, VALUE_X, y, VALUE_MAX_WIDTH, 12, {
        color: [0, 0, 0],
      });
    }

    addLabelVal("Nom de l'entreprise", company);
    addLabelVal("Stand desservi", stand);
    addLabelVal("Déchargement par", unloading.toUpperCase());

    // Statut
    drawText(page, "Statut Actuel :", LABEL_X, y, 12, {
      color: [0.15, 0.15, 0.15],
    });
    const statusColor: [number, number, number] =
      status === "ENTREE"
        ? [0, 0.55, 0.2]
        : status === "SORTIE"
          ? [0.7, 0, 0]
          : [0, 0, 0.6];
    drawText(page, status || "ATTENTE", VALUE_X, y, 12, { color: statusColor });
    y -= LINE_HEIGHT;

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
    drawText(page, "Détails des Véhicules Accrédités", 50, y, 14, {
      color: [0, 0, 0],
    });
    y -= 25;

    for (let i = 0; i < vehicles.length; i += 1) {
      if (y < 180) {
        page = pdfDoc.addPage();
        y = page.getSize().height - 50;
        // Redessiner le header de section si besoin
        drawText(page, "Détails des Véhicules Accrédités", 50, y, 14, {
          color: [0, 0, 0],
        });
        y -= 25;
      }
      const v = vehicles[i];
      const boxTop = y;
      const PADDING = 12;
      let yBox = y - PADDING;

      drawText(page, `Véhicule ${i + 1}`, LABEL_X, yBox, 12, {
        color: [0.1, 0.1, 0.1],
      });
      yBox -= LINE_HEIGHT;

      function addLabelValBox(label: string, val: string) {
        drawText(page, `${label} :`, LABEL_X + PADDING, yBox, 12, {
          color: [0.15, 0.15, 0.15],
        });
        yBox = drawWrapped(
          page,
          val,
          VALUE_X,
          yBox,
          VALUE_MAX_WIDTH - PADDING,
          12,
          { color: [0, 0, 0] }
        );
      }
      addLabelValBox("Plaque", v.plate);
      addLabelValBox("Taille du véhicule", v.size);
      addLabelValBox(
        "Téléphone du conducteur",
        `${v.phoneCode} ${v.phoneNumber}`
      );
      addLabelValBox("Date d'arrivée prévue", v.date);
      addLabelValBox("Heure d'arrivée prévue", v.time || "--:--");
      addLabelValBox("Ville de départ", v.city);
      addLabelValBox(
        "Type de déchargement",
        v.unloading === "lat" ? "Latéral" : "Arrière"
      );
      if (v.kms) {
        addLabelValBox("Km parcourus", v.kms);
      }
      yBox -= PADDING;
      // Encadré avec padding
      const boxBottom = yBox;
      page.drawRectangle({
        x: LABEL_X - PADDING,
        y: boxBottom,
        width: width - LABEL_X - 100 + PADDING * 2,
        height: boxTop - boxBottom + PADDING * 2,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      y = boxBottom - 30; // espace entre véhicules
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

    drawText(page, "Message et Conditions", 50, y, 14, { color: [0, 0, 0] });
    y -= 25;

    // message d'intervention
    drawText(page, "Message d'intervention :", LABEL_X, y, 12, {
      color: [0.15, 0.15, 0.15],
    });
    y -= LINE_HEIGHT;

    if (message) {
      const msg = message;
      const maxW = VALUE_MAX_WIDTH - 16; // on laisse du padding horizontal
      // Découpage en lignes, même pour mots très longs
      const lines: string[] = [];
      let current = "";
      for (let i = 0; i < msg.length; i++) {
        current += msg[i];
        if (font.widthOfTextAtSize(current, 11) > maxW || msg[i] === "\n") {
          if (msg[i] === "\n") {
            lines.push(current.slice(0, -1));
            current = "";
          } else {
            lines.push(current);
            current = "";
          }
        }
      }
      if (current) lines.push(current);
      const PADDING_Y = 10;
      const PADDING_X = 8;
      const msgHeight = lines.length * 15 + PADDING_Y * 2;
      // Rectangle avec padding
      page.drawRectangle({
        x: LABEL_X - 4,
        y: y - msgHeight + PADDING_Y,
        width: width - LABEL_X - 100 + 8,
        height: msgHeight,
        color: rgb(1, 1, 0.9),
        opacity: 0.3,
        borderColor: rgb(0.9, 0.9, 0.7),
        borderWidth: 1,
      });
      let yMsg = y - PADDING_Y;
      for (const line of lines) {
        drawText(page, line, LABEL_X + PADDING_X, yMsg, 11);
        yMsg -= 15;
      }
      y = y - msgHeight - 10;
    } else {
      drawText(page, "Aucun message.", LABEL_X, y, 11, {
        color: [0.4, 0.4, 0.4],
      });
      y -= 20;
    }

    // consentement
    const consentPrefix = consent ? "[X]" : "[ ]";
    drawText(
      page,
      `${consentPrefix} Je consens à la politique de confidentialité`,
      LABEL_X,
      y,
      12
    );
    y -= 25;

    // rappel validité
    const noteLines = [
      "Cette accréditation est valable pour une durée de 24 heures à compter de l'heure d'entrée validée.",
      "Veuillez présenter ce document à l'entrée du site.",
    ];
    noteLines.forEach((l) => {
      drawText(page, l, LABEL_X, y, 9);
      y -= 12;
    });

    // QR code global (id)
    if (id) {
      const qrBuffer: Buffer = await QRCode.toBuffer(JSON.stringify({ id }), {
        type: "png",
      });
      const qrImage = await pdfDoc.embedPng(qrBuffer);
      // Réserve une zone à droite, bien espacée
      page.drawImage(qrImage, {
        x: width - 100,
        y: 60,
        width: 80,
        height: 80,
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
