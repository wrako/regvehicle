"use client";

import { NewNetworkPointForm } from "@/components/dashboard/new-network-point-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function NewNetworkPointPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/network-points">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Back to Network Points</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Create Network Point</h2>
                    <p className="text-muted-foreground">Add a new network point to the system</p>
                </div>
            </div>

            <NewNetworkPointForm />
        </div>
    );
}
