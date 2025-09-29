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
