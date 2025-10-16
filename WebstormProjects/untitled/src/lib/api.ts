// src/lib/api.ts
export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8080";

// Helper to get auth headers with JWT token
function getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// Helper to merge auth headers with other headers
function withAuth(headers: HeadersInit = {}): HeadersInit {
    return { ...headers, ...getAuthHeaders() };
}

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

async function handleVehicleError(res: Response) {
    if (!res.ok) {
        // Clone the response so we can read it multiple times
        const resClone = res.clone();
        let backendMessage = "";

        // Try to get error message from response body
        try {
            const text = await resClone.text();
            if (text) {
                backendMessage = text;
            }
        } catch (e) {
            // Ignore parsing errors
        }

        // Translate backend error messages to Slovak based on status and content
        if (res.status === 409) {
            // Check if it's a VIN duplicate error
            if (backendMessage.toLowerCase().includes("vin")) {
                throw new Error("Vozidlo s týmto VIN číslom už existuje (aktívne alebo archivované). Nemožno registrovať duplicitný VIN.");
            }
            // Check if it's a license plate duplicate error
            else if (backendMessage.toLowerCase().includes("license") || backendMessage.toLowerCase().includes("plate") || backendMessage.toLowerCase().includes("spz")) {
                throw new Error("Vozidlo s touto ŠPZ už existuje (aktívne alebo archivované). Nemožno registrovať duplicitnú ŠPZ.");
            }
            // Generic 409 conflict error
            else {
                throw new Error("Vozidlo s týmito údajmi už existuje. Nemožno vytvoriť duplicitný záznam.");
            }
        }

        // For other errors, show backend message or generic error
        throw new Error(backendMessage || `Chyba: ${res.status} ${res.statusText}`);
    }
    return res;
}

async function handleProviderError(res: Response) {
    if (!res.ok) {
        // Clone the response so we can read it multiple times
        const resClone = res.clone();
        let backendMessage = "";

        // Try to get error message from response body
        try {
            const text = await resClone.text();
            if (text) {
                backendMessage = text;
            }
        } catch (e) {
            // Ignore parsing errors
        }

        // Translate backend error messages to Slovak based on status and content
        if (res.status === 409) {
            // Display Slovak error message for duplicate providerId
            throw new Error("Poskytovateľ s týmto ID už existuje");
        }

        // For other errors, show backend message or generic error
        throw new Error(backendMessage || `Chyba: ${res.status} ${res.statusText}`);
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
        headers: withAuth({ "Content-Type": "application/json" }),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function createProvider(data: { providerId: string; name: string; address: string }) {
    const res = await fetch(`${API_BASE}/providers`, {
        method: "POST",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    await handleProviderError(res);
    return await res.json();
}

export async function updateProvider(id: number, data: any) {
    const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    await handleProviderError(res);
    return await res.json();
}


export async function deleteProvider(id: number) {
    const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
}

// Network Point API functions
export async function getNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function updateNetworkPoint(id: number, data: any) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}

export async function deleteNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Archive failed: ${res.status}`);
    }
    return await res.json();
}

export async function unarchiveNetworkPoint(id: number, providerId: number, providerEndDate: string, npValidTo: string, bypassCapacityCheck: boolean = false) {
    const url = new URL(`${API_BASE}/network-points/${id}/unarchive`);
    url.searchParams.set("providerId", String(providerId));
    url.searchParams.set("providerRegistrationEndDate", providerEndDate);
    url.searchParams.set("networkPointValidTo", npValidTo);
    url.searchParams.set("bypassCapacityCheck", String(bypassCapacityCheck));

    const res = await fetch(url.toString(), {
        method: "POST",
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
    }
    );
    ensureOk(res);
    return await res.json();
}

export async function getArchivedNetworkPoint(id: number) {
    const res = await fetch(`${API_BASE}/network-points/archived/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function runExpireCheckNetworkPoints() {
    const res = await fetch(`${API_BASE}/network-points/expire-check`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Expire check failed: ${res.status}`);
    }
    return await res.json();
}

export async function runProviderEmptyCheck() {
    const res = await fetch(`${API_BASE}/providers/empty-check`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Provider empty check failed: ${res.status}`);
    }
    return await res.json();
}

export async function archiveProvider(id: number, params?: { reason?: string }) {
    const url = new URL(`${API_BASE}/providers/${id}/archive`);
    if (params?.reason) {
        url.searchParams.set("reason", params.reason);
    }
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Archive failed: ${res.status}`);
    }
    return await res.json();
}

export async function unarchiveProvider(id: number) {
    const res = await fetch(`${API_BASE}/providers/${id}/unarchive`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Unarchive failed: ${res.status}`);
    }
    return await res.json();
}

