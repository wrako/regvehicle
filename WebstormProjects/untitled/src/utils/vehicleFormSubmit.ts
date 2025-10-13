import { createVehicle, editVehicle } from "@/lib/api";
import { toApiDate } from "@/lib/date";

type FormValues = {
    licensePlate: string;
    vinNum: string;
    brand: string;
    model: string;
    firstRegistrationDate?: Date;
    lastTechnicalCheckDate?: Date;
    technicalCheckValidUntil: Date;
    providerId: string;
    providerAssignmentEndDate: Date;
    files?: any;
};

export function buildVehiclePayload(v: FormValues, edit: boolean, vehicleId?: string) {
    return {
        id: edit ? Number(vehicleId) : undefined,
        licensePlate: (v.licensePlate || "").toUpperCase().trim(),
        vinNum: (v.vinNum || "").toUpperCase().trim(),
        brand: v.brand,
        model: v.model,
        firstRegistrationDate: toApiDate(v.firstRegistrationDate) ?? null,
        lastTechnicalCheckDate: toApiDate(v.lastTechnicalCheckDate) ?? null,
        technicalCheckValidUntil: toApiDate(v.technicalCheckValidUntil) ?? "",
        providerId: v.providerId,
        providerAssignmentEndDate: toApiDate(v.providerAssignmentEndDate) ?? "",
    };
}

export async function submitVehicle(payload: any, edit: boolean, vehicleId?: string) {
    if (edit && vehicleId) {
        return await editVehicle(vehicleId, payload);
    } else {
        return await createVehicle(payload);
    }
}