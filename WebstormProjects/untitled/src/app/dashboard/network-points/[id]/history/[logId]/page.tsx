"use client";

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDiff } from "lucide-react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import * as React from "react";
import { fetchNetworkPoint, fetchNetworkPointHistory, getNetworkPointChanges } from "@/utils/networkPointHistoryHelpers";
import type { NetworkPoint, NetworkPointLog } from "@/utils/networkPointHistoryHelpers";
import { NetworkPointLogComparisonCard } from "@/components/dashboard/history";
import { formatDate } from "@/lib/date";

function formatDateTime(value?: Date | null): string {
    if (!value || !isValid(value)) return "";
    const datePart = formatDate(value);
    if (!datePart) return "";
    const timePart = format(value, "HH:mm:ss");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

export default function NetworkPointLogComparisonPage() {
    const params = useParams();
    const networkPointId = typeof params.id === "string" ? params.id : "";
    const logId = typeof params.logId === "string" ? params.logId : "";

    const [networkPoint, setNetworkPoint] = React.useState<NetworkPoint | null>(null);
    const [logs, setLogs] = React.useState<NetworkPointLog[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!networkPointId || !logId) return;

        (async () => {
            try {
                setLoading(true);
                const [np, history] = await Promise.all([
                    fetchNetworkPoint(networkPointId),
                    fetchNetworkPointHistory(networkPointId),
                ]);
                setNetworkPoint(np);
                setLogs(history);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať údaje o sieťovom bode alebo históriu zmien.");
            } finally {
                setLoading(false);
            }
        })();
    }, [networkPointId, logId]);

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

    // If either network point or the requested log is missing, show 404 page
    if (!networkPoint || !currentLog) {
        notFound();
    }

    const changes = getNetworkPointChanges(currentLog, previousLog);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/network-points/${networkPointId}/history`}>
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
                    <h2 className="text-2xl font-bold">Porovnanie verzií: {networkPoint.name}</h2>
                    <p className="text-muted-foreground">
                        Zmenu vykonal{" "}
                        <span className="font-semibold text-foreground">{currentLog.author}</span>{" "}
                        dňa{" "}
                        <span className="font-semibold text-foreground">
              {formatDateTime(currentLog.timestamp)}
            </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {previousLog ? (
                    <NetworkPointLogComparisonCard
                        log={previousLog}
                        title="Predchádzajúca verzia"
                        description={`Stav pred zmenou z ${formatDateTime(previousLog.timestamp)}`}
                    />
                ) : (
                    <div className="text-muted-foreground text-center py-8">Žiadna predchádzajúca verzia.</div>
                )}

                <NetworkPointLogComparisonCard
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
