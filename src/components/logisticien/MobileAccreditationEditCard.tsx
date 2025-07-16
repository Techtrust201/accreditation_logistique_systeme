"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Accreditation, AccreditationStatus } from "@/types";
import {
  ArrowLeft,
  Save,
  Trash2,
  PlusCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types plus précis
type VehicleSize = "-10" | "10-14" | "15-20" | "+20";
type UnloadingType = "lat" | "arr";

// Schéma de validation Zod avec types stricts
const vehicleSchema = z.object({
  id: z.number().optional(),
  plate: z.string().min(1, "Plaque requise").max(20, "Plaque trop longue"),
  size: z.enum(["-10", "10-14", "15-20", "+20"] as const),
  phoneCode: z
    .string()
    .min(1, "Indicatif requis")
    .regex(/^\+[0-9]+$/, "Format invalide"),
  phoneNumber: z
    .string()
    .min(1, "Numéro requis")
    .regex(/^[0-9]+$/, "Chiffres uniquement"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  city: z.string().min(1, "Ville requise"),
  unloading: z.enum(["lat", "arr"] as const),
  kms: z.string().optional(),
});

const accreditationFormSchema = z.object({
  status: z.enum([
    "NOUVEAU",
    "ATTENTE",
    "ENTREE",
    "SORTIE",
    "REFUS",
    "ABSENT",
  ] as const),
  company: z.string().min(1, "Entreprise requise").max(100, "Trop long"),
  stand: z.string().min(1, "Stand requis").max(50, "Trop long"),
  unloading: z.string().min(1, "Déchargement requis").max(50, "Trop long"),
  event: z.string().min(1, "Événement requis").max(50, "Trop long"),
  message: z.string().max(500, "Message trop long").optional(),
  vehicles: z
    .array(vehicleSchema)
    .min(1, "Au moins un véhicule requis")
    .max(5, "Maximum 5 véhicules"),
});

type AccreditationFormData = z.infer<typeof accreditationFormSchema>;

// Constantes mémorisées
const STATUS_OPTIONS = [
  { value: "NOUVEAU" as const, label: "Nouveau" },
  { value: "ATTENTE" as const, label: "Attente" },
  { value: "ENTREE" as const, label: "Entrée" },
  { value: "SORTIE" as const, label: "Sortie" },
  { value: "REFUS" as const, label: "Refus" },
  { value: "ABSENT" as const, label: "Absent" },
] as const;

const VEHICLE_SIZE_OPTIONS = [
  { value: "-10" as const, label: "-10" },
  { value: "10-14" as const, label: "10-14" },
  { value: "15-20" as const, label: "15-20" },
  { value: "+20" as const, label: "+20" },
] as const;

// Types pour les toasts
type ToastType = "success" | "error" | "info";
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Hook personnalisé pour les toasts
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// Hook personnalisé pour la logique métier du statut
function useStatusLogic() {
  const [showEntryConfirm, setShowEntryConfirm] = useState(false);

  const canChangeStatus = useCallback(
    (
      currentStatus: AccreditationStatus,
      newStatus: AccreditationStatus
    ): boolean => {
      if (currentStatus === "ENTREE") {
        return newStatus === "SORTIE";
      }
      if (currentStatus === "SORTIE") {
        return false;
      }
      return true;
    },
    []
  );

  const handleStatusChange = useCallback(
    (
      currentStatus: AccreditationStatus,
      newStatus: AccreditationStatus,
      onStatusChange: (status: AccreditationStatus) => void
    ) => {
      if (newStatus === "ENTREE" && currentStatus !== "ENTREE") {
        setShowEntryConfirm(true);
        return;
      }

      if (canChangeStatus(currentStatus, newStatus)) {
        onStatusChange(newStatus);
      }
    },
    [canChangeStatus]
  );

  return {
    showEntryConfirm,
    setShowEntryConfirm,
    canChangeStatus,
    handleStatusChange,
  };
}

// Composant Toast
function Toast({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  };

  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${colors[toast.type]}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} />
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 hover:opacity-80"
        aria-label="Fermer la notification"
      >
        ×
      </button>
    </div>
  );
}

// Composant de champ réutilisable
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

