export interface Vehicle {
  id: number;
  plate: string;
  size: "" | "-10" | "10-14" | "15-20" | "+20";
  phoneCode: string;
  phoneNumber: string;
  date: string;
  time: string;
  city: string;
  unloading: ("lat" | "rear")[];
  kms?: string;
}

export type AccreditationStatus =
  | "ATTENTE"
  | "ENTREE"
  | "SORTIE"
  | "NOUVEAU"
  | "REFUS"
  | "ABSENT";

export interface Accreditation {
  id: string;
  createdAt: Date; // ISO date
  company: string;
  stand: string;
  unloading: string;
  event: string;
  message?: string;
  consent: boolean;
  vehicles: Vehicle[];
  status: AccreditationStatus;
  entryAt?: Date; // ISO date
  exitAt?: Date; // ISO date
  email?: string;
  sentAt?: Date;
}
