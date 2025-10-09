"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car } from "lucide-react";
import {
    EditVehicleForm,
    type EditInitial,
} from "@/components/dashboard/edit-vehicle-form";
import { API_BASE } from "@/constants/api";
import { fromApiDate } from "@/lib/date";

function mapStatusToUi(s: any): EditInitial["status"] {
    const v = String(s || "").toUpperCase();
    if (v === "ACTIVE") return "aktívne";
    if (v === "RESERVE") return "rezerva";
    if (v === "DEREGISTERED") return "vyradené";
    if (v === "TEMP_DEREGISTERED") return "dočasne vyradené";
    if (v === "PREREGISTERED") return "preregistrované";
    return "aktívne";
}

function normaliseToInitial(api: any): EditInitial {
    return {
        licensePlate: api.licensePlate ?? api.spz ?? "",
        brand: api.brand ?? api.make ?? "",
        model: api.model ?? "",
        // pick VIN from common API shapes
        vinNum: api.vinNum ?? api.vin ?? api.vin_num ?? api.vinnum ?? "",
        firstRegistrationDate: fromApiDate(api.firstRegistrationDate ?? api.firstRegistration) ?? null,
        lastTechnicalCheckDate: fromApiDate(api.lastTechnicalCheckDate ?? api.lastDateSTK) ?? null,
        technicalCheckValidUntil: fromApiDate(api.technicalCheckValidUntil ?? api.expiryDateSTK) ?? null,
        status: mapStatusToUi(api.status),
        providerId: String(api.providerId ?? api.provider?.id ?? ""),
        providerAssignmentStartDate: fromApiDate(api.providerAssignmentStartDate) ?? null,
        providerAssignmentEndDate: fromApiDate(api.providerAssignmentEndDate) ?? null,
        avlDeviceId: String(api.avlDeviceId ?? api.avlDevice?.id ?? ""),
        rdstDeviceId: String(api.rdstDeviceId ?? api.rdstDevice?.id ?? ""),
        // removed certificate field (view-only now)
        filePaths: api.filePaths ?? [],
    };
}

export default function EditVehiclePage() {
    const params = useParams<{ id: string }>();
    const id = typeof params?.id === "string" ? params.id : "";

    const [initial, setInitial] = useState<EditInitial | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [providers, setProviders] = useState<any[]>([]);
    const [avlDevices, setAvlDevices] = useState<any[]>([]);
    const [rdstDevices, setRdstDevices] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/vehicles/${id}`);
                if (!res.ok) throw new Error(await res.text());
                const dto = await res.json();
                setInitial(normaliseToInitial(dto));
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať vozidlo.");
            }
        })();

        (async () => {
            try {
                const [provRes, avlRes, rdstRes] = await Promise.all([
                    fetch(`${API_BASE}/providers`),
                    fetch(`${API_BASE}/avl-devices`),
                    fetch(`${API_BASE}/rdst-devices`),
                ]);
                setProviders(await provRes.json());
                setAvlDevices(await avlRes.json());
                setRdstDevices(await rdstRes.json());
            } catch (e) {
                console.error("Nepodarilo sa načítať číselníky.", e);
            }
        })();
    }, [id]);

    const formKey = useMemo(() => JSON.stringify(initial), [initial]);

    if (error) return <div className="text-red-600">{error}</div>;
    if (!initial) return <div>Načítavam…</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Upraviť vozidlo</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <Car className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Edit Vehicle</h2>
                    <p className="text-muted-foreground">Update vehicle details</p>
                </div>
            </div>

            <EditVehicleForm
                key={formKey}
                vehicleId={id}
                initial={initial}
                providers={providers}
                // avlDevices={avlDevices}
                // rdstDevices={rdstDevices}
            />
        </div>
    );
}
