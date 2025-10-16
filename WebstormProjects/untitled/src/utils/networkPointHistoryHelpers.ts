import { API_BASE } from "@/constants/api";
import { NetworkPointLogDto } from "@/types";

type OperationType = "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "UNARCHIVE";

export type NetworkPoint = {
    id: string;
    code: string;
    name: string;
};

export type NetworkPointLog = {
    id: string;
    networkPointId: string;
    code: string;
    name: string;
    type: string;
    validFrom: Date;
    validTo: Date;
    providerId?: number;
    providerName?: string;
    archived: boolean;
    author: string;
    timestamp: Date;
    operation: OperationType;
};

export async function fetchNetworkPoint(networkPointId: string): Promise<NetworkPoint | null> {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}`, { credentials: "include" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load network point"));
    const raw = await res.json();
    return {
        id: String(raw.id ?? networkPointId),
        code: String(raw.code ?? ""),
        name: String(raw.name ?? ""),
    };
}

export function toDate(v: unknown): Date {
    if (v === null || v === undefined || v === "") return new Date(0);
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

export async function fetchNetworkPointHistory(networkPointId: string): Promise<NetworkPointLog[]> {
    const res = await fetch(`${API_BASE}/network-point-logs/history/${networkPointId}`, { credentials: "include" });

    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load history"));

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const normalized: NetworkPointLog[] = (data as NetworkPointLogDto[]).map((x) => ({
        id: String(x.id),
        networkPointId: String(x.networkPointId ?? networkPointId),
        code: x.code ?? "",
        name: x.name ?? "",
        type: x.type ?? "",
        validFrom: toDate(x.validFrom),
        validTo: toDate(x.validTo),
        providerId: x.providerId,
        providerName: x.providerName,
        archived: x.archived ?? false,
        author: x.author,
        timestamp: toDate(x.timestamp),
        operation: x.operation as OperationType,
    }));

    normalized.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return normalized;
}

export type NetworkPointLogChanges = {
    [K in keyof Omit<NetworkPointLog, "id" | "networkPointId" | "author" | "timestamp" | "operation">]?: boolean;
};

export function getNetworkPointChanges(current: NetworkPointLog, previous?: NetworkPointLog): NetworkPointLogChanges {
    if (!previous) return {};
    const changes: NetworkPointLogChanges = {};

    if (current.code !== previous.code) changes.code = true;
    if (current.name !== previous.name) changes.name = true;
    if (current.type !== previous.type) changes.type = true;
    if (current.validFrom.getTime() !== previous.validFrom.getTime()) changes.validFrom = true;
    if (current.validTo.getTime() !== previous.validTo.getTime()) changes.validTo = true;
    if (current.providerId !== previous.providerId) changes.providerId = true;
    if (current.providerName !== previous.providerName) changes.providerName = true;
    if (current.archived !== previous.archived) changes.archived = true;

    return changes;
}
