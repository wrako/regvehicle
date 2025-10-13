"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, ArrowUp, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProviderNetworkPointRegistrationDto } from "@/types";
import { addProviderToQueue, removeFromQueue, promoteNext, updateRegistrationDates } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
    networkPointId: number;
    queue: ProviderNetworkPointRegistrationDto[];
    providers: Array<{ id: number; name?: string; companyName?: string }>;
    onUpdate: () => void;
};

export function ProviderQueue({ networkPointId, queue, providers, onUpdate }: Props) {
    const { toast } = useToast();
    const [newProviderId, setNewProviderId] = useState<number | null>(null);
    const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined);
    const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined);

    const handleAddToQueue = async () => {
        if (!newProviderId || !newEndDate) {
            toast({
                title: "Chýbajúce údaje",
                description: "Vyberte poskytovateľa a dátum ukončenia",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const endDateStr = format(newEndDate, "yyyy-MM-dd");
            await addProviderToQueue(networkPointId, newProviderId, endDateStr);
            toast({ title: "Poskytovateľ pridaný do fronty" });
            setNewProviderId(null);
            setNewEndDate(undefined);
            onUpdate();
        } catch (e: any) {
            toast({
                title: "Chyba pri pridávaní",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (registrationId: number) => {
        setLoading(true);
        try {
            await removeFromQueue(networkPointId, registrationId);
            toast({ title: "Poskytovateľ odstránený z fronty" });
            onUpdate();
        } catch (e: any) {
            toast({
                title: "Chyba pri odstraňovaní",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteNext = async () => {
        setLoading(true);
        try {
            await promoteNext(networkPointId);
            toast({ title: "Ďalší poskytovateľ povýšený na aktuálneho" });
            onUpdate();
        } catch (e: any) {
            toast({
                title: "Chyba pri povýšení",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (reg: ProviderNetworkPointRegistrationDto) => {
        setEditingId(reg.id!);
        setEditStartDate(reg.registrationStartDate ? new Date(reg.registrationStartDate) : undefined);
        setEditEndDate(reg.registrationEndDate ? new Date(reg.registrationEndDate) : undefined);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditStartDate(undefined);
        setEditEndDate(undefined);
    };

    const saveEdit = async (registrationId: number) => {
        setLoading(true);
        try {
            const startDateStr = editStartDate ? format(editStartDate, "yyyy-MM-dd") : undefined;
            const endDateStr = editEndDate ? format(editEndDate, "yyyy-MM-dd") : undefined;
            await updateRegistrationDates(networkPointId, registrationId, startDateStr, endDateStr);
            toast({ title: "Dátumy aktualizované" });
            setEditingId(null);
            setEditStartDate(undefined);
            setEditEndDate(undefined);
            onUpdate();
        } catch (e: any) {
            toast({
                title: "Chyba pri aktualizácii",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fronta poskytovateľov</CardTitle>
                <CardDescription>Spravujte poskytovateľov priradených k tomuto bodu siete. Kliknite na ikonu úprav pre zmenu dátumov.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Queue Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pozícia</TableHead>
                                <TableHead>Poskytovateľ</TableHead>
                                <TableHead>Začiatok</TableHead>
                                <TableHead>Koniec</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Akcie</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Žiadni poskytovatelia vo fronte
                                    </TableCell>
                                </TableRow>
                            ) : (
                                queue.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell>{reg.queuePosition}</TableCell>
                                        <TableCell className="font-medium">{reg.providerName}</TableCell>

                                        {/* Start Date */}
                                        <TableCell>
                                            {editingId === reg.id ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !editStartDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3 w-3" />
                                                            {editStartDate ? format(editStartDate, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={editStartDate}
                                                            onSelect={setEditStartDate}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                reg.registrationStartDate
                                                    ? format(new Date(reg.registrationStartDate), "dd.MM.yyyy")
                                                    : "-"
                                            )}
                                        </TableCell>

                                        {/* End Date */}
                                        <TableCell>
                                            {editingId === reg.id ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !editEndDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3 w-3" />
                                                            {editEndDate ? format(editEndDate, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={editEndDate}
                                                            onSelect={setEditEndDate}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                reg.registrationEndDate
                                                    ? format(new Date(reg.registrationEndDate), "dd.MM.yyyy")
                                                    : "-"
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {reg.current ? (
                                                <Badge variant="default">Aktuálny</Badge>
                                            ) : (
                                                <Badge variant="secondary">Čakajúci</Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right space-x-1">
                                            {editingId === reg.id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => saveEdit(reg.id!)}
                                                        disabled={loading}
                                                    >
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={cancelEdit}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEdit(reg)}
                                                        disabled={loading}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemove(reg.id!)}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Promote Next Button */}
                {queue.length > 1 && (
                    <Button onClick={handlePromoteNext} disabled={loading} variant="outline" className="w-full">
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Povýšiť ďalšieho poskytovateľa
                    </Button>
                )}

                {/* Add to Queue */}
                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Pridať poskytovateľa do fronty</h3>
                    <p className="text-xs text-muted-foreground">Dátum začatia sa automaticky nastaví na dnešný deň.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Poskytovateľ</label>
                            <Select
                                value={newProviderId ? String(newProviderId) : undefined}
                                onValueChange={(val) => setNewProviderId(val ? Number(val) : null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte poskytovateľa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name || p.companyName || `#${p.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dátum ukončenia</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !newEndDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newEndDate ? format(newEndDate, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={newEndDate}
                                        onSelect={setNewEndDate}
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date <= today;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Button onClick={handleAddToQueue} disabled={loading || !newProviderId || !newEndDate}>
                        Pridať do fronty
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
