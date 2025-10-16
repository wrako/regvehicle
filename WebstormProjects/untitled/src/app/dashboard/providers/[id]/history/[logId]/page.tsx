"use client";

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDiff } from "lucide-react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import * as React from "react";
import { fetchProvider, fetchProviderHistory, getProviderChanges } from "@/utils/providerHistoryHelpers";
import type { Provider, ProviderLog } from "@/utils/providerHistoryHelpers";
import { ProviderLogComparisonCard } from "@/components/dashboard/history";
import { formatDate } from "@/lib/date";
import { getProviderVehicleCount, getProviderNetworkPointCount } from "@/lib/api";

function formatDateTime(value?: Date | null): string {
    if (!value || !isValid(value)) return "";
    const datePart = formatDate(value);
    if (!datePart) return "";
    const timePart = format(value, "HH:mm:ss");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

export default function ProviderLogComparisonPage() {
    const params = useParams();
    const providerId = typeof params.id === "string" ? params.id : "";
    const logId = typeof params.logId === "string" ? params.logId : "";

    const [provider, setProvider] = React.useState<Provider | null>(null);
    const [logs, setLogs] = React.useState<ProviderLog[] | null>(null);
    const [vehicleCount, setVehicleCount] = React.useState<number>(0);
    const [networkPointCount, setNetworkPointCount] = React.useState<number>(0);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!providerId || !logId) return;

        (async () => {
            try {
                setLoading(true);
                const [p, history, vCount, npCount] = await Promise.all([
                    fetchProvider(providerId),
                    fetchProviderHistory(providerId),
                    getProviderVehicleCount(providerId),
                    getProviderNetworkPointCount(providerId),
                ]);
                setProvider(p);
                setLogs(history);
                setVehicleCount(vCount);
                setNetworkPointCount(npCount);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať údaje o poskytovateľovi alebo históriu zmien.");
            } finally {
                setLoading(false);
            }
        })();
    }, [providerId, logId]);

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

    // If either provider or the requested log is missing, show 404 page
    if (!provider || !currentLog) {
        notFound();
    }

    const changes = getProviderChanges(currentLog, previousLog);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/providers/${providerId}/history`}>
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
                    <h2 className="text-2xl font-bold">Porovnanie verzií: {provider.name}</h2>
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
                    <ProviderLogComparisonCard
                        log={previousLog}
                        title="Predchádzajúca verzia"
                        description={`Stav pred zmenou z ${formatDateTime(previousLog.timestamp)}`}
                        vehicleCount={vehicleCount}
                        networkPointCount={networkPointCount}
                    />
                ) : (
                    <div className="text-muted-foreground text-center py-8">Žiadna predchádzajúca verzia.</div>
                )}

                <ProviderLogComparisonCard
                    log={currentLog}
                    title="Aktuálna verzia (po zmene)"
                    description="Stav po zmene"
                    changes={changes}
                    highlighted={Object.keys(changes).length > 0}
                    vehicleCount={vehicleCount}
                    networkPointCount={networkPointCount}
                />
            </div>
        </div>
    );
}
