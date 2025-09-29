"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

function parseLocalDate(s?: string | null): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return isNaN(dt.getTime()) ? null : dt;
}

export default function NetworkPointsPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<NetworkPoint[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/network-points`, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as NetworkPoint[];
            setItems(data);
        } catch (e: any) {
            toast({ title: "Nepodarilo sa načítať body siete", description: e?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(id: number) {
        if (!confirm("Naozaj chcete odstrániť tento bod siete?")) return;
        try {
            const res = await fetch(`${API_BASE}/network-points/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Bod siete odstránený" });
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
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Network Points</h1>
                        <p className="text-muted-foreground">Browse and manage all network points</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/dashboard/network-points/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Network Point
                    </Link>
                </Button>
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
                                    items.map((point) => {
                                        const vf = parseLocalDate(point.validFrom);
                                        const vt = parseLocalDate(point.validTo);
                                        return (
                                            <TableRow key={point.id}>
                                                <TableCell className="font-medium">{point.code}</TableCell>
                                                <TableCell>{point.name}</TableCell>
                                                <TableCell><Badge variant="outline">{typeLabels[point.type]}</Badge></TableCell>
                                                <TableCell>{vf ? format(vf, "dd.MM.yyyy", { locale: sk }) : "-"}</TableCell>
                                                <TableCell>{vt ? format(vt, "dd.MM.yyyy", { locale: sk }) : "-"}</TableCell>
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
                                                            {/* Add edit page if needed: <DropdownMenuItem asChild><Link href={`/dashboard/network-points/${point.id}/edit`}>Edit</Link></DropdownMenuItem> */}
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
                                        );
                                    })
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
