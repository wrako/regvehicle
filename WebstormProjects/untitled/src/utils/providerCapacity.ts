import { API_BASE } from "@/constants/api";

export async function getProviderVehiclesCount(providerId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/providers/vehicles/${providerId}`, { credentials: "include" });
    if (!res.ok) return 0;
    const txt = await res.text();
    const n = Number(txt);
    return Number.isFinite(n) ? n : 0;
}

export async function getProviderNetworkPointsCount(providerId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/providers/network-point/${providerId}`, { credentials: "include" });
    if (!res.ok) return 0;
    const txt = await res.text();
    const n = Number(txt);
    return Number.isFinite(n) ? n : 0;
}

export async function checkProviderCapacity(providerId: number): Promise<{ ok: boolean; have: number; required: number }> {
    const have = await getProviderVehiclesCount(providerId);
    const nn = await getProviderNetworkPointsCount(providerId);
    const required = Math.ceil(1.3 * (nn + 1));
    return { ok: have >= required, have, required };
}