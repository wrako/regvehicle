export type VehicleStatus = 'aktívne' | 'rezerva' | 'vyradené' | 'dočasne vyradené' | 'preregistrované';


export interface Vehicle {
    id: string;
    spz: string;
    make: string;
    model: string;

    provider: string;       // stores ID
    providerLabel: string;  // name from backend

    networkPoint: string;       // ID
    networkPointLabel: string;  // name from backend

    status: VehicleStatus;
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

export type NetworkPointType = 'STATION' | 'SUBSTATION' | 'HOSPITAL';

export type NetworkPoint = {
    id: string;
    code: string;
    name: string;
    type: NetworkPointType;
    validFrom?: Date;
    validTo?: Date;
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
