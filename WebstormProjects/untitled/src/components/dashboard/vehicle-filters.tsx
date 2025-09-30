"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { VehicleStatus } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewVehicleForm } from './new-vehicle-form';
import Link from "next/link";

type Filters = {
    query: string;
    status: VehicleStatus | 'all';
};

interface VehicleFiltersProps {
    onFilterChange: (filters: Filters) => void;
}

const statusOptions: (VehicleStatus | 'all')[] = [
    'all', 'aktívne', 'rezerva', 'vyradené', 'dočasne vyradené', 'preregistrované'
];
const statusLabels: Record<VehicleStatus | 'all', string> = {
    'all': 'Všetky stavy',
    'aktívne': 'Aktívne',
    'rezerva': 'Rezerva',
    'vyradené': 'Vyradené',
    'dočasne vyradené': 'Dočasne vyradené',
    'preregistrované': 'Preregistrované'
}


export default function VehicleFilters({ onFilterChange }: VehicleFiltersProps) {
    const [filters, setFilters] = useState<Filters>({ query: "", status: "all" });

    useEffect(() => {
        const debouncedFilterChange = setTimeout(() => {
            onFilterChange(filters);
        }, 300);

        return () => clearTimeout(debouncedFilterChange);
    }, [filters, onFilterChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, query: e.target.value }));
    };

    const handleStatusChange = (value: VehicleStatus | 'all') => {
        setFilters(prev => ({ ...prev, status: value }));
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Hľadať podľa ŠPZ, poskytovateľa..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[250px] lg:w-[350px]"
                    value={filters.query}
                    onChange={handleInputChange}
                />
            </div>
            <div className="flex items-center gap-4">
                <Select value={filters.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Filtrovať podľa stavu" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button asChild className="w-full md:w-auto">
                    <Link href="/dashboard/vehicles/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nové vozidlo
                    </Link>
                </Button>
            </div>
        </div>
    );
}
