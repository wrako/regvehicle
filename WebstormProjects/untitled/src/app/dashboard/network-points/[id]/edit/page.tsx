"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getNetworkPoint, updateNetworkPoint, getProviders } from "@/lib/api";
import type { NetworkPointDto, NetworkPointType } from "@/types";

const networkPointSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    // CHANGED: align enum with create page
    type: z.enum(["RLP", "RV", "RZP", "OTHER"] as const, {
        required_error: "Type is required",
    }),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    providerId: z.number().min(1, "Provider is required"),
});

type NetworkPointFormData = z.infer<typeof networkPointSchema>;

// CHANGED: labels aligned with create page values
const typeLabels: Record<NetworkPointType, string> = {
    RLP: "RLP",
    RV: "RV",
    RZP: "RZP",
    OTHER: "Other",
};

export default function EditNetworkPointPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const id = typeof params?.id === "string" ? parseInt(params.id) : 0;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);

    const form = useForm<NetworkPointFormData>({
        resolver: zodResolver(networkPointSchema),
        defaultValues: {
            code: "",
            name: "",
            // CHANGED: default to a valid create-page value
            type: "RLP",
            validFrom: "",
            validTo: "",
            providerId: 0,
        },
    });

    useEffect(() => {
        if (!id) return;

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
                    // networkPoint.type is expected to be one of: "RLP" | "RV" | "RZP" | "OTHER"
                    type: networkPoint.type as NetworkPointType,
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/network-points">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Edit Network Point</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Edit Network Point</h2>
                    <p className="text-muted-foreground">Update network point information</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Network Point Details</CardTitle>
                    <CardDescription>Update the network point information below</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter network point code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter network point name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select network point type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(typeLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="providerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {providers.map((provider) => (
                                                    <SelectItem key={provider.id} value={provider.id.toString()}>
                                                        {provider.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="validFrom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valid From (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="validTo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valid To (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Updating..." : "Update Network Point"}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/dashboard/network-points">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
