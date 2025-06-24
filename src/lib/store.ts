import fs from "fs/promises";
import path from "path";
import type { Accreditation } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "accreditations.json");

/**
 * S'assure que le dossier et le fichier existent.
 */
async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE_PATH);
  } catch {
    // Fichier absent : on l'initialise
    await fs.writeFile(FILE_PATH, "[]", "utf8");
  }
}

export async function readAccreditations(): Promise<Accreditation[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  return JSON.parse(raw) as Accreditation[];
}

export async function writeAccreditations(data: Accreditation[]) {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
