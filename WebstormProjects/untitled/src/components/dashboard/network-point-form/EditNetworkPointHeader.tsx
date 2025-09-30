import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";

export function EditNetworkPointHeader() {
    return (
        <>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/network-points">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Edit Network Point</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Edit Network Point</h2>
                    <p className="text-muted-foreground">Update network point information</p>
                </div>
            </div>
        </>
    );
}