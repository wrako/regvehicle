import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { LogDetailItem } from "./LogDetailItem";
import type { VehicleLog, LogChanges } from "@/utils/historyHelpers";

type Props = {
    log: VehicleLog;
    title: string;
    description: string;
    changes?: LogChanges;
    highlighted?: boolean;
};

export function LogComparisonCard({ log, title, description, changes = {}, highlighted }: Props) {
    return (
        <Card className={highlighted ? "ring-2 ring-yellow-400" : ""}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <LogDetailItem label="ŠPZ" value={log.licensePlate} changed={changes.licensePlate} />
                <LogDetailItem label="Značka" value={log.brand} changed={changes.brand} />
                <LogDetailItem label="Model" value={log.model} changed={changes.model} />
                <LogDetailItem
                    label="Dátum prvej registrácie"
                    value={
                        log.firstRegistrationDate.getTime()
                            ? format(log.firstRegistrationDate, "dd.MM.yyyy")
                            : "N/A"
                    }
                    changed={changes.firstRegistrationDate}
                />
                <LogDetailItem
                    label="Dátum poslednej STK"
                    value={
                        log.lastTechnicalCheckDate?.getTime()
                            ? format(log.lastTechnicalCheckDate, "dd.MM.yyyy")
                            : "N/A"
                    }
                    changed={changes.lastTechnicalCheckDate}
                />
                <LogDetailItem
                    label="Platnosť STK do"
                    value={
                        log.technicalCheckValidUntil.getTime()
                            ? format(log.technicalCheckValidUntil, "dd.MM.yyyy")
                            : "N/A"
                    }
                    changed={changes.technicalCheckValidUntil}
                />
                <LogDetailItem label="Stav" value={log.status} changed={changes.status} />
                <LogDetailItem
                    label="Certifikát"
                    value={log.certificateFilePath ?? "N/A"}
                    changed={changes.certificateFilePath}
                />
            </CardContent>
        </Card>
    );
}