export async function getArchivedProviders(page: number = 0, size: number = 100) {
    const res = await fetch(
        `${API_BASE}/providers/archived/page?page=${page}&size=${size}`,
        {
            method: "GET",
            credentials: "include",
        headers: getAuthHeaders(),
    }
    );
    ensureOk(res);
    return await res.json();
}

export async function getArchivedProvider(id: number) {
    const res = await fetch(`${API_BASE}/providers/archived/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getProviderVehicleCount(id: number | string) {
    const res = await fetch(`${API_BASE}/providers/vehicles/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getProviderNetworkPointCount(id: number | string) {
    const res = await fetch(`${API_BASE}/providers/network-point/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getProviderHistory(id: number | string) {
    const res = await fetch(`${API_BASE}/provider-logs/history/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to load provider history");
    }
    return await res.json();
}

export async function getNetworkPointHistory(id: number | string) {
    const res = await fetch(`${API_BASE}/network-point-logs/history/${id}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to load network point history");
    }
    return await res.json();
}

// Legacy API functions (needed by existing components)
export async function getProviders() {
    const res = await fetch(`${API_BASE}/providers`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getNetworkPoints() {
    const res = await fetch(`${API_BASE}/network-points`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getAvlDevices() {
    const res = await fetch(`${API_BASE}/avl-devices`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function getRdstDevices() {
    const res = await fetch(`${API_BASE}/rdst-devices`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}


export async function createVehicle(data: any) {
    const res = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    await handleVehicleError(res);
    return await res.json();
}

export async function editVehicle(id: string, data: any) {
    const res = await fetch(`${API_BASE}/vehicles/${id}/edit`, {
        method: "POST",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    await handleVehicleError(res);
    return await res.json();
}

// NetworkPoint Queue API functions
export async function getNetworkPointQueue(networkPointId: number) {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}/queue`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
    return await res.json();
}

export async function addProviderToQueue(networkPointId: number, providerId: number, endDate: string) {
    const url = new URL(`${API_BASE}/network-points/${networkPointId}/queue`);
    url.searchParams.set("providerId", String(providerId));
    url.searchParams.set("endDate", endDate);

    const res = await fetch(url.toString(), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    ensureOk(res);
}

export async function removeFromQueue(networkPointId: number, registrationId: number) {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}/queue/${registrationId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
}

export async function promoteNext(networkPointId: number) {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}/queue/promote-next`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    ensureOk(res);
}

export async function clearQueue(networkPointId: number) {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}/queue`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
    });
    ensureOk(res);
}

export async function updateRegistrationDates(networkPointId: number, registrationId: number, startDate?: string, endDate?: string) {
    const url = new URL(`${API_BASE}/network-points/${networkPointId}/queue/${registrationId}`);
    if (startDate) url.searchParams.set("startDate", startDate);
    if (endDate) url.searchParams.set("endDate", endDate);

    const res = await fetch(url.toString(), {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
    });
    ensureOk(res);
}

export async function reorderQueue(networkPointId: number, registrationIds: number[]) {
    const res = await fetch(`${API_BASE}/network-points/${networkPointId}/queue/reorder`, {
        method: "PUT",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(registrationIds),
    });
    ensureOk(res);
}

export async function createNetworkPoint(data: any, bypassCapacityCheck: boolean = false) {
    const url = new URL(`${API_BASE}/network-points`);
    url.searchParams.set("bypassCapacityCheck", String(bypassCapacityCheck));

    const res = await fetch(url.toString(), {
        method: "POST",
        credentials: "include",
        headers: withAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    ensureOk(res);
    return await res.json();
}

// Data import API function
export async function uploadCsvFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/import`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
    }

    return await res.json();
}