function FormField({
  label,
  name,
  error,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-600" role="alert" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}

interface Props {
  acc: Accreditation;
}

export default function MobileAccreditationEditCard({ acc }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showEntryConfirm, setShowEntryConfirm, handleStatusChange } =
    useStatusLogic();
  const { toasts, addToast, removeToast } = useToasts();

  // Initialisation du formulaire avec react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<AccreditationFormData>({
    resolver: zodResolver(accreditationFormSchema),
    defaultValues: useMemo(
      () => ({
        status: acc.status as AccreditationStatus,
        company: acc.company ?? "",
        stand: acc.stand ?? "",
        unloading: acc.unloading ?? "",
        event: acc.event ?? "",
        message: acc.message ?? "",
        vehicles:
          acc.vehicles.length > 0
            ? acc.vehicles
                .filter(
                  (vehicle) =>
                    vehicle.size &&
                    ["-10", "10-14", "15-20", "+20"].includes(vehicle.size) &&
                    vehicle.unloading &&
                    ["lat", "arr"].includes(vehicle.unloading)
                )
                .map((vehicle) => ({
                  ...vehicle,
                  size: vehicle.size as VehicleSize,
                  unloading: vehicle.unloading as UnloadingType,
                }))
            : [
                {
                  plate: "",
                  size: "-10" as VehicleSize,
                  phoneCode: "+33",
                  phoneNumber: "",
                  date: "",
                  time: "",
                  city: "",
                  unloading: "lat" as UnloadingType,
                },
              ],
      }),
      [acc]
    ),
    mode: "onChange",
  });

  // Gestion des véhicules avec useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles",
  });

  const currentStatus = watch("status");

  // Soumission du formulaire optimisée
  const onSubmit = useCallback(
    async (data: AccreditationFormData) => {
      startTransition(async () => {
        try {
          const response = await fetch(`/api/accreditations/${acc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Erreur ${response.status}: ${response.statusText}`
            );
          }

          // Reset du formulaire pour indiquer qu'il n'y a plus de changements
          reset(data);
          addToast("success", "Modifications enregistrées avec succès");

          if (router.refresh) {
            router.refresh();
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur inconnue";
          addToast("error", `Erreur lors de la sauvegarde: ${errorMessage}`);
          console.error("Erreur lors de la sauvegarde:", error);
        }
      });
    },
    [acc.id, reset, addToast, router]
  );

  // Ajout d'un nouveau véhicule mémorisé
  const handleAddVehicle = useCallback(() => {
    append({
      plate: "",
      size: "-10" as VehicleSize,
      phoneCode: "+33",
      phoneNumber: "",
      date: "",
      time: "",
      city: "",
      unloading: "lat" as UnloadingType,
    });
  }, [append]);

  return (
    <>
      <div className="block sm:hidden w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-4 space-y-6 pb-24">
        {/* Header */}
        <header className="flex items-center gap-3 mb-2">
          <Link
            href="/logisticien"
            className="text-[#4F587E] p-2 -ml-2"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-[#4F587E]">
            Éditer l&apos;accréditation
          </h1>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* Statut */}
          <FormField
            label="Statut"
            name="status"
            error={errors.status?.message}
            required
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="status"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const newStatus = e.target.value as AccreditationStatus;
                    handleStatusChange(currentStatus, newStatus, (status) =>
                      setValue("status", status)
                    );
                  }}
                  disabled={currentStatus === "SORTIE"}
                  aria-describedby={errors.status ? "status-error" : undefined}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormField>

          {/* Informations générales */}
          <div className="space-y-2">
            {[
              { label: "Entreprise", field: "company" as const },
              { label: "Stand desservi", field: "stand" as const },
              { label: "Déchargement", field: "unloading" as const },
              { label: "Événement", field: "event" as const },
            ].map(({ label, field }) => (
              <FormField
                key={field}
                label={label}
                name={field}
                error={errors[field]?.message}
                required
              >
                <Controller
                  name={field}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      id={field}
                      value={value}
                      onChange={onChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white"
                      aria-describedby={
                        errors[field] ? `${field}-error` : undefined
                      }
                    />
                  )}
                />
              </FormField>
            ))}
          </div>

          {/* Véhicules */}
          <div className="space-y-2">
            <div className="font-semibold text-[#4F587E] mb-1 flex items-center justify-between">
              <span>Véhicules</span>
              <button
                type="button"
                onClick={handleAddVehicle}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4F587E] text-white text-xs font-semibold shadow hover:bg-[#3B4252] transition"
                disabled={fields.length >= 5}
                aria-label="Ajouter un véhicule"
              >
                <PlusCircle size={16} /> Ajouter
              </button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gray-50 rounded-lg border p-3 space-y-2"
                role="group"
                aria-labelledby={`vehicle-${index}-title`}
              >
                <div className="flex items-center justify-between">
                  <span
                    id={`vehicle-${index}-title`}
                    className="font-semibold text-sm"
                  >
                    Véhicule {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:bg-red-100 rounded-full p-1 transition-colors"
                      aria-label={`Supprimer le véhicule ${index + 1}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="Plaque"
                    name={`vehicles.${index}.plate`}
                    error={errors.vehicles?.[index]?.plate?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.plate`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs"
                          placeholder="XX-123-YY"
                          aria-describedby={
                            errors.vehicles?.[index]?.plate
                              ? `vehicles-${index}-plate-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Taille"
                    name={`vehicles.${index}.size`}
                    error={errors.vehicles?.[index]?.size?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.size`}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs"
                          aria-describedby={
                            errors.vehicles?.[index]?.size
                              ? `vehicles-${index}-size-error`
                              : undefined
                          }
                        >
                          <option value="">Choisir</option>
                          {VEHICLE_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Indicatif"
                    name={`vehicles.${index}.phoneCode`}
                    error={errors.vehicles?.[index]?.phoneCode?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.phoneCode`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs"
                          placeholder="+33"
                          aria-describedby={
                            errors.vehicles?.[index]?.phoneCode
                              ? `vehicles-${index}-phoneCode-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Téléphone"
                    name={`vehicles.${index}.phoneNumber`}
                    error={errors.vehicles?.[index]?.phoneNumber?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.phoneNumber`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs"
                          placeholder="0123456789"
                          aria-describedby={
                            errors.vehicles?.[index]?.phoneNumber
                              ? `vehicles-${index}-phoneNumber-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Date"
                    name={`vehicles.${index}.date`}
                    error={errors.vehicles?.[index]?.date?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.date`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-2 py-1 border rounded text-xs"
                          aria-describedby={
                            errors.vehicles?.[index]?.date
                              ? `vehicles-${index}-date-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Heure"
                    name={`vehicles.${index}.time`}
                    error={errors.vehicles?.[index]?.time?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.time`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="time"
                          className="w-full px-2 py-1 border rounded text-xs"
                          aria-describedby={
                            errors.vehicles?.[index]?.time
                              ? `vehicles-${index}-time-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Ville"
                    name={`vehicles.${index}.city`}
                    error={errors.vehicles?.[index]?.city?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.city`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs col-span-2"
                          placeholder="Paris"
                          aria-describedby={
                            errors.vehicles?.[index]?.city
                              ? `vehicles-${index}-city-error`
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Déchargement"
                    name={`vehicles.${index}.unloading`}
                    error={errors.vehicles?.[index]?.unloading?.message}
                    required
                  >
                    <Controller
                      name={`vehicles.${index}.unloading`}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-2 py-1 border rounded text-xs col-span-2"
                          aria-describedby={
                            errors.vehicles?.[index]?.unloading
                              ? `vehicles-${index}-unloading-error`
                              : undefined
                          }
                        >
                          <option value="lat">Latéral</option>
                          <option value="arr">Arrière</option>
                        </select>
                      )}
                    />
                  </FormField>
                </div>
              </div>
            ))}

            {errors.vehicles && (
              <span
                className="text-xs text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.vehicles.message}
              </span>
            )}
          </div>

          {/* Message conducteur */}
          <FormField
            label="Message du conducteur"
            name="message"
            error={errors.message?.message}
          >
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="message"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F587E] text-sm bg-white min-h-[60px]"
                  placeholder="Message optionnel..."
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />
              )}
            />
          </FormField>

          {/* Bouton enregistrer */}
          <button
            type="submit"
            disabled={isPending || !isDirty || !isValid}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4F587E] text-white font-bold text-base shadow hover:bg-[#3B4252] transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby={
              !isDirty ? "no-changes" : !isValid ? "form-invalid" : undefined
            }
          >
            <Save size={20} />
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>

          {/* Messages d'aide pour l'accessibilité */}
          {!isDirty && (
            <div id="no-changes" className="sr-only">
              Aucune modification à enregistrer
            </div>
          )}
          {!isValid && (
            <div id="form-invalid" className="sr-only">
              Le formulaire contient des erreurs
            </div>
          )}
        </form>

        {/* Modal de confirmation entrée */}
        {showEntryConfirm && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-confirm-title"
            aria-describedby="entry-confirm-description"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200">
              <h2
                id="entry-confirm-title"
                className="text-lg font-bold mb-4 text-gray-900 text-center"
              >
                Confirmer l&apos;entrée du véhicule
              </h2>
              <p
                id="entry-confirm-description"
                className="mb-6 text-gray-700 leading-relaxed text-center text-sm"
              >
                Attention : si vous validez l&apos;entrée, le chrono de présence
                sera activé pour ce véhicule.
                <br />
                <span className="font-semibold text-red-600">
                  Cette action est irréversible.
                </span>{" "}
                La durée sur site sera calculée automatiquement lors de la
                sortie.
                <br />
                Confirmez-vous l&apos;entrée ?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowEntryConfirm(false)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition shadow"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("status", "ENTREE");
                    setShowEntryConfirm(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#4F587E] text-white font-semibold shadow hover:bg-[#3B4252] transition"
                >
                  Valider l&apos;entrée
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </>
  );
}
