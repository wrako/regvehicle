"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, MapPin, Trash2, Edit, Archive, Clock, History } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";
import { runExpireCheckNetworkPoints } from "@/lib/api";
import { cancellableFetch } from "@/utils/fetchUtils";
import { formatDate } from "@/lib/date";

type NetworkPointType = "RLP" | "RV" | "RZP" | "OTHER";
type NetworkPoint = {
    id: number;
    code: string;
    name: string;
    type: NetworkPointType;
    validFrom?: string | null; // yyyy-MM-dd
    validTo?: string | null;   // yyyy-MM-dd
};

const typeLabels: Record<NetworkPointType, string> = {
    RLP: "RLP",
    RV: "RV",
    RZP: "RZP",
    OTHER: "Other",
};

export default function NetworkPointsPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<NetworkPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingExpired, setCheckingExpired] = useState(false);
    const lastQueryKeyRef = useRef<string>("");

    function getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    const queryKey = useMemo(() => `${API_BASE}/network-points`, []);

    const load = useCallback(async () => {
        // StrictMode guard: prevent duplicate calls
        if (lastQueryKeyRef.current === queryKey) {
            return;
        }
        lastQueryKeyRef.current = queryKey;

        setLoading(true);
        try {
            const data = await cancellableFetch<NetworkPoint[]>(
                `${API_BASE}/network-points`,
                { headers: { Accept: "application/json", ...getAuthHeaders() } },
                "network-points-list"
            );
            setItems(data);
        } catch (e: any) {
            // Ignore abort errors
            if (e.name === 'AbortError') return;

            toast({ title: "Nepodarilo sa načítať body siete", description: e?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [queryKey, toast]);

    useEffect(() => { load(); }, [load]);

    async function handleCheckExpirations() {
        setCheckingExpired(true);
        try {
            const result = await runExpireCheckNetworkPoints();
            const { checked, archived, skippedArchived, errors } = result;

            let description = `Checked: ${checked}, Archived: ${archived}`;
            if (skippedArchived > 0) {
                description += `, Skipped: ${skippedArchived}`;
            }

            toast({
                title: "Expiration check completed",
                description,
                variant: errors && errors.length > 0 ? "destructive" : "default"
            });

            await load();
        } catch (e: any) {
            console.error("Expiration check error:", e);
            toast({
                title: "Error checking expirations",
                description: e?.message ?? "Please try again.",
                variant: "destructive"
            });
        } finally {
            setCheckingExpired(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this network point?")) return;
        try {
            const res = await fetch(`${API_BASE}/network-points/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                const errorText = await res.text();
                if (res.status === 409) {
                    toast({
                        title: "Cannot delete network point",
                        description: "This network point is being used by vehicles and cannot be deleted.",
                        variant: "destructive"
                    });
                    return;
                }
                throw new Error(errorText);
            }
            toast({ title: "Network point deleted successfully" });
            // Reset ref to allow reload
            lastQueryKeyRef.current = "";
            await load();
        } catch (e: any) {
            console.error("Delete error:", e);
            toast({ title: "Error deleting network point", description: e?.message ?? "Please try again.", variant: "destructive" });
        }
    }

    async function handleArchive(id: number) {
        if (!confirm("Are you sure you want to archive this network point?")) return;
        try {
            const res = await fetch(`${API_BASE}/network-points/${id}/archive`, {
                method: "POST",
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Network point archived successfully" });
            // Reset ref to allow reload
            lastQueryKeyRef.current = "";
            await load();
        } catch (e: any) {
            console.error("Archive error:", e);
            toast({
                title: "Error archiving network point",
                description: e?.message ?? "Please try again.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Network Points</h1>
                        <p className="text-muted-foreground">Browse and manage all network points</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCheckExpirations}
                        disabled={checkingExpired}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        {checkingExpired ? "Checking..." : "Check expirations"}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/network-points/archived">
                            <Archive className="mr-2 h-4 w-4" />
                            Archived
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/network-points/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Network Point
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Network Point List</CardTitle>
                    <CardDescription>A list of all registered network points in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Valid From</TableHead>
                                    <TableHead>Valid To</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">Loading…</TableCell>
                                    </TableRow>
                                ) : items.length > 0 ? (
                                    items.map((point) => (
                                        <TableRow key={point.id}>
                                            <TableCell className="font-medium">{point.code}</TableCell>
                                            <TableCell>{point.name}</TableCell>
                                            <TableCell><Badge variant="outline">{typeLabels[point.type]}</Badge></TableCell>
                                            <TableCell>{formatDate(point.validFrom) || "-"}</TableCell>
                                            <TableCell>{formatDate(point.validTo) || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/network-points/${point.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/network-points/${point.id}/history`}>
                                                                <History className="mr-2 h-4 w-4" />
                                                                História
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleArchive(point.id)}
                                                        >
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                                            onClick={() => handleDelete(point.id)}
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
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No network points found.
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
