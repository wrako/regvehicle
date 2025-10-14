export interface Vehicle {
    id: string;
    spz: string;
    make: string;
    model: string;

    provider: string;       // stores ID
    providerLabel: string;  // name from backend

    networkPoint: string;       // stores ID
    networkPointLabel: string;  // name from backend

    stkDate: Date | null;
    firstRegistration: Date | null;

    rdstModel?: string;
    rdstId?: string;
    avlModel?: string;
    avlId?: string;
}


export type Provider = {
    id: string;
    providerId: string;
    name: string;
    address: string;
}

export type ProviderDto = {
    id?: number;
    providerId: string;
    name: string;
    email?: string;
    address: string;
    networkPoints?: NetworkPointDto[];
}

export type NetworkPointType = 'STATION' | 'SUBSTATION' | 'HOSPITAL';

export type NetworkPoint = {
    id: string;
    code: string;
    name: string;
    type: NetworkPointType;
    validFrom?: Date;
    validTo?: Date;
}

export type ProviderNetworkPointRegistrationDto = {
    id?: number;
    networkPointId?: number;
    providerId?: number;
    providerName?: string;
    registrationStartDate?: string;
    registrationEndDate?: string;
    queuePosition?: number;
    current?: boolean;
}

export type NetworkPointDto = {
    id?: number;
    code: string;
    name: string;
    type: NetworkPointType;
    validFrom?: string;
    validTo?: string;

    // Owner (metadata only)
    providerId?: number;
    providerName?: string;

    // Queue fields for CREATE/EDIT
    queueProviderId?: number;
    providerRegistrationEndDate?: string;

    // Current provider from queue (position 0)
    currentProviderId?: number;
    currentProviderName?: string;

    // Full queue for display
    providerQueue?: ProviderNetworkPointRegistrationDto[];
}

export type RdstDevice = {
    id: string;
    model: string;
    rdstId: string;
}

export type AvlDevice = {
    id: string;
    model: string;
    communicationId: string;
    additionalAttributes?: string;
}

export type VehicleLogDto = {
    id: number;
    vehicleId: number;
    licensePlate?: string;
    vinNum?: string;
    brand?: string;
    model?: string;
    firstRegistrationDate?: string;
    lastTechnicalCheckDate?: string;
    technicalCheckValidUntil?: string;
    providerId?: number;
    providerName?: string;
    author: string;
    timestamp: string;
    timestampFormatted?: string;
    operation: string;
}

export type VehicleLogBlockDto = {
    providerId?: number;
    providerName: string;
    logs: VehicleLogDto[];
}

export type ProviderLogDto = {
    id: number;
    providerId: number;
    name?: string;
    email?: string;
    providerIdField?: string;
    address?: string;
    state?: string;
    archived?: boolean;
    author: string;
    timestamp: string;
    operation: string;
}

export type NetworkPointLogDto = {
    id: number;
    networkPointId: number;
    code?: string;
    name?: string;
    type?: string;
    validFrom?: string;
    validTo?: string;
    providerId?: number;
    providerName?: string;
    archived?: boolean;
    author: string;
    timestamp: string;
    operation: string;
}
