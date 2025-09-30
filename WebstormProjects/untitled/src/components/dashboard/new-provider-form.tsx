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
import { API_BASE } from "@/lib/api";

// Schema for Provider (matches backend entity)
const providerSchema = z.object({
    providerId: z.string().min(1, "Provider ID is required"),
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

// named export to match page import: { NewProviderForm }
export function NewProviderForm() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            providerId: "",
            name: "",
            address: "",
        },
    });

    async function onSubmit(values: ProviderFormValues) {
        try {
            const res = await fetch(`${API_BASE}/providers`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                // Surface backend message if available
                const body = await res.text().catch(() => "");
                let msg = body;
                try {
                    const obj = JSON.parse(body);
                    msg = obj?.message || obj?.error || body;
                } catch {
                    // body is plain text; keep as-is
                }
                throw new Error(msg || "Failed to create provider");
            }

            toast({ title: "Provider created", description: "The provider has been registered." });
            router.push("/dashboard/providers");
        } catch (e: any) {
            toast({
                title: "Error creating provider",
                description: e?.message ?? "Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>New Provider</CardTitle>
                <CardDescription>Fill out provider information</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
                        {/* Provider ID */}
                        <FormField
                            control={form.control}
                            name="providerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider ID *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. ZZS-12345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Provider name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address (full width) */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Address *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Street, City, ZIP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
