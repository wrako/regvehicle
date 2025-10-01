import { useEffect, useState } from "react";
import { API_BASE } from "@/constants/api";

interface VehicleDto {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
    status: string;
    providerId?: number;
    networkPointId?: number;
    avlDeviceId?: number;
    rdstDeviceId?: number;
    certificateFilePath?: string;
    filePaths?: string[];
    vinNum?: string;
    providerName?: string;
    networkPointName?: string;
}

interface Provider {
    id: number;
    name: string;
    providerId: string;
    address: string;
}

interface NetworkPoint {
    id: number;
    name: string;
    code: string;
    type: string;
}

export function useVehicleDetail(id: string) {
    const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [networkPoint, setNetworkPoint] = useState<NetworkPoint | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/vehicles/${id}`);
                if (!res.ok) throw new Error(await res.text());
                const dto: VehicleDto = await res.json();
                setVehicle(dto);

                // Fetch related entities in parallel
                if (dto.providerId) {
                    fetch(`${API_BASE}/providers/${dto.providerId}`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then(setProvider)
                        .catch(() => null);
                }

                if (dto.networkPointId) {
                    fetch(`${API_BASE}/network-points/${dto.networkPointId}`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then(setNetworkPoint)
                        .catch(() => null);
                }
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať vozidlo.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return { vehicle, provider, networkPoint, error, loading };
}