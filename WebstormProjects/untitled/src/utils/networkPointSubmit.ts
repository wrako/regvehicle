import { format } from "date-fns";
import { API_BASE } from "@/lib/api";
import { checkProviderCapacity } from "@/utils";

type NetworkPointFormValues = {
    code: string;
    name: string;
    type: "RLP" | "RV" | "RZP" | "OTHER";
    validFrom?: Date | null;
    validTo?: Date | null;
    providerId: number;
};

export async function submitNetworkPoint(
    values: NetworkPointFormValues,
    toast: (config: any) => void
): Promise<boolean> {
    const capacity = await checkProviderCapacity(values.providerId);
    if (!capacity.ok) {
        toast({
            title: "Nedá sa pridať bod siete",
            description: `Provider has only ${capacity.have} vehicles but must have ${capacity.required} vehicles.`,
            variant: "destructive",
        });
        return false;
    }

    const payload = {
        code: values.code,
        name: values.name,
        type: values.type,
        validFrom: values.validFrom ? format(values.validFrom, "yyyy-MM-dd") : null,
        validTo: values.validTo ? format(values.validTo, "yyyy-MM-dd") : null,
        providerId: values.providerId,
    };

    try {
        const res = await fetch(`${API_BASE}/network-points`, {
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