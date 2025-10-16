"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, SatelliteDish, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";
import { cancellableFetch } from "@/utils/fetchUtils";
import { getAuthHeaders } from "@/lib/auth-headers";

type AvlDevice = {
    id: number;
    model: string;
    communicationId?: string | null;
    additionalAttributes?: string | null;
};

export default function AvlDevicesPage() {
    const { toast } = useToast();
    const [devices, setDevices] = useState<AvlDevice[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const lastQueryKeyRef = useRef<string>("");

    const queryKey = useMemo(() => `${API_BASE}/avl-devices`, []);

    const load = useCallback(async () => {
        // StrictMode guard: prevent duplicate calls
        if (lastQueryKeyRef.current === queryKey) {
            return;
        }
        lastQueryKeyRef.current = queryKey;

        try {
            setLoading(true);
            const data = await cancellableFetch<AvlDevice[]>(
                `${API_BASE}/avl-devices`,
                { headers: { Accept: "application/json", ...getAuthHeaders() } },
                "avl-devices-list"
            );
            setDevices(data);
        } catch (e: any) {
            // Ignore abort errors
            if (e.name === 'AbortError') return;

            toast({ title: "Nepodarilo sa načítať AVL zariadenia", description: e?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [queryKey, toast]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(id: number) {
        if (!confirm("Naozaj chcete odstrániť toto AVL zariadenie?")) return;
        try {
            const res = await fetch(`${API_BASE}/avl-devices/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "Zariadenie odstránené" });
            // Reset ref to allow reload
            lastQueryKeyRef.current = "";
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
                        <SatelliteDish className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">AVL Devices</h1>
                        <p className="text-muted-foreground">Browse and manage all AVL devices</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/dashboard/avl-devices/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New AVL Device
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>AVL Device List</CardTitle>
                    <CardDescription>A list of all registered AVL devices in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Communication ID</TableHead>
                                    <TableHead>Additional Attributes</TableHead>
                                    <TableHead className="w-[1%]">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Loading…</TableCell>
                                    </TableRow>
                                ) : devices.length > 0 ? (
                                    devices.map((device) => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">{device.model}</TableCell>
                                            <TableCell>{device.communicationId ?? ""}</TableCell>
                                            <TableCell>{device.additionalAttributes ?? ""}</TableCell>
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
                                                        {/* Hook this up later if you add an edit page:
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/avl-devices/${device.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            */}
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                                            onClick={() => handleDelete(device.id)}
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
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No AVL devices found.
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
