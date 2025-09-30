import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    submitting?: boolean;
};

export function VinConfirmationDialog({ open, onOpenChange, onConfirm, onCancel, submitting }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Preregistrácia VIN</DialogTitle>
                    <DialogDescription>
                        Vozidlo s týmto VIN už existuje. Chcete ho preregistrovať?
                        Pôvodné vozidlo bude archivované a nové bude v stave „preregistrované".
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={onCancel} disabled={submitting}>
                        Zrušiť
                    </Button>
                    <Button onClick={onConfirm} disabled={submitting}>
                        Pokračovať
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}