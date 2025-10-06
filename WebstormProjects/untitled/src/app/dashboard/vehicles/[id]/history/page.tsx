"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, isValid } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { API_BASE } from "@/constants/api";
import { OperationBadge, type OperationType } from "@/components/common";
import { cancellableFetch } from "@/utils/fetchUtils";
import { formatDate } from "@/lib/date";

interface VehicleLog {
    id: number;
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
    status: string;
    certificateFilePath?: string;
    author: string;
    timestamp: string;
    operation: OperationType;
}

function formatDateTime(value?: string | Date | null): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || !isValid(date)) return "";

    const datePart = formatDate(date);
    if (!datePart) return "";

    const timePart = format(date, "HH:mm:ss");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

// Helper component for history status badge (differs from vehicle status)
const HistoryStatusBadge = ({ status }: { status: string }) => {
    const statusLabels: Record<string, string> = {
        ACTIVE: "Aktívne",
        RESERVE: "Rezerva",
        DEREGISTERED: "Vyradené",
        TEMP_DEREGISTERED: "Dočasne vyradené",
        PREREGISTERED: "Preregistrované",
    };

    const variantMap: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
    > = {
        ACTIVE: "default",
        RESERVE: "secondary",
        DEREGISTERED: "destructive",
        TEMP_DEREGISTERED: "outline",
        PREREGISTERED: "secondary",
    };

    return (
        <Badge variant={variantMap[status] ?? "outline"}>
            {statusLabels[status] ?? status}
        </Badge>
    );
};

export default function VehicleHistoryPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [logs, setLogs] = useState<VehicleLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastIdRef = useRef<string>("");

    useEffect(() => {
        if (!id) return;

        // StrictMode guard: prevent duplicate calls
        if (lastIdRef.current === id) {
            return;
        }
        lastIdRef.current = id;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/vehicle-logs/history/${id}`);

                if (res.status === 404) {
                    // ✅ treat as "no logs"
                    setLogs([]);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await res.json();
                setLogs(data);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať históriu vozidla.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <History className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">História vozidla</h1>
                        <p className="text-muted-foreground">
                            Zobrazovanie detailných udalostí a úprav vykonaných na vozidle.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/vehicles/${id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Späť na detail vozidla
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent>
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card>
                    <CardContent>
                        <p>Načítavam históriu...</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Detailné záznamy všetkých operácií, ktoré sa udiali na vozidle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dátum a čas</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Operácia</TableHead>
                                        <TableHead>Stav</TableHead>
                                        <TableHead>Platnosť STK</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Značka &amp; Model
                                        </TableHead>
                                        <TableHead>
                                            <span className="sr-only">Akcie</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    {formatDateTime(log.timestamp)}
                                                </TableCell>
                                                <TableCell>{log.author}</TableCell>
                                                <TableCell>
                                                    <OperationBadge operation={log.operation} />
                                                </TableCell>
                                                <TableCell>
                                                    <HistoryStatusBadge status={log.status} />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(log.technicalCheckValidUntil)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {log.brand} {log.model}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Otvoriť menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Akcie</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/dashboard/vehicles/${id}/history/${log.id}`}
                                                                >
                                                                    Viac informácií
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Pre toto vozidlo neboli nájdené žiadne záznamy.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
