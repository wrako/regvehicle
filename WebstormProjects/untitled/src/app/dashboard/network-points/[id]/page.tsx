"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getNetworkPoint, archiveNetworkPoint } from "@/lib/api";
import { NetworkPointDto } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Edit, Archive } from "lucide-react";

export default function NetworkPointDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const id = typeof params?.id === "string" ? parseInt(params.id) : 0;

    const [loading, setLoading] = useState(true);
    const [networkPoint, setNetworkPoint] = useState<NetworkPointDto | null>(null);
    const [archiving, setArchiving] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadNetworkPoint = async () => {
            try {
                setLoading(true);
                const data = await getNetworkPoint(id);
                setNetworkPoint(data);
            } catch (error: any) {
                toast({
                    title: "Error loading network point",
                    description: error?.message || "Please try again.",
                    variant: "destructive",
                });
                if (error.message.includes("404")) {
                    router.push("/dashboard/network-points");
                }
            } finally {
                setLoading(false);
            }
        };

        loadNetworkPoint();
    }, [id, toast, router]);

    const handleArchive = async () => {
        if (!window.confirm("Naozaj chcete archivovať tento bod siete?")) return;

        setArchiving(true);
        try {
            await archiveNetworkPoint(id);
            toast({ title: "Bod siete archivovaný" });
            router.push("/dashboard/network-points");
        } catch (error: any) {
            toast({
                title: "Chyba pri archivácii",
                description: error?.message || "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setArchiving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!networkPoint) {
        return <div>Network point not found</div>;
    }

    const currentProvider = networkPoint.providerQueue?.find((reg) => reg.current);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/network-points">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Späť
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{networkPoint.name}</h1>
                        <p className="text-muted-foreground">{networkPoint.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/network-points/${id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Upraviť
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
                        <Archive className="h-4 w-4 mr-2" />
                        {archiving ? "Archivácia..." : "Archivovať"}
                    </Button>
                </div>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Základné informácie</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Kód</label>
                        <p className="text-lg">{networkPoint.code}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Názov</label>
                        <p className="text-lg">{networkPoint.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Typ</label>
                        <p className="text-lg">{networkPoint.type}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Vlastník</label>
                        <p className="text-lg">{networkPoint.providerName || "-"}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Platné od</label>
                        <p className="text-lg">
                            {networkPoint.validFrom ? format(new Date(networkPoint.validFrom), "dd.MM.yyyy") : "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Platné do</label>
                        <p className="text-lg">
                            {networkPoint.validTo ? format(new Date(networkPoint.validTo), "dd.MM.yyyy") : "-"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Current Provider */}
            <Card>
                <CardHeader>
                    <CardTitle>Aktuálny poskytovateľ</CardTitle>
                    <CardDescription>Poskytovateľ aktuálne prevádzkujúci tento bod siete</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentProvider ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Poskytovateľ</label>
                                <p className="text-lg font-medium">{currentProvider.providerName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div>
                                    <Badge variant="default">Aktuálny</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Začiatok registrácie</label>
                                <p className="text-lg">
                                    {currentProvider.registrationStartDate
                                        ? format(new Date(currentProvider.registrationStartDate), "dd.MM.yyyy")
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Koniec registrácie</label>
                                <p className="text-lg">
                                    {currentProvider.registrationEndDate
                                        ? format(new Date(currentProvider.registrationEndDate), "dd.MM.yyyy")
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Žiadny aktuálny poskytovateľ</p>
                    )}
                </CardContent>
            </Card>

            {/* Provider Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Fronta poskytovateľov</CardTitle>
                    <CardDescription>Všetci poskytovatelia priradení k tomuto bodu siete</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pozícia</TableHead>
                                    <TableHead>Poskytovateľ</TableHead>
                                    <TableHead>Začiatok</TableHead>
                                    <TableHead>Koniec</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!networkPoint.providerQueue || networkPoint.providerQueue.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Žiadni poskytovatelia vo fronte
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    networkPoint.providerQueue.map((reg) => (
                                        <TableRow key={reg.id}>
                                            <TableCell>{reg.queuePosition}</TableCell>
                                            <TableCell className="font-medium">{reg.providerName}</TableCell>
                                            <TableCell>
                                                {reg.registrationStartDate
                                                    ? format(new Date(reg.registrationStartDate), "dd.MM.yyyy")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {reg.registrationEndDate
                                                    ? format(new Date(reg.registrationEndDate), "dd.MM.yyyy")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {reg.current ? (
                                                    <Badge variant="default">Aktuálny</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Čakajúci</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
