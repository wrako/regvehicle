"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import VehicleTable from "@/components/dashboard/archived-vehicle-table";
import type { Vehicle, VehicleStatus } from "@/types";
import { API_BASE } from "@/constants/api";
import { cancellableFetch } from "@/utils/fetchUtils";

// === Status conversions ===
const apiToUiStatus: Record<string, VehicleStatus> = {
    ACTIVE: "aktívne",
    RESERVE: "rezerva",
    DEREGISTERED: "vyradené",
    TEMP_DEREGISTERED: "dočasne vyradené",
    PREREGISTROVANÉ: "preregistrované",
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

export default function ArchivedVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const lastQueryKeyRef = useRef<string>("");

    // Basic pagination params
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append("size", "100");
        params.append("page", "0");
        return params.toString();
    }, []);

    const queryKey = useMemo(() =>
        `${API_BASE}/vehicles/archived/page?${queryParams}`,
        [queryParams]
    );

    const load = useCallback(async () => {
        // StrictMode guard: prevent duplicate calls
        if (lastQueryKeyRef.current === queryKey) {
            return;
        }
        lastQueryKeyRef.current = queryKey;

        setLoading(true);
        try {
            const data = await cancellableFetch(
                queryKey,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                },
                "archived-vehicles-list"
            );
            setVehicles((data.content || []).map(mapApiToUi));
        } catch (e: any) {
            // Ignore abort errors
            if (e.name === 'AbortError') return;

            console.error("Failed to load archived vehicles:", e);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [queryKey]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Archivované vozidlá</CardTitle>
                    <CardDescription>
                        Zoznam všetkých archivovaných vozidiel v systéme.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="text-sm text-muted-foreground py-2">Načítavam…</div>
                    )}
                    <VehicleTable vehicles={vehicles} />
                </CardContent>
            </Card>
        </div>
    );
}
