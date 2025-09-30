import { format } from "date-fns";
import { createVehicle, editVehicle } from "@/lib/api";
import { vinExists, uploadVehicleFiles } from "@/utils";

type FormValues = {
    licensePlate: string;
    vinNum: string;
    brand: string;
    model: string;
    firstRegistrationDate?: Date;
    lastTechnicalCheckDate?: Date;
    technicalCheckValidUntil: Date;
    status: "aktívne" | "rezerva" | "vyradené" | "dočasne vyradené" | "preregistrované";
    providerId: string;
    files?: any;
};

const statusMap: Record<FormValues["status"], string> = {
    aktívne: "ACTIVE",
    rezerva: "RESERVE",
    vyradené: "DEREGISTERED",
    "dočasne vyradené": "TEMP_DEREGISTERED",
    preregistrované: "PREREGISTERED",
};

export function buildVehiclePayload(v: FormValues, edit: boolean, vehicleId?: string) {
    return {
        id: edit ? Number(vehicleId) : undefined,
        licensePlate: (v.licensePlate || "").toUpperCase().trim(),
        vinNum: (v.vinNum || "").toUpperCase().trim(),
        brand: v.brand,
        model: v.model,
        firstRegistrationDate: v.firstRegistrationDate ? format(v.firstRegistrationDate, "yyyy-MM-dd") : null,
        lastTechnicalCheckDate: v.lastTechnicalCheckDate ? format(v.lastTechnicalCheckDate, "yyyy-MM-dd") : null,
        technicalCheckValidUntil: format(v.technicalCheckValidUntil, "yyyy-MM-dd"),
        status: statusMap[v.status],
        providerId: v.providerId,
    };
}

export async function submitVehicle(payload: any, edit: boolean, vehicleId?: string) {
    if (edit && vehicleId) {
        return await editVehicle(vehicleId, payload);
    } else {
        const vin = (payload.vinNum || "").toUpperCase().trim();
        if (vin && (await vinExists(vin))) {
            return { needsConfirmation: true, payload };
        }
        return await createVehicle(payload);
    }
}