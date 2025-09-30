"use client";

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDiff } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import * as React from "react";
import { fetchVehicle, fetchHistory, getChanges } from "@/utils/historyHelpers";
import type { Vehicle, VehicleLog } from "@/utils/historyHelpers";
import { LogComparisonCard } from "@/components/dashboard/history";

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
                {previousLog ? (
                    <LogComparisonCard
                        log={previousLog}
                        title="Predchádzajúca verzia"
                        description={`Stav pred zmenou z ${format(previousLog.timestamp, "dd.MM.yyyy HH:mm:ss")}`}
                    />
                ) : (
                    <div className="text-muted-foreground text-center py-8">Žiadna predchádzajúca verzia.</div>
                )}

                <LogComparisonCard
                    log={currentLog}
                    title="Aktuálna verzia (po zmene)"
                    description="Stav po zmene"
                    changes={changes}
                    highlighted={Object.keys(changes).length > 0}
                />
            </div>
        </div>
    );
}
