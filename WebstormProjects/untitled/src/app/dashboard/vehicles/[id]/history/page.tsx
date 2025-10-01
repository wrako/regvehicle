"use client";

import { useEffect, useState } from "react";
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
import { format } from "date-fns";
import { sk } from "date-fns/locale";
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

    useEffect(() => {
        if (!id) return;

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

    if (error) return <div className="text-red-600">{error}</div>;
    if (loading) return <div>Načítavam…</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">História vozidla</h1>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <History className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">
                        História zmien {logs[0] ? `pre vozidlo ${logs[0].licensePlate}` : ""}
                    </h2>
                    <p className="text-muted-foreground">
                        Kompletný záznam o zmenách na vozidle
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Záznamy o zmenách</CardTitle>
                    <CardDescription>
                        Zoznam všetkých udalostí a zmien týkajúcich sa tohto vozidla.
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
                                                {log.timestamp
                                                    ? format(
                                                        new Date(log.timestamp),
                                                        "dd.MM.yyyy HH:mm:ss",
                                                        {
                                                            locale: sk,
                                                        }
                                                    )
                                                    : ""}
                                            </TableCell>
                                            <TableCell>{log.author}</TableCell>
                                            <TableCell>
                                                <OperationBadge operation={log.operation} />
                                            </TableCell>
                                            <TableCell>
                                                <HistoryStatusBadge status={log.status} />
                                            </TableCell>
                                            <TableCell>
                                                {log.technicalCheckValidUntil
                                                    ? format(
                                                        new Date(log.technicalCheckValidUntil),
                                                        "dd.MM.yyyy",
                                                        { locale: sk }
                                                    )
                                                    : ""}
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
        </div>
    );
}
