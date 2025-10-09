import { useEffect, useState, useRef } from "react";
import { API_BASE } from "@/constants/api";
import { cancellableFetch } from "@/utils/fetchUtils";
import { fromApiDate } from "@/lib/date";

interface VehicleDto {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    firstRegistrationDate?: Date | null;
    lastTechnicalCheckDate?: Date | null;
    technicalCheckValidUntil?: Date | null;
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
    providerAssignmentStartDate?: Date | null;
    providerAssignmentEndDate?: Date | null;
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

export function useArchivedVehicleDetail(id: string) {
    const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [networkPoint, setNetworkPoint] = useState<NetworkPoint | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const lastIdRef = useRef<string>("");

    useEffect(() => {
        if (!id) return;

        // StrictMode guard: prevent duplicate calls
        if (lastIdRef.current === id) {
            return;
        }
        lastIdRef.current = id;

        (async () => {
            try {
                setLoading(true);
                const rawDto = await cancellableFetch(
                    `${API_BASE}/vehicles/archived/${id}`,
                    {},
                    `archived-vehicle-detail-${id}`
                );

                // Convert date strings to Date objects
                const dto: VehicleDto = {
                    ...rawDto,
                    firstRegistrationDate: fromApiDate(rawDto.firstRegistrationDate),
                    lastTechnicalCheckDate: fromApiDate(rawDto.lastTechnicalCheckDate),
                    technicalCheckValidUntil: fromApiDate(rawDto.technicalCheckValidUntil),
                    providerAssignmentStartDate: fromApiDate(rawDto.providerAssignmentStartDate),
                    providerAssignmentEndDate: fromApiDate(rawDto.providerAssignmentEndDate),
                };

                setVehicle(dto);

                // Fetch related entities in parallel
                const promises = [];

                if (dto.providerId) {
                    promises.push(
                        cancellableFetch<Provider>(
                            `${API_BASE}/providers/${dto.providerId}`,
                            {},
                            `provider-${dto.providerId}`
                        )
                            .then(setProvider)
                            .catch(() => setProvider(null))
                    );
                }

                if (dto.networkPointId) {
                    promises.push(
                        cancellableFetch<NetworkPoint>(
                            `${API_BASE}/network-points/${dto.networkPointId}`,
                            {},
                            `network-point-${dto.networkPointId}`
                        )
                            .then(setNetworkPoint)
                            .catch(() => setNetworkPoint(null))
                    );
                }

                await Promise.all(promises);
            } catch (e: any) {
                // Ignore abort errors
                if (e.name === 'AbortError') return;

                console.error(e);
                setError("Nepodarilo sa načítať vozidlo.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return { vehicle, provider, networkPoint, error, loading };
}
