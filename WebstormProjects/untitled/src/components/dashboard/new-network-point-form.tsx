"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getProviders } from "@/lib/api";
import { submitNetworkPoint } from "@/utils/networkPointSubmit";
import { networkPointSchema, NetworkPointFormValues } from "./network-point-form/networkPointSchema";
import { NetworkPointFormFields } from "./network-point-form/NetworkPointFormFields";

// named export to match page import: { NewNetworkPointForm }
export function NewNetworkPointForm() {
    const router = useRouter();
    const { toast } = useToast();

    const [providers, setProviders] = useState<Array<{ id: number; name?: string; companyName?: string }>>([]);

    useEffect(() => {
        (async () => {
            try {
                const list = await getProviders();
                setProviders(Array.isArray(list) ? list : []);
            } catch (e: any) {
                toast({
                    title: "Nedá sa načítať poskytovateľov",
                    description: e?.message ?? "Skúste znova neskôr.",
                    variant: "destructive",
                });
            }
        })();
    }, []); // load once

    const form = useForm<NetworkPointFormValues>({
        resolver: zodResolver(networkPointSchema),
        defaultValues: {
            code: "",
            name: "",
            type: "RLP",
            validFrom: undefined,
            validTo: undefined,
            providerId: undefined as unknown as number,
        },
    });

    async function onSubmit(v: NetworkPointFormValues) {
        const success = await submitNetworkPoint(v, toast);
        if (success) {
            router.push("/dashboard/network-points");
        }
    }

    return (
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>Network Point</CardTitle>
                <CardDescription>Vytvorte nový bod siete</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
                        <NetworkPointFormFields control={form.control} providers={providers} />
                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => history.back()}>
                                Zrušiť
                            </Button>
                            <Button type="submit">Uložiť</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
