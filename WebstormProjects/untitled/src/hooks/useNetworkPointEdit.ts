import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { getNetworkPoint, updateNetworkPoint, getProviders } from "@/lib/api";
import type { NetworkPointDto } from "@/types";

type NetworkPointFormData = {
    code: string;
    name: string;
    type: "RLP" | "RV" | "RZP" | "OTHER";
    validFrom?: string;
    validTo?: string;
    providerId: number;
};

type UseNetworkPointEditProps = {
    id: number;
    form: UseFormReturn<NetworkPointFormData>;
    toast: any;
};

export function useNetworkPointEdit({ id, form, toast }: UseNetworkPointEditProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);
    const lastIdRef = useRef<number>(0);

    useEffect(() => {
        if (!id) return;

        // StrictMode guard: prevent duplicate calls
        if (lastIdRef.current === id) {
            return;
        }
        lastIdRef.current = id;

        const loadNetworkPoint = async () => {
            try {
                setLoading(true);
                const [networkPoint, providersData]: [NetworkPointDto, any[]] = await Promise.all([
                    getNetworkPoint(id),
                    getProviders()
                ]);
                setProviders(providersData);
                form.reset({
                    code: networkPoint.code,
                    name: networkPoint.name,
                    type: networkPoint.type as NetworkPointFormData["type"],
                    validFrom: networkPoint.validFrom || "",
                    validTo: networkPoint.validTo || "",
                    providerId: networkPoint.providerId || 0,
                });
            } catch (error: any) {
                console.error("Load network point error:", error);
                if (error.message.includes("404")) {
                    toast({
                        title: "Network point not found",
                        description: "The network point you're looking for doesn't exist.",
                        variant: "destructive",
                    });
                    router.push("/dashboard/network-points");
                } else {
                    toast({
                        title: "Error loading network point",
                        description: error?.message || "Please try again.",
                        variant: "destructive",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        loadNetworkPoint();
    }, [id, form, toast, router]);

    const onSubmit = async (data: NetworkPointFormData) => {
        try {
            setSubmitting(true);
            const payload = {
                ...data,
                validFrom: data.validFrom || undefined,
                validTo: data.validTo || undefined,
            };
            await updateNetworkPoint(id, payload);
            toast({
                title: "Network point updated successfully",
                description: "The network point has been updated.",
            });
            router.push("/dashboard/network-points");
        } catch (error: any) {
            console.error("Update network point error:", error);
            toast({
                title: "Error updating network point",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return { loading, submitting, providers, onSubmit };
}
