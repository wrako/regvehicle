import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date";

type Props = {
    firstRegistrationDate?: Date | null;
    lastTechnicalCheckDate?: Date | null;
    technicalCheckValidUntil?: Date | null;
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value || "N/A"}</p>
    </div>
);

export function VehicleTechnicalInfo({
    firstRegistrationDate,
    lastTechnicalCheckDate,
    technicalCheckValidUntil,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Technické informácie a platnosť</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem
                    label="Dátum prvej registrácie"
                    value={formatDate(firstRegistrationDate) || "N/A"}
                />
                <DetailItem
                    label="Dátum poslednej technickej kontroly"
                    value={formatDate(lastTechnicalCheckDate) || "N/A"}
                />
                <DetailItem
                    label="Technická kontrola platná do"
                    value={formatDate(technicalCheckValidUntil) || "N/A"}
                />
            </CardContent>
        </Card>
    );
}