import type { Vehicle, Provider, RdstDevice, AvlDevice, NetworkPoint, NetworkPointType } from '@/types';

export const providers: Provider[] = [
    { id: '1', providerId: 'P001', name: 'ZZS Bratislava', address: 'Antolská 11, 851 07 Bratislava' },
    { id: '2', providerId: 'P002', name: 'ZZS Košice', address: 'Ipeľská 1, 040 11 Košice' },
    { id: '3', providerId: 'P003', name: 'FALCK Záchranná a.s.', address: 'Poľná 1, 040 01 Košice' },
    { id: '4', providerId: 'P004', name: 'LSE - Life Star Emergency', address: 'Letisko, 058 01 Poprad' },
];

export const rdstDevices: RdstDevice[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    model: `Motorola MTM${5000 + i}`,
    rdstId: `RDST-ID-${1000 + i}`
}));

export const avlDevices: AvlDevice[] = Array.from({ length: 15 }, (_, i) => ({
    id: (i + 1).toString(),
    model: `Fleetware FW${8000 + i}`,
    communicationId: `COMM-ID-${2000 + i}`,
    additionalAttributes: `SIM: 09xx${100000+i}`
}));

export const networkPoints: NetworkPoint[] = Array.from({ length: 20 }, (_, i) => {
    const types: NetworkPointType[] = ['STATION', 'SUBSTATION', 'HOSPITAL'];
    return {
        id: (i + 1).toString(),
        code: `NP-${String(i+1).padStart(3,'0')}`,
        name: `Network Point ${i+1}`,
        type: types[i % types.length],
        validFrom: new Date(2023, i % 12, (i*2 % 28) + 1),
        validTo: new Date(2025, i % 12, (i*3 % 28) + 1)
    }
});

const vehicleMakes = ['Volkswagen', 'Mercedes-Benz', 'Ford', 'Škoda'];
const vehicleModels = ['Transporter', 'Sprinter', 'Transit', 'Kodiaq'];
const regions = ['BA', 'KE', 'PO', 'NR', 'ZA', 'TT', 'TN', 'BB'];

// Simple pseudo-random number generator for deterministic results
let seed = 12345;
function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

const generateSPZ = () => {
    const region = regions[Math.floor(pseudoRandom() * regions.length)];
    const numbers = String(Math.floor(100 + pseudoRandom() * 900));
    const letters = String.fromCharCode(65 + Math.floor(pseudoRandom() * 26)) + String.fromCharCode(65 + Math.floor(pseudoRandom() * 26));
    return `${region}${numbers}${letters}`;
}

const now = new Date();

export const vehicles: Vehicle[] = Array.from({ length: 50 }, (_, i) => {
    seed = 12345 + i; // Reset seed for each vehicle to ensure consistency
    const make = vehicleMakes[Math.floor(pseudoRandom() * vehicleMakes.length)];
    const model = vehicleModels[Math.floor(pseudoRandom() * vehicleModels.length)];
    const provider = providers[Math.floor(pseudoRandom() * providers.length)].name;
    const stkDate = new Date(now.getFullYear() + Math.floor(pseudoRandom() * 3), now.getMonth(), now.getDate());
    const firstRegistration = new Date(now.getFullYear() - Math.floor(pseudoRandom() * 10), now.getMonth(), now.getDate());

    return {
        id: (i + 1).toString(),
        spz: generateSPZ(),
        make,
        model,
        provider,
        providerLabel: provider,
        networkPoint: networkPoints[Math.floor(pseudoRandom() * networkPoints.length)].id,
        networkPointLabel: networkPoints[Math.floor(pseudoRandom() * networkPoints.length)].name,
        stkDate,
        firstRegistration,
        rdstModel: 'Motorola MTM',
        rdstId: `MTM${1000 + i}`,
        avlModel: 'Fleetware FW',
        avlId: `FW${2000 + i}`,
    };
});
