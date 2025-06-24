export interface Vehicle {
  id: number;
  plate: string;
  size: "" | "-10" | "10-14" | "15-20" | "+20";
  phoneCode: string;
  phoneNumber: string;
  date: string;
  time: string;
  city: string;
  unloading: "" | "lat" | "rear";
  kms?: string;
}

export type AccreditationStatus = "ATTENTE" | "ENTREE" | "SORTIE";

export interface Accreditation {
  id: string;
  createdAt: string; // ISO date
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
  status: AccreditationStatus;
  entryAt?: string; // ISO date
  exitAt?: string; // ISO date
}
