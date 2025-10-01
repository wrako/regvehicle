"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";
import { MoreHorizontal, ArchiveRestore } from "lucide-react";

type NetworkPointType = "RLP" | "RV" | "RZP" | "OTHER";
type NetworkPoint = {
    id: number;
    code: string;
    name: string;
    type: NetworkPointType;
    validFrom?: string | null;
    validTo?: string | null;
};

const typeLabels: Record<NetworkPointType, string> = {
    RLP: "RLP",
    RV: "RV",
    RZP: "RZP",
    OTHER: "Other",
};

function parseLocalDate(s?: string | null): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return isNaN(dt.getTime()) ? null : dt;
}

export default function ArchivedNetworkPointsPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<NetworkPoint[]>([]);
    const [loading, setLoading] = useState(false);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append("size", "100");
        params.append("page", "0");
        return params.toString();
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/network-points/archived/page?${queryParams}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setItems(data.content || []);
        } catch (e: any) {
            console.error("Failed to load archived network points:", e);
            toast({
                title: "Failed to load archived network points",
                description: e?.message,
                variant: "destructive"
            });
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [queryParams, toast]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleUnarchive(id: number) {
        if (!confirm("Are you sure you want to unarchive this network point?")) return;
        try {
            const res = await fetch(`${API_BASE}/network-points/${id}/unarchive`, { method: "POST" });
            if (!res.ok) {
                const errorText = await res.text();
                if (res.status === 409) {
                    toast({
                        title: "Cannot unarchive network point",
                        description: errorText,
                        variant: "destructive"
                    });
                    return;
                }
                throw new Error(errorText);
            }
            toast({ title: "Network point unarchived successfully" });
            await load();
        } catch (e: any) {
            console.error("Unarchive error:", e);
            toast({
                title: "Error unarchiving network point",
                description: e?.message ?? "Please try again.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Archived Network Points</CardTitle>
                    <CardDescription>
                        List of all archived network points in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="text-sm text-muted-foreground py-2">Loading...</div>
                    )}
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
                                {items.length > 0 ? (
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
                                                            <DropdownMenuItem
                                                                onClick={() => handleUnarchive(point.id)}
                                                            >
                                                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                                                Unarchive
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
                                            No archived network points found.
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
