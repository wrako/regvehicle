import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogDetailItem } from "./LogDetailItem";
import type { NetworkPointLog, NetworkPointLogChanges } from "@/utils/networkPointHistoryHelpers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

type Props = {
    log: NetworkPointLog;
    title: string;
    description: string;
    changes?: NetworkPointLogChanges;
    highlighted?: boolean;
};

export function NetworkPointLogComparisonCard({ log, title, description, changes = {}, highlighted }: Props) {
    return (
        <Card className={highlighted ? "ring-2 ring-yellow-400" : ""}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <LogDetailItem label="Kód" value={log.code} changed={changes.code} />
                <LogDetailItem label="Názov" value={log.name} changed={changes.name} />
                <LogDetailItem label="Typ" value={log.type || "N/A"} changed={changes.type} />
                <LogDetailItem
                    label="Platnosť od"
                    value={formatDate(log.validFrom) || "N/A"}
                    changed={changes.validFrom}
                />
                <LogDetailItem
                    label="Platnosť do"
                    value={formatDate(log.validTo) || "N/A"}
                    changed={changes.validTo}
                />
                <LogDetailItem
                    label="Poskytovateľ"
                    value={log.providerName || "N/A"}
                    changed={changes.providerName}
                />
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
