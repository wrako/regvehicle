// src/lib/api.ts
export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8080";

export type VehicleStatus = "ACTIVE" | "RESERVE" | "PREREGISTERED";

export interface Vehicle {
    id: number;
    plateNumber?: string | null;
    vin?: string | null;
    providerName?: string | null;
    status: VehicleStatus | string;
    archived: boolean;
    archivedAt?: string | null;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

type ArchivedVehiclesFilter = {
    // Keep this minimal & permissive — backend will ignore unknowns if not used.
    // If you have a concrete VehicleFilter type in the backend, mirror it here.
    search?: string;
};

function ensureOk(res: Response) {
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return res;
}

export async function listArchivedVehicles(params: {
    page?: number;
    size?: number;
    search?: string;
}) {
    const { page = 0, size = 10, search } = params || {};
    const url = new URL(`${API_BASE}/vehicles/archived`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));

    const body: ArchivedVehiclesFilter = {};
    if (search && search.trim()) body.search = search.trim();

    const res = await fetch(url.toString(), {
        method: "POST", // <-- IMPORTANT: backend expects POST with a filter body
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    ensureOk(res);
    return (await res.json()) as Page<Vehicle>;
}

export async function unarchiveVehicle(id: number, status: VehicleStatus) {
    const res = await fetch(
        `${API_BASE}/vehicles/${id}/unarchive?status=${encodeURIComponent(status)}`,
        {
            method: "POST",
            credentials: "include",
        }
    );
    ensureOk(res);
    return (await res.json()) as Vehicle;
}


// Provider API functions
export async function getProvider(id: number) {
    const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

export async function createProvider(data: { providerId: string; name: string; address: string }) {
    const res = await fetch(`${API_BASE}/providers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}

export async function updateProvider(id: number, data: any) {
    const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}


export async function deleteProvider(id: number) {
    const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    ensureOk(res);
}

// Network Point API functions
export async function getNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

export async function updateNetworkPoint(id: number, data: any) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}

export async function deleteNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    ensureOk(res);
}

export async function archiveNetworkPoint(id: number, params?: { reason?: string }) {
    const url = new URL(`${API_BASE}/network-points/${id}/archive`);
    if (params?.reason) {
        url.searchParams.set("reason", params.reason);
    }
    const res = await fetch(url.toString(), {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Archive failed: ${res.status}`);
    }
    return await res.json();
}

export async function unarchiveNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/${id}/unarchive`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Unarchive failed: ${res.status}`);
    }
    return await res.json();
}

export async function getArchivedNetworkPoints(page: number = 0, size: number = 100) {
    const res = await fetch(
        `${API_BASE}/network-points/archived/page?page=${page}&size=${size}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    ensureOk(res);
    return await res.json();
}

export async function getArchivedNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/archived/${id}`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

// Legacy API functions (needed by existing components)
export async function getProviders() {
    const res = await fetch(`${API_BASE}/providers`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

export async function getNetworkPoints() {
    const res = await fetch(`${API_BASE}/network-points`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

export async function getAvlDevices() {
    const res = await fetch(`${API_BASE}/avl-devices`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}

export async function getRdstDevices() {
    const res = await fetch(`${API_BASE}/rdst-devices`, {
        method: "GET",
        credentials: "include",
    });
    ensureOk(res);
    return await res.json();
}


export async function createVehicle(data: any) {
    const res = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}

export async function editVehicle(id: string, data: any) {
    const res = await fetch(`${API_BASE}/vehicles/${id}/edit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}
