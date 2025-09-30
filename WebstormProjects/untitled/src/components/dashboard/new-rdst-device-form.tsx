"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FormCard, FormActions } from "@/components/common";
import { API_BASE } from "@/constants/api";

const schema = z.object({
    model: z.string().min(1, "Model je povinný."),
    rdstId: z.string().min(1, "RDST ID je povinné."),
});
type FormValues = z.infer<typeof schema>;

export function NewRdstDeviceForm() {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { model: "", rdstId: "" } });

    async function onSubmit(values: FormValues) {
        try {
            const res = await fetch(`${API_BASE}/rdst-devices`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "RDST zariadenie vytvorené" });
            router.push("/dashboard/rdst-devices");
        } catch (e: any) {
            toast({ title: "Chyba pri vytváraní", description: e?.message ?? "Skúste znova.", variant: "destructive" });
        }
    }

    return (
        <FormCard title="RDST Device" description="Enter the details for the new RDST device">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model *</FormLabel>
                                <FormControl><Input placeholder="Motorola MTM" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rdstId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RDST ID *</FormLabel>
                                <FormControl><Input placeholder="MTM1001" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormActions submitText="Save" cancelText="Cancel" className="flex justify-end gap-2 pt-2" />
                </form>
            </Form>
        </FormCard>
    );
}
