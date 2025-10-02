"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Building, Trash2, Edit, Archive } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";
import { cancellableFetch } from "@/utils/fetchUtils";

type Provider = {
    id: number;
    providerId: string;
    name: string;
    email?: string;
    address: string;
};

type ProviderRow = Provider & {
    vehicles: number;
    networkPoints: number;
};

export default function ProvidersPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<ProviderRow[]>([]);
    const [loading, setLoading] = useState(false);
    const loadedRef = useRef(false);
    const lastQueryKeyRef = useRef<string>("");

    async function getVehiclesCount(providerId: number): Promise<number> {
        try {
            const res = await fetch(`${API_BASE}/providers/vehicles/${providerId}`);
            if (!res.ok) return 0;
            const txt = await res.text();
            const n = Number(txt);
            return Number.isFinite(n) ? n : 0;
        } catch {
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

    const queryKey = useMemo(() => `${API_BASE}/providers`, []);

    const load = useCallback(async () => {
        // StrictMode guard: prevent duplicate calls
        if (lastQueryKeyRef.current === queryKey) {
            return;
        }
        lastQueryKeyRef.current = queryKey;

        setLoading(true);
        try {
            const base: Provider[] = await cancellableFetch(
                `${API_BASE}/providers`,
                { headers: { Accept: "application/json" } },
                "providers-list"
            );

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
            loadedRef.current = true;
        } catch (e: any) {
            // Ignore abort errors
            if (e.name === 'AbortError') return;

            toast({
                title: "Nepodarilo sa načítať poskytovateľov",
                description: e?.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [queryKey, toast]);

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
            // Reset ref to allow reload
            lastQueryKeyRef.current = "";
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

    async function handleArchive(id: number) {
        if (!confirm("Are you sure you want to archive this provider?")) return;
        try {
            const res = await fetch(`${API_BASE}/providers/${id}/archive`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Provider archived successfully" });
            // Reset ref to allow reload
            lastQueryKeyRef.current = "";
            await load();
        } catch (e: any) {
            console.error("Archive error:", e);
            toast({
                title: "Error archiving provider",
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
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/providers/archived">
                            <Archive className="mr-2 h-4 w-4" />
                            Archived
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/providers/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Provider
                        </Link>
                    </Button>
                </div>
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
                                    <TableHead>Email</TableHead>
                                    <TableHead>Address</TableHead>
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
                                        <TableCell colSpan={7} className="text-center h-24">
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                ) : items.length > 0 ? (
                                    items.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.providerId}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.email || "—"}</TableCell>
                                            <TableCell>{p.address}</TableCell>
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
                                                            onClick={() => handleArchive(p.id)}
                                                        >
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
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
                                        <TableCell colSpan={7} className="h-24 text-center">
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
