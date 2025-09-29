"use client";

import { NewProviderForm } from "@/components/dashboard/new-provider-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building } from "lucide-react";
import Link from "next/link";

export default function NewProviderPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/providers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Back to Providers</h1>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    <Building className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Register Provider</h2>
                    <p className="text-muted-foreground">Add a new provider to the EMS registry</p>
                </div>
            </div>

            <NewProviderForm />
        </div>
    );
}
