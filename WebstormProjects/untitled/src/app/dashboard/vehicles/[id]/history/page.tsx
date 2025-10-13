"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
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
import { VehicleLogBlockDto, VehicleLogDto } from "@/types";

interface VehicleLog {
    id: number;
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
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


export default function VehicleHistoryPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [blocks, setBlocks] = useState<VehicleLogBlockDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
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
                const res = await fetch(`${API_BASE}/vehicle-logs/history/${id}/grouped`);

                if (res.status === 404) {
                    // ✅ treat as "no logs"
                    setBlocks([]);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await res.json();
                setBlocks(data);
                // Expand all blocks by default
                setExpandedBlocks(new Set(data.map((_: any, idx: number) => idx)));
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať históriu vozidla.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const toggleBlock = (index: number) => {
        setExpandedBlocks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

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
            ) : blocks.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Pre toto vozidlo neboli nájdené žiadne záznamy.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {blocks.map((block, blockIndex) => (
                        <Card key={blockIndex}>
                            <CardHeader
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => toggleBlock(blockIndex)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {expandedBlocks.has(blockIndex) ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <CardTitle className="text-lg">
                                                {block.providerName || "Neznámy poskytovateľ"}
                                            </CardTitle>
                                            <CardDescription>
                                                {block.providerId ? `ID: ${block.providerId}` : "Žiadny poskytovateľ"} • {block.logs.length} {block.logs.length === 1 ? "záznam" : block.logs.length < 5 ? "záznamy" : "záznamov"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{blockIndex + 1}. obdobie</Badge>
                                </div>
                            </CardHeader>

                            {expandedBlocks.has(blockIndex) && (
                                <CardContent className="pt-0">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Dátum a čas</TableHead>
                                                    <TableHead>Autor</TableHead>
                                                    <TableHead>Operácia</TableHead>
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
                                                {block.logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="font-medium">
                                                            {log.timestampFormatted || formatDateTime(log.timestamp)}
                                                        </TableCell>
                                                        <TableCell>{log.author}</TableCell>
                                                        <TableCell>
                                                            <OperationBadge operation={log.operation as OperationType} />
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
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
