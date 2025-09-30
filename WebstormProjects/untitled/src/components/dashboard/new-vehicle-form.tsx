"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createVehicle, getProviders } from "@/lib/api";
import { uploadVehicleFiles } from "@/utils";
import { buildVehiclePayload, submitVehicle } from "@/utils/vehicleFormSubmit";
import { useLicensePlateValidation } from "@/hooks/useLicensePlateValidation";
import {
    VehicleBasicFields,
    VehicleDateFields,
    VehicleStatusFields,
    VehicleFileUpload,
    VinConfirmationDialog,
    vehicleFormSchema,
    defaultVehicleFormValues,
    VehicleFormValues,
} from "./vehicle-form";

type Props = {
    vehicleId?: string;
    vehicle?: Partial<VehicleFormValues>;
    onSuccess?: () => void;
};

export function NewVehicleForm({ vehicleId, vehicle, onSuccess }: Props) {
    const { toast } = useToast();
    const router = useRouter();

    const [providerOptions, setProviderOptions] = useState<any[]>([]);
    const [confirmReRegOpen, setConfirmReRegOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<any | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: vehicle ?? defaultVehicleFormValues,
    });

    const edit = !!vehicleId;

    useEffect(() => {
        (async () => {
            try {
                const [prov] = await Promise.all([getProviders()]);
                setProviderOptions(prov || []);
            } catch (e) {
                console.error("Failed to load reference data", e);
            }
        })();
    }, []);

    useLicensePlateValidation(form, "licensePlate");

    async function onSubmit(v: VehicleFormValues) {
        const payload = buildVehiclePayload(v, edit, vehicleId);

        try {
            const result = await submitVehicle(payload, edit, vehicleId);
            if ((result as any)?.needsConfirmation) {
                setPendingPayload((result as any).payload);
                setConfirmReRegOpen(true);
                return;
            }

            toast({ title: edit ? "Vozidlo aktualizované" : "Vozidlo zaregistrované" });

            const newId: number | undefined = Number(vehicleId) || Number((result as any)?.id) || Number((result as any)?.data?.id);
            if (Number.isFinite(newId)) {
                const files = form.getValues("files") as FileList | undefined;
                await uploadVehicleFiles(newId!, files);
            }

            onSuccess ? onSuccess() : router.push("/dashboard");
        } catch (e: any) {
            toast({ title: "Chyba pri ukladaní", description: e?.message ?? "Skúste znova neskôr.", variant: "destructive" });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <Card className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle>{edit ? "Edit Vehicle" : "Vehicle Information"}</CardTitle>
                        <CardDescription>
                            {edit ? "Update vehicle details" : "Enter the details for the new vehicle registration"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <VehicleBasicFields control={form.control} clearErrors={form.clearErrors} />
                            <VehicleDateFields control={form.control} />
                            <VehicleStatusFields control={form.control} providerOptions={providerOptions} />
                            <VehicleFileUpload control={form.control} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Zrušiť
                    </Button>
                    <Button type="submit">{edit ? "Uložiť zmeny" : "Zaregistrovať vozidlo"}</Button>
                </div>
            </form>

            <VinConfirmationDialog
                open={confirmReRegOpen}
                onOpenChange={setConfirmReRegOpen}
                onConfirm={async () => {
                    if (!pendingPayload) return;
                    try {
                        setSubmitting(true);
                        const saved = await createVehicle(pendingPayload);
                        toast({ title: "Vozidlo zaregistrované" });

                        const newId: number | undefined = Number(saved?.id) || Number(saved?.data?.id);
                        if (Number.isFinite(newId)) {
                            const files = form.getValues("files") as FileList | undefined;
                            await uploadVehicleFiles(newId!, files);
                        }
                        onSuccess ? onSuccess() : router.push("/dashboard");
                    } catch (e: any) {
                        toast({ title: "Chyba pri preregistrácii", description: e?.message ?? "Skúste znova neskôr.", variant: "destructive" });
                    } finally {
                        setSubmitting(false);
                        setConfirmReRegOpen(false);
                        setPendingPayload(null);
                    }
                }}
                onCancel={() => {
                    setConfirmReRegOpen(false);
                    setPendingPayload(null);
                    setSubmitting(false);
                }}
                submitting={submitting}
            />
        </Form>
    );
}
