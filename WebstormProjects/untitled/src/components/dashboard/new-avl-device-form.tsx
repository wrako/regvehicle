"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const schema = z.object({
    model: z.string().min(1, "Model je povinný."),
    communicationId: z.string().optional(),
    additionalAttributes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewAvlDeviceForm() {
    const { toast } = useToast();
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
            toast({ title: "AVL zariadenie vytvorené" });
            router.push("/dashboard/avl-devices");
        } catch (e: any) {
            toast({ title: "Chyba pri vytváraní", description: e?.message ?? "Skúste znova.", variant: "destructive" });
        }
    }

    return (
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>AVL Device</CardTitle>
                <CardDescription>Enter the details for the new AVL device</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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

                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
