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
import { createProvider } from "@/lib/api";

// Schema for Provider (matches backend entity)
const providerSchema = z.object({
    providerId: z.string().min(1, "Provider ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
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
            email: "",
            address: "",
        },
    });

    async function onSubmit(values: ProviderFormValues) {
        try {
            await createProvider(values);
            toast({ title: "Poskytovateľ vytvorený", description: "Poskytovateľ bol úspešne zaregistrovaný." });
            router.push("/dashboard/providers");
        } catch (e: any) {
            toast({
                title: "Chyba pri vytváraní poskytovateľa",
                description: e?.message ?? "Skúste to znova.",
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

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@example.com" {...field} />
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
