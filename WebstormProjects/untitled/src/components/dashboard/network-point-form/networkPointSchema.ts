import * as z from "zod";

export const networkPointSchema = z.object({
    code: z.string().min(1, "Kód je povinný"),
    name: z.string().min(1, "Názov je povinný"),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"]),
    validFrom: z.date().optional().nullable(),
    validTo: z.date().optional().nullable(),
    providerId: z.number({
        required_error: "Poskytovateľ je povinný",
        invalid_type_error: "Zvoľte poskytovateľa",
    }),
});

export type NetworkPointFormValues = z.infer<typeof networkPointSchema>;