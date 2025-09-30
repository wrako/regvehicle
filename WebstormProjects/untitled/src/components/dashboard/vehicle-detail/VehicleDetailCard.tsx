import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

type Vehicle = {
    licensePlate: string;
    brand: string;
    model: string;
    vinNum?: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
    status: string;
    providerName?: string;
    networkPointName?: string;
};

type Props = {
    vehicle: Vehicle;
};

function formatDate(dateStr?: string) {
    if (!dateStr) return "N/A";
    try {
        return format(new Date(dateStr), "dd.MM.yyyy", { locale: sk });
    } catch {
        return "N/A";
    }
}

function getStatusBadge(status: string) {
    const statusMap: Record<string, { variant: any; label: string }> = {
        ACTIVE: { variant: "default", label: "Aktívne" },
        RESERVE: { variant: "secondary", label: "Rezerva" },
        TEMP_DEREGISTERED: { variant: "outline", label: "Dočasne vyradené" },
        DEREGISTERED: { variant: "destructive", label: "Vyradené" },
        PREREGISTERED: { variant: "outline", label: "Preregistrované" },
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function VehicleDetailCard({ vehicle }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informácie o vozidle</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">ŠPZ</p>
                        <p className="text-lg font-semibold">{vehicle.licensePlate}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">VIN</p>
                        <p className="text-lg font-semibold">{vehicle.vinNum || "N/A"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Značka</p>
                        <p>{vehicle.brand}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Model</p>
                        <p>{vehicle.model}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Prvá registrácia</p>
                        <p>{formatDate(vehicle.firstRegistrationDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Posledná STK</p>
                        <p>{formatDate(vehicle.lastTechnicalCheckDate)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Platnosť STK</p>
                        <p>{formatDate(vehicle.technicalCheckValidUntil)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Stav</p>
                        {getStatusBadge(vehicle.status)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Poskytovateľ</p>
                        <p>{vehicle.providerName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Bod siete</p>
                        <p>{vehicle.networkPointName || "N/A"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}