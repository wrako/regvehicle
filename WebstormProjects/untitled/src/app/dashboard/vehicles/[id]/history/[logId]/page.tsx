"use client";

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, FileDiff } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import * as React from "react";

const API_BASE = "http://localhost:8080";

/** ---- Types shaped for this page (dates normalized to Date objects) ---- */

type OperationType = "CREATE" | "UPDATE" | "DELETE";

type Vehicle = {
    id: string;
    spz: string;
};

type VehicleLog = {
    id: string;
    vehicleId: string;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate: Date;
    lastTechnicalCheckDate?: Date | null;
    technicalCheckValidUntil: Date;
    status: string;
    certificateFilePath?: string | null;
    author: string;
    timestamp: Date;
    operation: OperationType;
};

/** ---- Helpers: fetch + normalization ---- */

async function fetchVehicle(vehicleId: string): Promise<Vehicle | null> {
    const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, { credentials: "include" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load vehicle"));
    const raw = await res.json();
    // Use only what we need on this page
    return {
        id: String(raw.id ?? vehicleId),
        spz: String(raw.spz ?? raw.licensePlate ?? ""), // backend may expose 'spz' or 'licensePlate'
    };
}

function toDate(v: unknown): Date {
    // Coerce strings/numbers to Date; fallback to epoch if missing to keep page stable
    if (v === null || v === undefined || v === "") return new Date(0);
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

type VehicleLogApi = {
    id: number | string;
    vehicleId: number | string;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: string | null;
    lastTechnicalCheckDate?: string | null;
    technicalCheckValidUntil?: string | null;
    status: string;
    certificateFilePath?: string | null;
    author: string;
    timestamp: string;
    operation: OperationType;
};

async function fetchHistory(vehicleId: string): Promise<VehicleLog[]> {
    const res = await fetch(`${API_BASE}/vehicle-logs/history/${vehicleId}`, { credentials: "include" });

    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load history"));

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const normalized: VehicleLog[] = (data as VehicleLogApi[]).map((x) => ({
        id: String(x.id),
        vehicleId: String(x.vehicleId ?? vehicleId),
        licensePlate: x.licensePlate,
        brand: x.brand,
        model: x.model,
        firstRegistrationDate: toDate(x.firstRegistrationDate),
        lastTechnicalCheckDate: x.lastTechnicalCheckDate ? toDate(x.lastTechnicalCheckDate) : null,
        technicalCheckValidUntil: toDate(x.technicalCheckValidUntil),
        status: x.status,
        certificateFilePath: x.certificateFilePath ?? null,
        author: x.author,
        timestamp: toDate(x.timestamp),
        operation: x.operation,
    }));

    // Sort newest first by timestamp
    normalized.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return normalized;
}

/** ---- Presentational helpers (unchanged structure) ---- */

const DetailItem = ({
                        label,
                        value,
                        changed,
                    }: {
    label: string;
    value: string | React.ReactNode;
    changed?: boolean;
}) => (
    <div
        className={
            changed
                ? "bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md ring-1 ring-yellow-200 dark:ring-yellow-800/60"
                : "p-2"
        }
    >
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">
            {value === undefined || value === null || value === "" ? "N/A" : value}
        </p>
    </div>
);

type LogChanges = {
    [K in keyof Omit<
        VehicleLog,
        "id" | "vehicleId" | "author" | "timestamp" | "operation"
    >]?: boolean;
};

/** ---- Page ---- */

export default function LogComparisonPage() {
    const params = useParams();
    const vehicleId = typeof params.id === "string" ? params.id : "";
    const logId = typeof params.logId === "string" ? params.logId : "";

    const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);
    const [logs, setLogs] = React.useState<VehicleLog[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!vehicleId || !logId) return;

        (async () => {
            try {
                setLoading(true);
                const [v, history] = await Promise.all([fetchVehicle(vehicleId), fetchHistory(vehicleId)]);
                setVehicle(v);
                setLogs(history);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať údaje o vozidle alebo históriu zmien.");
            } finally {
                setLoading(false);
            }
        })();
    }, [vehicleId, logId]);

    if (error) return <div className="text-red-600">{error}</div>;
    if (loading || logs === null) return <div>Načítavam…</div>;

    // Find current and previous log from fetched list
    const currentLog = logs.find((l) => l.id === logId);
    const previousLog =
        currentLog && logs.length > 1
            ? (() => {
                const idx = logs.findIndex((l) => l.id === currentLog.id);
                return idx >= 0 && idx < logs.length - 1 ? logs[idx + 1] : undefined;
            })()
            : undefined;

    // If either vehicle or the requested log is missing, show 404 page
    if (!vehicle || !currentLog) {
        notFound();
    }

    const getChanges = (current: VehicleLog, previous?: VehicleLog): LogChanges => {
        if (!previous) return {};
        const changes: LogChanges = {};

        if (current.licensePlate !== previous.licensePlate) changes.licensePlate = true;
        if (current.brand !== previous.brand) changes.brand = true;
        if (current.model !== previous.model) changes.model = true;

        // Dates: mark as changed if either side missing or different timestamps
        if (
            !previous.firstRegistrationDate ||
            !current.firstRegistrationDate ||
            current.firstRegistrationDate.getTime() !== previous.firstRegistrationDate.getTime()
        )
            changes.firstRegistrationDate = true;

        if (
            (current.lastTechnicalCheckDate?.getTime() ?? -1) !==
            (previous.lastTechnicalCheckDate?.getTime() ?? -1)
        )
            changes.lastTechnicalCheckDate = true;

        if (
            !previous.technicalCheckValidUntil ||
            !current.technicalCheckValidUntil ||
            current.technicalCheckValidUntil.getTime() !== previous.technicalCheckValidUntil.getTime()
        )
            changes.technicalCheckValidUntil = true;

        if (current.status !== previous.status) changes.status = true;
        if ((current.certificateFilePath ?? "") !== (previous.certificateFilePath ?? ""))
            changes.certificateFilePath = true;

        return changes;
    };

    const changes = getChanges(currentLog, previousLog);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/vehicles/${vehicleId}/history`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Späť na históriu zmien</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <FileDiff className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Porovnanie verzií: {vehicle.spz}</h2>
                    <p className="text-muted-foreground">
                        Zmenu vykonal{" "}
                        <span className="font-semibold text-foreground">{currentLog.author}</span>{" "}
                        dňa{" "}
                        <span className="font-semibold text-foreground">
              {format(currentLog.timestamp, "dd.MM.yyyy HH:mm:ss", { locale: sk })}
            </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Predchádzajúca verzia</CardTitle>
                        <CardDescription>
                            {previousLog
                                ? `Stav pred zmenou z ${format(previousLog.timestamp, "dd.MM.yyyy HH:mm:ss")}`
                                : "Počiatočný stav"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {previousLog ? (
                            <>
                                <DetailItem label="ŠPZ" value={previousLog.licensePlate} />
                                <DetailItem label="Značka" value={previousLog.brand} />
                                <DetailItem label="Model" value={previousLog.model} />
                                <DetailItem
                                    label="Dátum prvej registrácie"
                                    value={
                                        previousLog.firstRegistrationDate.getTime()
                                            ? format(previousLog.firstRegistrationDate, "dd.MM.yyyy")
                                            : "N/A"
                                    }
                                />
                                <DetailItem
                                    label="Dátum poslednej STK"
                                    value={
                                        previousLog.lastTechnicalCheckDate?.getTime()
                                            ? format(previousLog.lastTechnicalCheckDate, "dd.MM.yyyy")
                                            : "N/A"
                                    }
                                />
                                <DetailItem
                                    label="Platnosť STK do"
                                    value={
                                        previousLog.technicalCheckValidUntil.getTime()
                                            ? format(previousLog.technicalCheckValidUntil, "dd.MM.yyyy")
                                            : "N/A"
                                    }
                                />
                                <DetailItem label="Stav" value={previousLog.status} />
                                <DetailItem label="Certifikát" value={previousLog.certificateFilePath ?? "N/A"} />
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">Žiadna predchádzajúca verzia.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className={Object.keys(changes).length > 0 ? "ring-2 ring-yellow-400" : ""}>
                    <CardHeader>
                        <CardTitle>Aktuálna verzia (po zmene)</CardTitle>
                        <CardDescription>Stav po zmene</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailItem label="ŠPZ" value={currentLog.licensePlate} changed={changes.licensePlate} />
                        <DetailItem label="Značka" value={currentLog.brand} changed={changes.brand} />
                        <DetailItem label="Model" value={currentLog.model} changed={changes.model} />
                        <DetailItem
                            label="Dátum prvej registrácie"
                            value={
                                currentLog.firstRegistrationDate.getTime()
                                    ? format(currentLog.firstRegistrationDate, "dd.MM.yyyy")
                                    : "N/A"
                            }
                            changed={changes.firstRegistrationDate}
                        />
                        <DetailItem
                            label="Dátum poslednej STK"
                            value={
                                currentLog.lastTechnicalCheckDate?.getTime()
                                    ? format(currentLog.lastTechnicalCheckDate, "dd.MM.yyyy")
                                    : "N/A"
                            }
                            changed={changes.lastTechnicalCheckDate}
                        />
                        <DetailItem
                            label="Platnosť STK do"
                            value={
                                currentLog.technicalCheckValidUntil.getTime()
                                    ? format(currentLog.technicalCheckValidUntil, "dd.MM.yyyy")
                                    : "N/A"
                            }
                            changed={changes.technicalCheckValidUntil}
                        />
                        <DetailItem label="Stav" value={currentLog.status} changed={changes.status} />
                        <DetailItem
                            label="Certifikát"
                            value={currentLog.certificateFilePath ?? "N/A"}
                            changed={changes.certificateFilePath}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
