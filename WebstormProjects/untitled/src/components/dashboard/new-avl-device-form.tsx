"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormCard, FormActions } from "@/components/common";
import { useErrorToast } from "@/hooks/useErrorToast";
import { API_BASE } from "@/constants/api";

const schema = z.object({
    model: z.string().min(1, "Model je povinný."),
    communicationId: z.string().optional(),
    additionalAttributes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewAvlDeviceForm() {
    const { showError, showSuccess } = useErrorToast();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { model: "", communicationId: "", additionalAttributes: "" },
    });

    async function onSubmit(values: FormValues) {
        try {
            const res = await fetch(`${API_BASE}/avl-devices`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("AVL zariadenie vytvorené");
            router.push("/dashboard/avl-devices");
        } catch (e: any) {
            showError(e, "Chyba pri vytváraní", "Skúste znova.");
        }
    }

    return (
        <FormCard title="AVL Device" description="Enter the details for the new AVL device">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model *</FormLabel>
                                <FormControl><Input placeholder="Fleetware FW" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="communicationId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Communication ID</FormLabel>
                                <FormControl><Input placeholder="FW2001" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="additionalAttributes"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Additional Attributes</FormLabel>
                                <FormControl><Input placeholder="…" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormActions submitText="Save" cancelText="Cancel" />
                </form>
            </Form>
        </FormCard>
    );
}
