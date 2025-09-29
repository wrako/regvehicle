"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Building, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Provider = {
    id: number;
    providerId: string;
    name: string;
    address: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function ProvidersPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/providers`, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(await res.text());
            setItems(await res.json());
        } catch (e: any) {
            toast({ title: "Nepodarilo sa načítať poskytovateľov", description: e?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(id: number) {
        if (!confirm("Naozaj chcete odstrániť tohto poskytovateľa?")) return;
        try {
            const res = await fetch(`${API_BASE}/providers/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Poskytovateľ odstránený" });
            await load();
        } catch (e: any) {
            toast({ title: "Chyba pri mazaní", description: e?.message ?? "Skúste znova.", variant: "destructive" });
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Providers</h1>
                        <p className="text-muted-foreground">Browse and manage all providers</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/dashboard/providers/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Provider
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Provider List</CardTitle>
                    <CardDescription>A list of all registered providers in the EMS system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">Loading…</TableCell></TableRow>
                                ) : items.length > 0 ? (
                                    items.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.providerId}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.address}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {/* Add edit page later */}
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(p.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No providers found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
