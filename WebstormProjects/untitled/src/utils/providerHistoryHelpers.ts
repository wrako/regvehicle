import { API_BASE } from "@/constants/api";
import { ProviderLogDto, ProviderState } from "@/types";

type OperationType = "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "UNARCHIVE";

export type Provider = {
    id: string;
    name: string;
};

export type ProviderLog = {
    id: string;
    providerId: string;
    name: string;
    email?: string;
    providerIdField: string;
    address: string;
    state: ProviderState;
    archived: boolean;
    vehicleCount: number;
    networkPointCount: number;
    author: string;
    timestamp: Date;
    operation: OperationType;
};

export async function fetchProvider(providerId: string): Promise<Provider | null> {
    const res = await fetch(`${API_BASE}/providers/${providerId}`, { credentials: "include" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load provider"));
    const raw = await res.json();
    return {
        id: String(raw.id ?? providerId),
        name: String(raw.name ?? ""),
    };
}

export function toDate(v: unknown): Date {
    if (v === null || v === undefined || v === "") return new Date(0);
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

export async function fetchProviderHistory(providerId: string): Promise<ProviderLog[]> {
    const res = await fetch(`${API_BASE}/provider-logs/history/${providerId}`, { credentials: "include" });

    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load history"));

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const normalized: ProviderLog[] = (data as ProviderLogDto[]).map((x) => ({
        id: String(x.id),
        providerId: String(x.providerId ?? providerId),
        name: x.name ?? "",
        email: x.email,
        providerIdField: x.providerIdField ?? "",
        address: x.address ?? "",
        state: x.state ?? "DISABLED",
        archived: x.archived ?? false,
        vehicleCount: x.vehicleCount ?? 0,
        networkPointCount: x.networkPointCount ?? 0,
        author: x.author,
        timestamp: toDate(x.timestamp),
        operation: x.operation as OperationType,
    }));

    normalized.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return normalized;
}

export type ProviderLogChanges = {
    [K in keyof Omit<ProviderLog, "id" | "providerId" | "author" | "timestamp" | "operation">]?: boolean;
};

export function getProviderChanges(current: ProviderLog, previous?: ProviderLog): ProviderLogChanges {
    if (!previous) return {};
    const changes: ProviderLogChanges = {};

    if (current.name !== previous.name) changes.name = true;
    if (current.email !== previous.email) changes.email = true;
    if (current.providerIdField !== previous.providerIdField) changes.providerIdField = true;
    if (current.address !== previous.address) changes.address = true;
    if (current.state !== previous.state) changes.state = true;
    if (current.archived !== previous.archived) changes.archived = true;
    if (current.vehicleCount !== previous.vehicleCount) changes.vehicleCount = true;
    if (current.networkPointCount !== previous.networkPointCount) changes.networkPointCount = true;

    return changes;
}
