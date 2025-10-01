"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import VehicleFilters from "@/components/dashboard/vehicle-filters";
import VehicleTable from "@/components/dashboard/vehicle-table";
import type { Vehicle, VehicleStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/constants/api";

const uiToApiStatus: Record<VehicleStatus, string> = {
    aktívne: "ACTIVE",
    rezerva: "RESERVE",
    vyradené: "DEREGISTERED",
    "dočasne vyradené": "TEMP_DEREGISTERED",
    preregistrované: "PREREGISTERED",
};

const apiToUiStatus: Record<string, VehicleStatus> = {
    ACTIVE: "aktívne",
    RESERVE: "rezerva",
    DEREGISTERED: "vyradené",
    TEMP_DEREGISTERED: "dočasne vyradené",
    PREREGISTERED: "preregistrované",
};

function toDateOrNull(s?: string | null) {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return isNaN(dt.getTime()) ? null : dt;
}

function mapApiToUi(v: any): Vehicle {
    return {
        id: String(v.id),
        spz: v.licensePlate,
        make: v.brand,
        model: v.model,

        provider: v.providerId ? String(v.providerId) : "",
        providerLabel: v.providerName || "—",

        networkPoint: v.networkPointId ? String(v.networkPointId) : "",
        networkPointLabel: v.networkPointName || "—",

        status: apiToUiStatus[v.status] || "aktívne",
        stkDate: toDateOrNull(v.technicalCheckValidUntil) as any,
        firstRegistration: toDateOrNull(v.firstRegistrationDate) as any,

        rdstModel: v.rdstDeviceId ? String(v.rdstDeviceId) : "",
        rdstId: v.rdstDeviceId ? String(v.rdstDeviceId) : "",
        avlModel: v.avlDeviceId ? String(v.avlDeviceId) : "",
        avlId: v.avlDeviceId ? String(v.avlDeviceId) : "",
    } as Vehicle;
}


export default function DashboardPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filters, setFilters] = useState<{ query: string; status: VehicleStatus | "all" }>({
        query: "",
        status: "aktívne",
    });
    const [loading, setLoading] = useState(false);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.query) params.append("q", filters.query);
        if (filters.status !== "all") {
            params.append("status", uiToApiStatus[filters.status]);
        }
        params.append("size", "1000");
        params.append("page", "0");
        return params.toString();
    }, [filters]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/vehicles?${queryParams}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            // Spring Data Page response: data.content holds entities
            setVehicles((data.content || []).map(mapApiToUi));
        } catch (e) {
            console.error("Failed to load vehicles:", e);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Zoznam vozidiel</CardTitle>
                        <CardDescription>
                            Prehľad všetkých registrovaných vozidiel v systéme.
                        </CardDescription>
                        </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/vehicles/archived">
                            <Archive className="mr-2 h-4 w-4" />
                            Archív
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <VehicleFilters onFilterChange={(f) => setFilters(f)} />
                    {loading && (
                        <div className="text-sm text-muted-foreground py-2">Načítavam…</div>
                    )}
                    <VehicleTable vehicles={vehicles} />
                </CardContent>
            </Card>
        </div>
    );
}
