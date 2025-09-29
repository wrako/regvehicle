"use client";

import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicle, VehicleStatus } from "@/types";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const API_BASE = "http://localhost:8080";

interface VehicleTableProps {
    vehicles: Vehicle[];
}

const StatusBadge = ({ status }: { status: VehicleStatus }) => {
    const statusLabels: Record<VehicleStatus, string> = {
        aktívne: "Aktívne",
        rezerva: "Rezerva",
        vyradené: "Vyradené",
        "dočasne vyradené": "Dočasne vyradené",
        preregistrované: "Preregistrované",
    };

    const variantMap: Record<
        VehicleStatus,
        "default" | "secondary" | "destructive" | "outline"
    > = {
        aktívne: "default",
        rezerva: "secondary",
        vyradené: "destructive",
        "dočasne vyradené": "outline",
        preregistrované: "secondary",
    };

    const variant = variantMap[status];
    let className =
        status === "aktívne"
            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
            : "";
    if (status === "dočasne vyradené") {
        className += " whitespace-nowrap";
    }

    return (
        <Badge variant={variant} className={`capitalize ${className}`}>
            {statusLabels[status]}
        </Badge>
    );
};

export default function VehicleTable({ vehicles }: VehicleTableProps) {
    // keep a local copy that can be modified after deletes/archives
    const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(vehicles);

    // sync local state when parent updates
    useEffect(() => {
        setLocalVehicles(vehicles);
    }, [vehicles]);

    const handleDelete = async (id: number) => {
        if (!confirm("Naozaj chcete vymazať toto vozidlo?")) return;
        try {
            const res = await fetch(`${API_BASE}/vehicles/${id}/delete`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(await res.text());
            setLocalVehicles((prev) => prev.filter((v) => v.id !== id));
        } catch (err) {
            console.error("Failed to delete vehicle", err);
            alert("Nepodarilo sa vymazať vozidlo");
        }
    };

    // --- Archive dialog state ---
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
        null
    );
    const [archiveStatus, setArchiveStatus] = useState<string>("DOČASNE VYRADENÉ");
    const [reason, setReason] = useState<string>("");

    const handleArchive = async () => {
        if (!selectedVehicleId) return;
        try {
            const params = new URLSearchParams();
            params.append(
                "status",
                archiveStatus === "DOČASNE VYRADENÉ"
                    ? "TEMP_DEREGISTERED"
                    : "DEREGISTERED"
            );
            if (reason) params.append("reason", reason);

            const res = await fetch(
                `${API_BASE}/vehicles/${selectedVehicleId}/archive?${params}`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());

            // remove from table after archiving
            setLocalVehicles((prev) =>
                prev.filter((v) => v.id !== selectedVehicleId)
            );

            setArchiveOpen(false);
            setReason("");
            setArchiveStatus("DOČASNE VYRADENÉ");
        } catch (e) {
            console.error("Archive failed", e);
            alert("Nepodarilo sa archivovať vozidlo");
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ŠPZ</TableHead>
                        <TableHead>Značka</TableHead>
                        <TableHead className="hidden md:table-cell">Model</TableHead>
                        <TableHead>Poskytovateľ</TableHead>
                        <TableHead>Sieťový bod</TableHead>
                        <TableHead>Stav</TableHead>
                        <TableHead className="hidden lg:table-cell">Platnosť STK</TableHead>
                        <TableHead>
                            <span className="sr-only">Akcie</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {localVehicles.length > 0 ? (
                        localVehicles.map((vehicle) => (
                            <TableRow key={vehicle.id}>
                                <TableCell className="font-medium">{vehicle.spz}</TableCell>
                                <TableCell>{vehicle.make}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {vehicle.model}
                                </TableCell>
                                <TableCell>{vehicle.providerLabel}</TableCell>
                                <TableCell>{vehicle.networkPointLabel}</TableCell>
                                <TableCell>
                                    <StatusBadge status={vehicle.status} />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {vehicle.stkDate
                                        ? format(vehicle.stkDate, "dd. MMMM yyyy", { locale: sk })
                                        : "—"}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Akcie</DropdownMenuLabel>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                                                    Viac informácií
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/vehicles/${vehicle.id}/history`}>
                                                    Historia
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                                                    Upraviť
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedVehicleId(vehicle.id as any);
                                                    setArchiveOpen(true);
                                                }}
                                            >
                                                Archiv
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="text-red-600 cursor-pointer"
                                            >
                                                Vymazať
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Žiadne vozidlá sa nenašli.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Archive Dialog */}
            <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archivovať vozidlo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nový stav</label>
                            <Select
                                value={archiveStatus}
                                onValueChange={setArchiveStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte stav" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DOČASNE VYRADENÉ">
                                        Dočasne vyradené
                                    </SelectItem>
                                    <SelectItem value="VYRADENÉ">Vyradené</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Dôvod (nepovinné)
                            </label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Zadajte dôvod"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setArchiveOpen(false)}>
                            Zrušiť
                        </Button>
                        <Button onClick={handleArchive}>Archivovať</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
