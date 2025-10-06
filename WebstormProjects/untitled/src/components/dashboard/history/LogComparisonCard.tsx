import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogDetailItem } from "./LogDetailItem";
import type { VehicleLog, LogChanges } from "@/utils/historyHelpers";
import { formatDate } from "@/lib/date";

type Props = {
    log: VehicleLog;
    title: string;
    description: string;
    changes?: LogChanges;
    highlighted?: boolean;
};

export function LogComparisonCard({ log, title, description, changes = {}, highlighted }: Props) {
    const firstRegistrationValue = formatDate(log.firstRegistrationDate);
    const lastTechnicalCheckValue = formatDate(log.lastTechnicalCheckDate ?? undefined);
    const technicalCheckValidUntilValue = formatDate(log.technicalCheckValidUntil);

    const firstRegistration =
        log.firstRegistrationDate.getTime() && firstRegistrationValue ? firstRegistrationValue : "N/A";
    const lastTechnicalCheck =
        log.lastTechnicalCheckDate && log.lastTechnicalCheckDate.getTime() && lastTechnicalCheckValue
            ? lastTechnicalCheckValue
            : "N/A";
    const technicalCheckValidUntil =
        log.technicalCheckValidUntil.getTime() && technicalCheckValidUntilValue
            ? technicalCheckValidUntilValue
            : "N/A";

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
                    value={firstRegistration}
                    changed={changes.firstRegistrationDate}
                />
                <LogDetailItem
                    label="Dátum poslednej STK"
                    value={lastTechnicalCheck}
                    changed={changes.lastTechnicalCheckDate}
                />
                <LogDetailItem
                    label="Platnosť STK do"
                    value={technicalCheckValidUntil}
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
