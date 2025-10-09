import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

type Props = {
    licensePlate: string;
    brand: string;
    model: string;
    vinNum?: string;
    providerName?: string;
    providerAssignmentStartDate?: Date | null;
    providerAssignmentEndDate?: Date | null;
    status: string;
};

const statusLabels: Record<string, string> = {
    AKTÍVNE: "Aktívne",
    REZERVA: "Rezerva",
    VYRADENÉ: "Vyradené",
    "DOČASNE VYRADENÉ": "Dočasne vyradené",
    PREREGISTROVANÉ: "Preregistrované",
};

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    AKTÍVNE: "default",
    REZERVA: "secondary",
    VYRADENÉ: "destructive",
    "DOČASNE VYRADENÉ": "outline",
    PREREGISTROVANÉ: "secondary",
};

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string | React.ReactNode;
}) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value || "N/A"}</p>
    </div>
);

export function VehicleBasicInfo({
    licensePlate,
    brand,
    model,
    vinNum,
    providerName,
    providerAssignmentStartDate,
    providerAssignmentEndDate,
    status,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Základné informácie</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="ŠPZ" value={licensePlate} />
                <DetailItem label="Značka" value={brand} />
                <DetailItem label="Model" value={model} />
                <DetailItem label="VIN" value={vinNum} />
                <DetailItem label="Poskytovateľ" value={providerName || "-"} />
                <DetailItem
                    label="Stav"
                    value={
                        <Badge variant={statusVariantMap[status] || "secondary"}>
                            {statusLabels[status] || status}
                        </Badge>
                    }
                />
                <DetailItem
                    label="Začiatok pridelenia"
                    value={providerAssignmentStartDate ? formatDate(providerAssignmentStartDate) : "-"}
                />
                <DetailItem
                    label="Koniec pridelenia"
                    value={providerAssignmentEndDate ? formatDate(providerAssignmentEndDate) : "-"}
                />
            </CardContent>
        </Card>
    );
}