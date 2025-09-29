"use client";

import { NewRdstDeviceForm } from "@/components/dashboard/new-rdst-device-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RadioTower } from "lucide-react";
import Link from "next/link";

export default function NewRdstDevicePage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/rdst-devices">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Back to RDST Devices</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <RadioTower className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Register RDST Device</h2>
                    <p className="text-muted-foreground">Add a new RDST device to the system</p>
                </div>
            </div>

            <NewRdstDeviceForm />
        </div>
    );
}
