import { z } from "zod";

// ─── Core Schemas ────────────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid({ message: "Invalid UUID parameter format." });

export const emailSchema = z.string().email({ message: "Invalid email address format." });

// ─── Pagination Query Schema ──────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
  search: z.string().optional()
});

// ─── User Onboarding Schema ───────────────────────────────────────────────────

export const onboardingDraftSchema = z.object({
  first_name: z.string().min(1, "First name is required.").max(50),
  last_name: z.string().min(1, "Last name is required.").max(50),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").max(15),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD format."),
  occupation: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  license_number: z.string().min(5, "Invalid license number length.").optional(),
  issuing_country: z.string().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry must be YYYY-MM-DD.").optional(),
  govt_id_type: z.enum(["Aadhaar", "Passport", "PAN"]).optional(),
  govt_id_number: z.string().optional()
});

// ─── Booking Create Schema ────────────────────────────────────────────────────

export const bookingCreateSchema = z.object({
  vehicleId: uuidSchema,
  pickupDatetime: z.string().datetime({ message: "Pickup must be a valid ISO datetime." }),
  returnDatetime: z.string().datetime({ message: "Return must be a valid ISO datetime." }),
  totalAmount: z.number().nonnegative("Total amount must be greater than or equal to 0.")
});

// ─── Vehicle Update Status Schema ─────────────────────────────────────────────

export const vehicleUpdateSchema = z.object({
  vehicleIds: z.array(uuidSchema).min(1, "At least one vehicle ID is required."),
  action: z.enum(["mark_available", "send_to_cleaning", "send_to_maintenance", "disable"])
});

// ─── Maintenance Job Create Schema ────────────────────────────────────────────

export const maintenanceJobCreateSchema = z.object({
  vehicleId: uuidSchema,
  triggerType: z.enum(["mileage", "incident", "duration", "manual"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().max(1000).optional(),
  workshop: z.string().max(200).optional(),
  estimatedCost: z.number().nonnegative().optional(),
  estimatedCompletion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format.").optional()
});
