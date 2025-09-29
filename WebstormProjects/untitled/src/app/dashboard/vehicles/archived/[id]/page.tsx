"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Edit, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const API_BASE = "http://localhost:8080";

interface VehicleDto {
    id: number;
    licensePlate: string;

    brand: string;
    model: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
    status: string;
    providerId?: number;
    networkPointId?: number;
    avlDeviceId?: number;
    rdstDeviceId?: number;
    certificateFilePath?: string;

    // NEW: attachments
    filePaths?: string[];

    // NEW: VIN (support both common backend property names)
    vinNum?: string;

    // Optional display names if your API provides them
    providerName?: string;
    networkPointName?: string;
}

interface Provider {
    id: number;
    name: string;
    providerId: string;
    address: string;
}

interface NetworkPoint {
    id: number;
    name: string;
    code: string;
    type: string;
}

interface AvlDevice {
    id: number;
    model: string;
    communicationId: string;
}

interface RdstDevice {
    id: number;
    model: string;
    rdstId: string;
}

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

// helper to display a filename from absolute path
const fileNameFromPath = (p: string) => {
    try {
        return p.split(/[\\/]/).pop() || p;
    } catch {
        return p;
    }
};

export default function VehicleDetailPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [networkPoint, setNetworkPoint] = useState<NetworkPoint | null>(null);
    // const [avlDevice, setAvlDevice] = useState<AvlDevice | null>(null);
    // const [rdstDevice, setRdstDevice] = useState<RdstDevice | null>(null);
    const [error, setError] = useState<string | null>(null);

    // fetch vehicle first
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/vehicles/archived/${id}`);
                if (!res.ok) throw new Error(await res.text());
                const dto: VehicleDto = await res.json();
                setVehicle(dto);

                // fetch related entities in parallel (only if IDs present)
                if (dto.providerId)
                    fetch(`${API_BASE}/providers/${dto.providerId}`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then(setProvider)
                        .catch(() => null);

                if (dto.networkPointId)
                    fetch(`${API_BASE}/network-points/${dto.networkPointId}`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then(setNetworkPoint)
                        .catch(() => null);

                // if (dto.avlDeviceId)
                //   fetch(`${API_BASE}/avl-devices/${dto.avlDeviceId}`)
                //     .then((r) => r.json())
                //     .then(setAvlDevice)
                //     .catch(() => null);
                //
                // if (dto.rdstDeviceId)
                //   fetch(`${API_BASE}/rdst-devices/${dto.rdstDeviceId}`)
                //     .then((r) => r.json())
                //     .then(setRdstDevice)
                //     .catch(() => null);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať vozidlo.");
            }
        })();
    }, [id]);

    if (error) return <div className="text-red-600">{error}</div>;
    if (!vehicle) return <div>Načítavam…</div>;

    const statusLabels: Record<string, string> = {
        AKTÍVNE: "Aktívne",
        REZERVA: "Rezerva",
        VYRADENÉ: "Vyradené",
        "DOČASNE VYRADENÉ": "Dočasne vyradené",
        PREREGISTROVANÉ: "Preregistrované",
    };

    const statusVariantMap: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
    > = {
        AKTÍVNE: "default",
        REZERVA: "secondary",
        VYRADENÉ: "destructive",
        "DOČASNE VYRADENÉ": "outline",
        PREREGISTROVANÉ: "secondary",
    };

    // resolve VIN from either field name
    const vinValue = vehicle.vinNum;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/vehicles/archived/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Späť na zoznam vozidiel</h1>
                </div>

            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <Car className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">
                        Detail vozidla: {vehicle.licensePlate}
                    </h2>
                    <p className="text-muted-foreground">Kompletné informácie o vozidle</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Základné informácie</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="ŠPZ" value={vehicle.licensePlate} />
                    <DetailItem label="Značka" value={vehicle.brand} />
                    <DetailItem label="Model" value={vehicle.model} />
                    {/* NEW: VIN */}
                    <DetailItem label="VIN" value={vinValue} />
                    <DetailItem label="Poskytovateľ" value={vehicle.providerName || "-"} />
                    <DetailItem
                        label="Stav"
                        value={
                            <Badge variant={statusVariantMap[vehicle.status] || "secondary"}>
                                {statusLabels[vehicle.status] || vehicle.status}
                            </Badge>
                        }
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Technické informácie a platnosť</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem
                        label="Dátum prvej registrácie"
                        value={
                            vehicle.firstRegistrationDate
                                ? format(new Date(vehicle.firstRegistrationDate), "dd.MM.yyyy", {
                                    locale: sk,
                                })
                                : "N/A"
                        }
                    />
                    <DetailItem
                        label="Dátum poslednej technickej kontroly"
                        value={
                            vehicle.lastTechnicalCheckDate
                                ? format(new Date(vehicle.lastTechnicalCheckDate), "dd.MM.yyyy", {
                                    locale: sk,
                                })
                                : "N/A"
                        }
                    />
                    <DetailItem
                        label="Technická kontrola platná do"
                        value={
                            vehicle.technicalCheckValidUntil
                                ? format(
                                    new Date(vehicle.technicalCheckValidUntil),
                                    "dd.MM.yyyy",
                                    { locale: sk }
                                )
                                : "N/A"
                        }
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vybavenie a priradenie</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Sieťový bod" value={vehicle.networkPointName || "-"} />
                    {/* <DetailItem label="Model RDST" value={rdstDevice?.model || "-"} /> */}
                    {/* <DetailItem label="ID RDST" value={rdstDevice?.rdstId || "-"} /> */}
                    {/* <DetailItem label="Model AVL" value={avlDevice?.model || "-"} /> */}
                    {/* <DetailItem label="ID AVL" value={avlDevice?.communicationId || "-"} /> */}
                    {vehicle.certificateFilePath && (
                        <DetailItem
                            label="Certifikát"
                            value={
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <a
                                        href={`${API_BASE}/vehicles/file?path=${encodeURIComponent(
                                            vehicle.certificateFilePath
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Zobraziť certifikát
                                    </a>
                                </Button>
                            }
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prílohy</CardTitle>
                </CardHeader>
                <CardContent>
                    {vehicle.filePaths && vehicle.filePaths.length > 0 ? (
                        <ul className="space-y-2">
                            {vehicle.filePaths.map((p, idx) => (
                                <li key={idx} className="flex items-center">
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <a
                                            href={`${API_BASE}/vehicles/file?path=${encodeURIComponent(
                                                p
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            {fileNameFromPath(p)}
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Žiadne prílohy.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
