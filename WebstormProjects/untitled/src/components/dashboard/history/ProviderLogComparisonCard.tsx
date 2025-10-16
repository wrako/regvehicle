import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogDetailItem } from "./LogDetailItem";
import type { ProviderLog, ProviderLogChanges } from "@/utils/providerHistoryHelpers";
import { Badge } from "@/components/ui/badge";

type Props = {
    log: ProviderLog;
    title: string;
    description: string;
    changes?: ProviderLogChanges;
    highlighted?: boolean;
    vehicleCount?: number;
    networkPointCount?: number;
};

export function ProviderLogComparisonCard({ log, title, description, changes = {}, highlighted, vehicleCount, networkPointCount }: Props) {
    // Use provided counts if available, otherwise fall back to log data
    const displayVehicleCount = vehicleCount !== undefined ? vehicleCount : log.vehicleCount;
    const displayNetworkPointCount = networkPointCount !== undefined ? networkPointCount : log.networkPointCount;
    return (
        <Card className={highlighted ? "ring-2 ring-yellow-400" : ""}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <LogDetailItem label="Názov" value={log.name} changed={changes.name} />
                <LogDetailItem label="Email" value={log.email || "N/A"} changed={changes.email} />
                <LogDetailItem label="Provider ID" value={log.providerIdField} changed={changes.providerIdField} />
                <LogDetailItem label="Adresa" value={log.address} changed={changes.address} />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Stav</span>
                    <div className={changes.state ? "bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded" : ""}>
                        <Badge variant={
                            log.state === "ACTIVE" ? "default" :
                            log.state === "DISABLED" ? "secondary" :
                            log.state === "UNBALANCED" ? "destructive" :
                            "outline"
                        }>
                            {log.state}
                        </Badge>
                    </div>
                </div>
                <LogDetailItem label="Vozidlá" value={displayVehicleCount.toString()} />
                <LogDetailItem label="Sieťové body" value={displayNetworkPointCount.toString()} />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Archivované</span>
                    <div className={changes.archived ? "bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded" : ""}>
                        <Badge variant={log.archived ? "outline" : "secondary"}>
                            {log.archived ? "Áno" : "Nie"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
