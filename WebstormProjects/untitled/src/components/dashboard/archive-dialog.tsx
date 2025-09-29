import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ArchiveDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    vehicleId: number | null;
    onArchived: () => void;
}

export function ArchiveDialog({ open, onOpenChange, vehicleId, onArchived }: ArchiveDialogProps) {
    const [status, setStatus] = useState<string>("DOČASNE VYRADENÉ");
    const [reason, setReason] = useState<string>("");

    const handleArchive = async () => {
        if (!vehicleId) return;
        try {
            const params = new URLSearchParams();
            params.append("status", status === "DOČASNE VYRADENÉ" ? "TEMP_DEREGISTERED" : "DEREGISTERED");
            if (reason) params.append("reason", reason);

            const res = await fetch(`http://localhost:8080/vehicles/${vehicleId}/archive?${params}`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(await res.text());
            onArchived();
            onOpenChange(false);
        } catch (e) {
            console.error("Archive failed", e);
            alert("Nepodarilo sa archivovať vozidlo");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archivovať vozidlo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nový stav</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Vyberte stav" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DOČASNE VYRADENÉ">Dočasne vyradené</SelectItem>
                                <SelectItem value="VYRADENÉ">Vyradené</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Dôvod (nepovinné)</label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Zadajte dôvod" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Zrušiť
                    </Button>
                    <Button onClick={handleArchive}>Archivovať</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
