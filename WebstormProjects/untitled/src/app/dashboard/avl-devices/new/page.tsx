"use client";

import { NewAvlDeviceForm } from "@/components/dashboard/new-avl-device-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SatelliteDish } from "lucide-react";
import Link from "next/link";

export default function NewAvlDevicePage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/avl-devices">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Back to AVL Devices</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <SatelliteDish className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Register AVL Device</h2>
                    <p className="text-muted-foreground">Add a new AVL device to the system</p>
                </div>
            </div>

            <NewAvlDeviceForm />
        </div>
    );
}
