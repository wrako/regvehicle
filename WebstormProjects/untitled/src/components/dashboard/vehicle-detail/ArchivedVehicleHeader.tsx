import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car } from "lucide-react";

type Props = {
    licensePlate: string;
};

export function ArchivedVehicleHeader({ licensePlate }: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/vehicles/archived/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Späť na zoznam vozidiel</h1>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <Car className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Detail vozidla: {licensePlate}</h2>
                    <p className="text-muted-foreground">Kompletné informácie o vozidle</p>
                </div>
            </div>
        </>
    );
}