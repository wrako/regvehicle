import * as z from "zod";

export const networkPointEditSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"] as const, {
        required_error: "Type is required",
    }),
    // validFrom removed - managed via queue start dates
    validTo: z.date({ required_error: "Valid To date is required" }),
    // providerId removed - system auto-sets owner based on current provider in queue
});

export type NetworkPointEditFormData = z.infer<typeof networkPointEditSchema>;
