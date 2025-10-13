"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { unarchiveNetworkPoint, getProviders } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
    networkPointId: number | null;
    networkPointName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function UnarchiveNetworkPointDialog({
    networkPointId,
    networkPointName,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const { toast } = useToast();
    const [providerId, setProviderId] = useState<number | null>(null);
    const [providerEndDate, setProviderEndDate] = useState<Date | undefined>(undefined);
    const [npValidTo, setNpValidTo] = useState<Date | undefined>(undefined);
    const [providers, setProviders] = useState<Array<{ id: number; name?: string; companyName?: string }>>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            (async () => {
                try {
                    const list = await getProviders();
                    setProviders(Array.isArray(list) ? list : []);
                } catch (e: any) {
                    toast({
                        title: "Nedá sa načítať poskytovateľov",
                        description: e?.message ?? "Skúste znova neskôr.",
                        variant: "destructive",
                    });
                }
            })();
        }
    }, [open, toast]);

    const handleSubmit = async () => {
        if (!networkPointId || !providerId || !providerEndDate || !npValidTo) {
            toast({
                title: "Chýbajúce údaje",
                description: "Vyberte poskytovateľa a oba dátumy ukončenia",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const providerEndDateStr = format(providerEndDate, "yyyy-MM-dd");
            const npValidToStr = format(npValidTo, "yyyy-MM-dd");
            await unarchiveNetworkPoint(networkPointId, providerId, providerEndDateStr, npValidToStr, true); // Always bypass capacity check
            toast({ title: "Bod siete obnovený" });
            setProviderId(null);
            setProviderEndDate(undefined);
            setNpValidTo(undefined);
            onOpenChange(false);
            onSuccess();
        } catch (e: any) {
            toast({
                title: "Chyba pri obnove",
                description: e?.message ?? "Skúste znova.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Obnoviť bod siete</DialogTitle>
                    <DialogDescription>
                        {networkPointName
                            ? `Obnovte bod siete "${networkPointName}" pridaním poskytovateľa.`
                            : "Obnovte bod siete pridaním poskytovateľa."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Dátum začatia sa automaticky nastaví na dnešný deň.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Poskytovateľ *</label>
                        <Select
                            value={providerId ? String(providerId) : undefined}
                            onValueChange={(val) => setProviderId(val ? Number(val) : null)}
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
                        <label className="text-sm font-medium">Dátum ukončenia registrácie poskytovateľa *</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !providerEndDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {providerEndDate ? format(providerEndDate, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={providerEndDate}
                                    onSelect={setProviderEndDate}
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dátum ukončenia platnosti NetworkPoint *</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !npValidTo && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {npValidTo ? format(npValidTo, "dd.MM.yyyy") : <span>Vyberte dátum</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={npValidTo}
                                    onSelect={setNpValidTo}
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

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Zrušiť
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !providerId || !providerEndDate || !npValidTo}>
                        {submitting ? "Obnovuje sa..." : "Obnoviť"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
