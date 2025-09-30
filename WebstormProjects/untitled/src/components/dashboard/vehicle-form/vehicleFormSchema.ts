import * as z from "zod";

const LICENSE_PLATE_RE = /^[A-Z]{2}(?:-\d{3}[A-Z]{2}|\d{3}[A-Z]{2})$/;
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;

export const vehicleFormSchema = z.object({
    licensePlate: z.string().regex(LICENSE_PLATE_RE, "Neplatný formát ŠPZ (napr. BA-123AB alebo BA123AB)"),
    vinNum: z.string().regex(VIN_RE, "VIN musí mať 17 znakov (bez I, O, Q)").transform((s) => s.toUpperCase()),
    brand: z.string().min(1, "Značka je povinná"),
    model: z.string().min(1, "Model je povinný"),
    firstRegistrationDate: z.date().optional(),
    lastTechnicalCheckDate: z.date().optional(),
    technicalCheckValidUntil: z.date({ required_error: "Platnosť STK je povinná" }),
    status: z.enum(["aktívne", "rezerva", "vyradené", "dočasne vyradené", "preregistrované"]),
    providerId: z.string().min(1, "Vyberte poskytovateľa"),
    files: z.any().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const defaultVehicleFormValues: VehicleFormValues = {
    licensePlate: "",
    vinNum: "",
    brand: "",
    model: "",
    firstRegistrationDate: undefined,
    lastTechnicalCheckDate: undefined,
    technicalCheckValidUntil: undefined as any,
    status: "aktívne",
    providerId: "",
    files: undefined,
};