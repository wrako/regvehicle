import { API_BASE } from "@/lib/api";
import { checkProviderCapacity } from "@/utils";
import { toApiDate } from "@/lib/date";

type NetworkPointFormValues = {
    code: string;
    name: string;
    type: "RLP" | "RV" | "RZP" | "OTHER";
    // validFrom removed - auto-set to TODAY on backend
    validTo?: Date | null;
    // providerId removed from CREATE - only ONE provider (queueProviderId)
    queueProviderId?: number | null; // REQUIRED on create - EXACTLY ONE provider
    providerRegistrationEndDate?: Date | null; // REQUIRED on create
};

export async function submitNetworkPoint(
    values: NetworkPointFormValues,
    toast: (config: any) => void,
    bypassCapacityCheck: boolean = false
): Promise<boolean> {
    // Check capacity only if queue provider is being added AND not bypassed
    if (values.queueProviderId && !bypassCapacityCheck) {
        const capacity = await checkProviderCapacity(values.queueProviderId);
        if (!capacity.ok) {
            toast({
                title: "Nedá sa pridať bod siete",
                description: `Provider has only ${capacity.have} vehicles but must have ${capacity.required} vehicles.`,
                variant: "destructive",
            });
            return false;
        }
    }

    const payload = {
        code: values.code,
        name: values.name,
        type: values.type,
        // validFrom removed - auto-set to TODAY on backend
        validTo: toApiDate(values.validTo) ?? null,
        // providerId removed from CREATE - backend will handle owner if needed
        queueProviderId: values.queueProviderId, // REQUIRED - EXACTLY ONE provider
        providerRegistrationEndDate: toApiDate(values.providerRegistrationEndDate), // REQUIRED
    };

    try {
        const url = new URL(`${API_BASE}/network-points`);
        url.searchParams.set("bypassCapacityCheck", String(bypassCapacityCheck));

        const res = await fetch(url.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        if (res.status === 409) {
            const body = await res.text();
            let msg = body;
            try {
                const obj = JSON.parse(body);
                msg = obj?.message || obj?.error || body;
            } catch {
                // plain text
            }
            toast({
                title: "Nedá sa pridať bod siete",
                description: msg || "Provider has only N vehicles but must have X vehicles.",
                variant: "destructive",
            });
            return false;
        }

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || "Chyba pri vytváraní");
        }

        toast({ title: "Bod siete vytvorený" });
        return true;
    } catch (e: any) {
        toast({
            title: "Chyba pri vytváraní",
            description: e?.message ?? "Skúste znova.",
            variant: "destructive",
        });
        return false;
    }
}