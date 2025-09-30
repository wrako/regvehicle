"use client";

import { useParams } from "next/navigation";
import {
    ArchivedVehicleHeader,
    VehicleBasicInfo,
    VehicleTechnicalInfo,
    VehicleAttachments,
} from "@/components/dashboard/vehicle-detail";
import { useArchivedVehicleDetail } from "@/hooks/useArchivedVehicleDetail";

export default function ArchivedVehicleDetailPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const { vehicle, error, loading } = useArchivedVehicleDetail(id);

    if (error) return <div className="text-red-600">{error}</div>;
    if (loading || !vehicle) return <div>Načítavam…</div>;

    return (
        <div className="flex flex-col gap-6">
            <ArchivedVehicleHeader licensePlate={vehicle.licensePlate} />

            <VehicleBasicInfo
                licensePlate={vehicle.licensePlate}
                brand={vehicle.brand}
                model={vehicle.model}
                vinNum={vehicle.vinNum}
                providerName={vehicle.providerName}
                status={vehicle.status}
            />

            <VehicleTechnicalInfo
                firstRegistrationDate={vehicle.firstRegistrationDate}
                lastTechnicalCheckDate={vehicle.lastTechnicalCheckDate}
                technicalCheckValidUntil={vehicle.technicalCheckValidUntil}
            />

            <VehicleAttachments filePaths={vehicle.filePaths} vehicleId={String(vehicle.id)} />
        </div>
    );
}
