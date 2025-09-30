import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (status: string, reason: string) => Promise<void>;
};

export function ArchiveDialog({ open, onOpenChange, onConfirm }: Props) {
    const [archiveStatus, setArchiveStatus] = useState<string>("DOČASNE VYRADENÉ");
    const [reason, setReason] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        try {
            setSubmitting(true);
            await onConfirm(archiveStatus, reason);
            setReason("");
            setArchiveStatus("DOČASNE VYRADENÉ");
        } finally {
            setSubmitting(false);
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
                        <Select value={archiveStatus} onValueChange={setArchiveStatus}>
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
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Zadajte dôvod"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Zrušiť
                    </Button>
                    <Button onClick={handleConfirm} disabled={submitting}>
                        Archivovať
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}