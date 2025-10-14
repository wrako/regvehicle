"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { OperationBadge, type OperationType } from "@/components/common";
import { formatDate } from "@/lib/date";
import { NetworkPointLogDto } from "@/types";
import { getNetworkPointHistory } from "@/lib/api";

function formatDateTime(value?: string | Date | null): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || !isValid(date)) return "";

    const datePart = formatDate(date);
    if (!datePart) return "";

    const timePart = format(date, "HH:mm");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

export default function NetworkPointHistoryPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [logs, setLogs] = useState<NetworkPointLogDto[]>([]);
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
                const data = await getNetworkPointHistory(id);
                setLogs(data);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať históriu sieťového bodu.");
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
                        <h1 className="text-2xl font-bold">História sieťového bodu</h1>
                        <p className="text-muted-foreground">
                            Zobrazovanie detailných udalostí a úprav vykonaných na sieťovom bode.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Späť na zoznam
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <p>Načítavam históriu...</p>
                    </CardContent>
                </Card>
            ) : logs.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Pre tento sieťový bod neboli nájdené žiadne záznamy.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Celkovo {logs.length} {logs.length === 1 ? "záznam" : logs.length < 5 ? "záznamy" : "záznamov"}
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
                                        <TableHead>Kód</TableHead>
                                        <TableHead className="hidden md:table-cell">Názov</TableHead>
                                        <TableHead className="hidden lg:table-cell">Typ</TableHead>
                                        <TableHead className="hidden lg:table-cell">Platnosť od</TableHead>
                                        <TableHead className="hidden xl:table-cell">Platnosť do</TableHead>
                                        <TableHead className="hidden xl:table-cell">Poskytovateľ</TableHead>
                                        <TableHead className="hidden xl:table-cell">Archivované</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {formatDateTime(log.timestamp)}
                                            </TableCell>
                                            <TableCell>{log.author}</TableCell>
                                            <TableCell>
                                                <OperationBadge operation={log.operation as OperationType} />
                                            </TableCell>
                                            <TableCell>{log.code || "-"}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {log.name || "-"}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {log.type ? (
                                                    <Badge variant="outline">{log.type}</Badge>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {formatDate(log.validFrom)}
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                {formatDate(log.validTo)}
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                {log.providerName || "-"}
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                {log.archived ? (
                                                    <Badge variant="outline">Áno</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Nie</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
