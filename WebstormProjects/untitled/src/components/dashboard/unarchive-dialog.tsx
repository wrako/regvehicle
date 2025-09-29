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
import * as React from "react";

type BackendStatus = "ACTIVE" | "RESERVE" | "PREREGISTERED";

interface UnarchiveDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    vehicleId: string | null;
    onUnarchived: (vehicleId: string) => void;
}

const API_BASE = "http://localhost:8080";

export function UnarchiveDialog({
                                    open,
                                    onOpenChange,
                                    vehicleId,
                                    onUnarchived,
                                }: UnarchiveDialogProps) {
    const [status, setStatus] = React.useState<BackendStatus>("ACTIVE");
    const [submitting, setSubmitting] = React.useState(false);

    const handleApply = async () => {
        if (!vehicleId) return;
        try {
            setSubmitting(true);
            const params = new URLSearchParams();
            params.append("status", status);
            const res = await fetch(
                `${API_BASE}/vehicles/${vehicleId}/unarchive?${params.toString()}`,
                { method: "POST" }
            );
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
