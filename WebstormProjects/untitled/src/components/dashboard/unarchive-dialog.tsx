"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, toApiDate } from "@/lib/date";
import * as React from "react";
import {toast} from "@/hooks/use-toast";
import { API_BASE } from "@/constants/api";

type BackendStatus = "ACTIVE" | "RESERVE" | "PREREGISTERED";

interface UnarchiveDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    vehicleId: string | null;
    onUnarchived: (vehicleId: string) => void;
}

export function UnarchiveDialog({
                                    open,
                                    onOpenChange,
                                    vehicleId,
                                    onUnarchived,
                                }: UnarchiveDialogProps) {
    const [status, setStatus] = React.useState<BackendStatus>("ACTIVE");
    const [providerId, setProviderId] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
    const [providers, setProviders] = React.useState<Array<{id: number; name: string}>>([]);
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            fetch(`${API_BASE}/providers`)
                .then(res => res.json())
                .then(data => setProviders(data))
                .catch(err => console.error("Failed to load providers", err));
        }
    }, [open]);

    const handleApply = async () => {
        if (!vehicleId) return;

        if (!providerId) {
            toast({
                title: "Chýba poskytovateľ",
                description: "Vyberte poskytovateľa pre obnovenie vozidla",
                variant: "destructive",
            });
            return;
        }

        if (!endDate) {
            toast({
                title: "Chýba dátum ukončenia",
                description: "Vyberte dátum ukončenia pridelenia",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            const params = new URLSearchParams();
            params.append("status", status);
            params.append("providerId", providerId);
            params.append("providerAssignmentEndDate", toApiDate(endDate) || "");

            const res = await fetch(
                `${API_BASE}/vehicles/${vehicleId}/unarchive?${params.toString()}`,
                { method: "POST" }
            );

            // NEW: explicit 409 handling (VIN conflict on unarchive)
            if (res.status === 409) {
                const txt = await res.text().catch(() => "");
                toast({
                    title: "Nedá sa obnoviť vozidlo",
                    description: "Existuje iné aktívne vozidlo s rovnakým VIN.",
                    variant: "destructive",
                });
                setSubmitting(false);
                return; // do not close dialog, let user resolve it
            }

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || "Unarchive failed");
            }
            onUnarchived(vehicleId);
            onOpenChange(false);


        } catch (err) {
            console.error("Failed to unarchive vehicle:", err);
            alert("Nepodarilo sa obnoviť vozidlo.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => (!submitting ? onOpenChange(v) : null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Obnoviť vozidlo</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="grid gap-2">
                        <label htmlFor="vehicle-status" className="text-sm font-medium">
                            Nový stav
                        </label>
                        <Select
                            value={status}
                            onValueChange={(v: BackendStatus) => setStatus(v)}
                        >
                            <SelectTrigger id="vehicle-status">
                                <SelectValue placeholder="Vyberte stav" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Aktívne</SelectItem>
                                <SelectItem value="RESERVE">Rezerva</SelectItem>
                                <SelectItem value="PREREGISTERED">Preregistrované</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="provider" className="text-sm font-medium">
                            Poskytovateľ *
                        </label>
                        <Select value={providerId} onValueChange={setProviderId}>
                            <SelectTrigger id="provider">
                                <SelectValue placeholder="Vyberte poskytovateľa" />
                            </SelectTrigger>
                            <SelectContent>
                                {providers.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Dátum ukončenia pridelenia *
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? formatDate(endDate) : <span>Vyberte dátum</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
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

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Zrušiť
                    </Button>
                    <Button onClick={handleApply} disabled={submitting}>
                        {submitting ? "Ukladám..." : "Použiť a obnoviť"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
