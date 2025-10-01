import { API_BASE } from "@/constants/api";

type OperationType = "CREATE" | "UPDATE" | "DELETE";

export type Vehicle = {
    id: string;
    spz: string;
};

export type VehicleLog = {
    id: string;
    vehicleId: string;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate: Date;
    lastTechnicalCheckDate?: Date | null;
    technicalCheckValidUntil: Date;
    status: string;
    certificateFilePath?: string | null;
    author: string;
    timestamp: Date;
    operation: OperationType;
};

export async function fetchVehicle(vehicleId: string): Promise<Vehicle | null> {
    const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, { credentials: "include" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load vehicle"));
    const raw = await res.json();
    return {
        id: String(raw.id ?? vehicleId),
        spz: String(raw.spz ?? raw.licensePlate ?? ""),
    };
}

export function toDate(v: unknown): Date {
    if (v === null || v === undefined || v === "") return new Date(0);
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

type VehicleLogApi = {
    id: number | string;
    vehicleId: number | string;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: string | null;
    lastTechnicalCheckDate?: string | null;
    technicalCheckValidUntil?: string | null;
    status: string;
    certificateFilePath?: string | null;
    author: string;
    timestamp: string;
    operation: OperationType;
};

export async function fetchHistory(vehicleId: string): Promise<VehicleLog[]> {
    const res = await fetch(`${API_BASE}/vehicle-logs/history/${vehicleId}`, { credentials: "include" });

    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load history"));

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const normalized: VehicleLog[] = (data as VehicleLogApi[]).map((x) => ({
        id: String(x.id),
        vehicleId: String(x.vehicleId ?? vehicleId),
        licensePlate: x.licensePlate,
        brand: x.brand,
        model: x.model,
        firstRegistrationDate: toDate(x.firstRegistrationDate),
        lastTechnicalCheckDate: x.lastTechnicalCheckDate ? toDate(x.lastTechnicalCheckDate) : null,
        technicalCheckValidUntil: toDate(x.technicalCheckValidUntil),
        status: x.status,
        certificateFilePath: x.certificateFilePath ?? null,
        author: x.author,
        timestamp: toDate(x.timestamp),
        operation: x.operation,
    }));

    normalized.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return normalized;
}

export type LogChanges = {
    [K in keyof Omit<VehicleLog, "id" | "vehicleId" | "author" | "timestamp" | "operation">]?: boolean;
};

export function getChanges(current: VehicleLog, previous?: VehicleLog): LogChanges {
    if (!previous) return {};
    const changes: LogChanges = {};

    if (current.licensePlate !== previous.licensePlate) changes.licensePlate = true;
    if (current.brand !== previous.brand) changes.brand = true;
    if (current.model !== previous.model) changes.model = true;

    if (
        !previous.firstRegistrationDate ||
        !current.firstRegistrationDate ||
        current.firstRegistrationDate.getTime() !== previous.firstRegistrationDate.getTime()
    )
        changes.firstRegistrationDate = true;

    if (
        (current.lastTechnicalCheckDate?.getTime() ?? -1) !==
        (previous.lastTechnicalCheckDate?.getTime() ?? -1)
    )
        changes.lastTechnicalCheckDate = true;

    if (
        !previous.technicalCheckValidUntil ||
        !current.technicalCheckValidUntil ||
        current.technicalCheckValidUntil.getTime() !== previous.technicalCheckValidUntil.getTime()
    )
        changes.technicalCheckValidUntil = true;

    if (current.status !== previous.status) changes.status = true;
    if ((current.certificateFilePath ?? "") !== (previous.certificateFilePath ?? ""))
        changes.certificateFilePath = true;

    return changes;
}