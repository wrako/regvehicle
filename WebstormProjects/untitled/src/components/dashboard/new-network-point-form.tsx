"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { API_BASE, getProviders } from "@/lib/api";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

const schema = z.object({
    code: z.string().min(1, "Kód je povinný"),
    name: z.string().min(1, "Názov je povinný"),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"]),
    validFrom: z.date().optional().nullable(),
    validTo: z.date().optional().nullable(),
    providerId: z.number({
        required_error: "Poskytovateľ je povinný",
        invalid_type_error: "Zvoľte poskytovateľa",
    }),
});

type FormValues = z.infer<typeof schema>;

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

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
            name: "",
            type: "RLP",
            validFrom: undefined,
            validTo: undefined,
            providerId: undefined as unknown as number,
        },
    });

    // --- uses your ProviderController helper endpoints ---
    async function getProviderVehiclesCount(providerId: number): Promise<number> {
        const res = await fetch(`${API_BASE}/providers/vehicles/${providerId}`, { credentials: "include" });
        if (!res.ok) return 0;
        const txt = await res.text();
        const n = Number(txt);
        return Number.isFinite(n) ? n : 0;
    }

    async function getProviderNetworkPointsCount(providerId: number): Promise<number> {
        const res = await fetch(`${API_BASE}/providers/network-point/${providerId}`, { credentials: "include" });
        if (!res.ok) return 0;
        const txt = await res.text();
        const n = Number(txt);
        return Number.isFinite(n) ? n : 0;
    }
    // ---------------------------------------------------

    async function onSubmit(v: FormValues) {
        const providerId = v.providerId;

        // Client-side capacity precheck → SAME red destructive toast as unarchive
        const have = await getProviderVehiclesCount(providerId);
        const nn = await getProviderNetworkPointsCount(providerId);
        const required = Math.ceil(1.3 * (nn + 1));

        if (have < required) {
            toast({
                title: "Nedá sa pridať bod siete",
                description: `Provider has only ${have} vehicles but must have ${required} vehicles.`,
                variant: "destructive",
            });
            return; // do not POST
        }

        const payload = {
            code: v.code,
            name: v.name,
            type: v.type,
            validFrom: v.validFrom ? format(v.validFrom, "yyyy-MM-dd") : null,
            validTo: v.validTo ? format(v.validTo, "yyyy-MM-dd") : null,
            providerId: v.providerId,
        };

        try {
            const res = await fetch(`${API_BASE}/network-points`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            // Fallback if backend still returns 409: show SAME toast style and exact message if provided
            if (res.status === 409) {
                const body = await res.text();
                let msg = body;
                try {
                    const obj = JSON.parse(body);
                    msg = obj?.message || obj?.error || body;
                } catch {
                    // plain text
                }
                toast({
                    title: "Nedá sa pridať bod siete",
                    description: msg || "Provider has only N vehicles but must have X vehicles.",
                    variant: "destructive",
                });
                return;
            }

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || "Chyba pri vytváraní");
            }

            toast({ title: "Bod siete vytvorený" });
            router.push("/dashboard/network-points");
        } catch (e: any) {
            toast({
                title: "Chyba pri vytváraní",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
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
                        {/* Kód */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kód *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="NP-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Názov */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Názov *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Stanica 01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Typ */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Typ *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Vyberte typ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RLP">RLP</SelectItem>
                                            <SelectItem value="RV">RV</SelectItem>
                                            <SelectItem value="RZP">RZP</SelectItem>
                                            <SelectItem value="OTHER">Iné</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Platné od */}
                        <FormField
                            control={form.control}
                            name="validFrom"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Platné od</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ?? undefined}
                                                onSelect={(d) => field.onChange(d ?? null)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Platné do */}
                        <FormField
                            control={form.control}
                            name="validTo"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Platné do</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ?? undefined}
                                                onSelect={(d) => field.onChange(d ?? null)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Poskytovateľ */}
                        <FormField
                            control={form.control}
                            name="providerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poskytovateľ *</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Vyberte poskytovateľa" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {providers.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name || p.companyName || `#${p.id}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
