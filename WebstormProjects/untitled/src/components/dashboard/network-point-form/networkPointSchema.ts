import * as z from "zod";

export const networkPointSchema = z.object({
    code: z.string().min(1, "Kód je povinný"),
    name: z.string().min(1, "Názov je povinný"),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"]),
    // validFrom removed - auto-set to TODAY on backend
    validTo: z.date({ required_error: "Dátum ukončenia platnosti je povinný" }),

    // Owner removed from CREATE form - only ONE provider selection (queue provider)
    // Owner can be set later via EDIT form if needed

    // Initial queue entry - REQUIRED on create (EXACTLY ONE provider)
    queueProviderId: z.number({ required_error: "Poskytovateľ je povinný" }),
    providerRegistrationEndDate: z.date({ required_error: "Dátum ukončenia registrácie je povinný" }),
});

export type NetworkPointFormValues = z.infer<typeof networkPointSchema>;