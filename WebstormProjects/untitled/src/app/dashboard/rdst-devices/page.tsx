"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, RadioTower, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";
import { cancellableFetch } from "@/utils/fetchUtils";

type RdstDevice = { id: number; model: string; rdstId: string };

export default function RdstDevicesPage() {
    const { toast } = useToast();
    const [devices, setDevices] = useState<RdstDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const lastQueryKeyRef = useRef<string>("");

    const queryKey = useMemo(() => `${API_BASE}/rdst-devices`, []);

    const load = useCallback(async () => {
        // StrictMode guard: prevent duplicate calls
        if (lastQueryKeyRef.current === queryKey) {
            return;
        }
        lastQueryKeyRef.current = queryKey;

        setLoading(true);
        try {
            const data = await cancellableFetch<RdstDevice[]>(
                `${API_BASE}/rdst-devices`,
                { headers: { Accept: "application/json" } },
                "rdst-devices-list"
            );
            setDevices(data);
        } catch (e: any) {
            // Ignore abort errors
            if (e.name === 'AbortError') return;

            toast({ title: "Nepodarilo sa načítať RDST zariadenia", description: e?.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [queryKey, toast]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(id: number) {
        if (!confirm("Naozaj chcete odstrániť toto RDST zariadenie?")) return;
        try {
            const res = await fetch(`${API_BASE}/rdst-devices/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "RDST zariadenie odstránené" });
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
                        <RadioTower className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">RDST Devices</h1>
                        <p className="text-muted-foreground">Browse and manage all RDST devices</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/dashboard/rdst-devices/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New RDST Device
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>RDST Device List</CardTitle>
                    <CardDescription>A list of all registered RDST devices in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>RDST ID</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Loading…</TableCell></TableRow>
                                ) : devices.length > 0 ? (
                                    devices.map((device) => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">{device.model}</TableCell>
                                            <TableCell>{device.rdstId}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {/* Later: add edit page link */}
                                                        <DropdownMenuItem
                                                            className="text-destructive"
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
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">No RDST devices found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
