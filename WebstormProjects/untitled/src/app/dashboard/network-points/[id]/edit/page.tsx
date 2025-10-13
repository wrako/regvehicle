"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EditNetworkPointHeader } from "@/components/dashboard/network-point-form/EditNetworkPointHeader";
import { EditNetworkPointForm } from "@/components/dashboard/network-point-form/EditNetworkPointForm";
import { ProviderQueue } from "@/components/dashboard/provider-queue";
import { useNetworkPointEdit } from "@/hooks/useNetworkPointEdit";
import { networkPointEditSchema, NetworkPointEditFormData } from "@/utils/networkPointSchema";

export default function EditNetworkPointPage() {
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const id = typeof params?.id === "string" ? parseInt(params.id) : 0;

    const form = useForm<NetworkPointEditFormData>({
        resolver: zodResolver(networkPointEditSchema),
        defaultValues: {
            code: "",
            name: "",
            type: "RLP",
            // validFrom removed - managed via queue start dates
            validTo: undefined as any,
            // providerId removed - system auto-sets owner based on queue
        },
    });

    const { loading, submitting, providers, networkPointData, onSubmit, reloadQueue } = useNetworkPointEdit({ id, form, toast });

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <EditNetworkPointHeader />

            <Card>
                <CardHeader>
                    <CardTitle>Network Point Details</CardTitle>
                    <CardDescription>Update the network point information below</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditNetworkPointForm
                        form={form}
                        providers={providers}
                        submitting={submitting}
                        onSubmit={onSubmit}
                    />
                </CardContent>
            </Card>

            {networkPointData && (
                <ProviderQueue
                    networkPointId={id}
                    queue={networkPointData.providerQueue || []}
                    providers={providers}
                    onUpdate={reloadQueue}
                />
            )}
        </div>
    );
}
