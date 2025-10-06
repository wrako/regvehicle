"use client";

import { MoreHorizontal } from "lucide-react";
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
import type { Vehicle } from "@/types";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StatusBadge, EmptyTableState } from "@/components/common";
import { ArchiveDialog } from "./vehicle-table/ArchiveDialog";
import { useVehicleActions } from "@/hooks/useVehicleActions";

interface VehicleTableProps {
    vehicles: Vehicle[];
}

// StatusBadge moved to common components

export default function VehicleTable({ vehicles }: VehicleTableProps) {
    const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(vehicles);
    const {
        archiveOpen,
        selectedVehicleId,
        handleDelete: deleteVehicle,
        handleArchive,
        openArchiveDialog,
        closeArchiveDialog,
    } = useVehicleActions();

    useEffect(() => {
        setLocalVehicles(vehicles);
    }, [vehicles]);

    const handleDeleteVehicle = async (id: number) => {
        const success = await deleteVehicle(id);
        if (success) {
            setLocalVehicles((prev) => prev.filter((v) => v.id !== id.toString()));
        }
    };

    const handleArchiveConfirm = async (status: string, reason: string) => {
        if (selectedVehicleId === null) return;
        const success = await handleArchive(selectedVehicleId, status, reason);
        if (success) {
            setLocalVehicles((prev) => prev.filter((v) => v.id !== selectedVehicleId.toString()));
            alert("Vozidlo bolo archivované");
            closeArchiveDialog();
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
                                <TableCell>
                                    <StatusBadge status={vehicle.status} />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {formatDate(vehicle.stkDate) || "—"}
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
                                                onClick={() => openArchiveDialog(parseInt(vehicle.id))}
                                            >
                                                Archiv
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleDeleteVehicle(parseInt(vehicle.id))}
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
                        <EmptyTableState colSpan={7} message="Žiadne vozidlá sa nenašli." />
                    )}
                </TableBody>
            </Table>

            <ArchiveDialog
                open={archiveOpen}
                onOpenChange={closeArchiveDialog}
                onConfirm={handleArchiveConfirm}
            />
        </div>
    );
}
