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
import { formatDate } from "@/lib/date";
import Link from "next/link";
import * as React from "react";
import { UnarchiveDialog } from "./unarchive-dialog";
import { API_BASE } from "@/constants/api";

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

export default function ArchivedVehicleTable({ vehicles }: VehicleTableProps) {
    const [localVehicles, setLocalVehicles] = React.useState<Vehicle[]>(vehicles);

    // dialog state
    const [unarchiveOpen, setUnarchiveOpen] = React.useState(false);
    const [pendingVehicleId, setPendingVehicleId] = React.useState<string | null>(
        null
    );

    React.useEffect(() => {
        setLocalVehicles(vehicles);
    }, [vehicles]);

    const openUnarchive = (id: string) => {
        setPendingVehicleId(id);
        setUnarchiveOpen(true);
    };

    const handleUnarchived = (id: string) => {
        // remove from archived list (since it's now active again)
        setLocalVehicles((prev) => prev.filter((v) => v.id !== id));
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
                                                <Link href={`/dashboard/vehicles/archived/${vehicle.id}`}>
                                                    Viac informácií
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/vehicles/${vehicle.id}/history`}>
                                                    Historia
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => openUnarchive(vehicle.id)}
                                                className="text-green-600 cursor-pointer"
                                            >
                                                Obnoviť (Unarchive)
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Žiadne archivované vozidlá sa nenašli.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Unarchive dialog */}
            <UnarchiveDialog
                open={unarchiveOpen}
                onOpenChange={setUnarchiveOpen}
                vehicleId={pendingVehicleId}
                onUnarchived={handleUnarchived}
            />
        </div>
    );
}
