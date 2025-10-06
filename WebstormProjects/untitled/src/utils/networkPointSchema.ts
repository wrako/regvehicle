import * as z from "zod";

export const networkPointEditSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"] as const, {
        required_error: "Type is required",
    }),
    validFrom: z.date().optional().nullable(),
    validTo: z.date().optional().nullable(),
    providerId: z.number().min(1, "Provider is required"),
});

export type NetworkPointEditFormData = z.infer<typeof networkPointEditSchema>;
