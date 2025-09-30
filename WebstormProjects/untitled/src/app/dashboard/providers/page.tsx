"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Building, Trash2, Edit } from "lucide-react";
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

// NEW: row type including counts
type ProviderRow = Provider & {
    vehicles: number;
    networkPoints: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function ProvidersPage() {
    const { toast } = useToast();
    // CHANGED: items now include counts
    const [items, setItems] = useState<ProviderRow[]>([]);
    const [loading, setLoading] = useState(false);

    // NEW: helpers to get counts from ProviderController
    async function getVehiclesCount(providerId: number): Promise<number> {
        try {
            const res = await fetch(`${API_BASE}/providers/vehicles/${providerId}`);
            if (!res.ok) return 0;
            const txt = await res.text();
            const n = Number(txt);
            return Number.isFinite(n) ? n : 0;
        } catch {
            // avoid noisy toasts; just fallback to 0
            return 0;
        }
    }

    async function getNetworkPointsCount(providerId: number): Promise<number> {
        try {
            const res = await fetch(`${API_BASE}/providers/network-point/${providerId}`);
            if (!res.ok) return 0;
            const txt = await res.text();
            const n = Number(txt);
            return Number.isFinite(n) ? n : 0;
        } catch {
            return 0;
        }
    }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/providers`, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(await res.text());
            const base: Provider[] = await res.json();

            // NEW: fetch counts for each provider in parallel
            const withCounts: ProviderRow[] = await Promise.all(
                base.map(async (p) => {
                    const [vehicles, networkPoints] = await Promise.all([
                        getVehiclesCount(p.id),
                        getNetworkPointsCount(p.id),
                    ]);
                    return { ...p, vehicles, networkPoints };
                })
            );

            setItems(withCounts);
        } catch (e: any) {
            toast({
                title: "Nepodarilo sa načítať poskytovateľov",
                description: e?.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this provider?")) return;
        try {
            const res = await fetch(`${API_BASE}/providers/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const errorText = await res.text();
                if (res.status === 409) {
                    toast({
                        title: "Cannot delete provider",
                        description: "This provider is being used by vehicles and cannot be deleted.",
                        variant: "destructive",
                    });
                    return;
                }
                throw new Error(errorText);
            }
            toast({ title: "Provider deleted successfully" });
            await load();
        } catch (e: any) {
            console.error("Delete error:", e);
            toast({
                title: "Error deleting provider",
                description: e?.message ?? "Please try again.",
                variant: "destructive",
            });
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
                                    {/* NEW: counts columns */}
                                    <TableHead>Vehicles</TableHead>
                                    <TableHead>Network Points</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        {/* CHANGED colSpan from 4 to 6 */}
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                ) : items.length > 0 ? (
                                    items.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.providerId}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.address}</TableCell>
                                            {/* NEW: counts */}
                                            <TableCell>{p.vehicles}</TableCell>
                                            <TableCell>{p.networkPoints}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/providers/${p.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
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
                                    <TableRow>
                                        {/* CHANGED colSpan from 4 to 6 */}
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No providers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
