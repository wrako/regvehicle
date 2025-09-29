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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const schema = z.object({
    code: z.string().min(1, "Kód je povinný."),
    name: z.string().min(1, "Názov je povinný."),
    type: z.enum(["RLP", "RV", "RZP", "OTHER"], { required_error: "Typ je povinný." }),
    validFrom: z.date().optional(),
    validTo: z.date().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewNetworkPointForm() {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { code: "", name: "", type: "RLP", validFrom: undefined, validTo: undefined },
    });

    async function onSubmit(v: FormValues) {
        const payload = {
            code: v.code,
            name: v.name,
            type: v.type,
            validFrom: v.validFrom ? format(v.validFrom, "yyyy-MM-dd") : null,
            validTo: v.validTo ? format(v.validTo, "yyyy-MM-dd") : null,
        };
        try {
            const res = await fetch(`${API_BASE}/network-points`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Bod siete vytvorený" });
            router.push("/dashboard/network-points");
        } catch (e: any) {
            toast({ title: "Chyba pri vytváraní", description: e?.message ?? "Skúste znova.", variant: "destructive" });
        }
    }

    return (
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>Network Point</CardTitle>
                <CardDescription>Enter the details for the new network point</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code *</FormLabel>
                                    <FormControl><Input placeholder="ST-01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl><Input placeholder="Stanica 01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RLP">RLP</SelectItem>
                                            <SelectItem value="RV">RV</SelectItem>
                                            <SelectItem value="RZP">RZP</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="validFrom"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Valid From</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full justify-start", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd.MM.yyyy") : <span>Pick a date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="validTo"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Valid To</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full justify-start", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd.MM.yyyy") : <span>Pick a date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
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
