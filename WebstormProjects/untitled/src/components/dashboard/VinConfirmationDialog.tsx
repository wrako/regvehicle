import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VinConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function VinConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  submitting = false
}: VinConfirmationDialogProps) {
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
          <Button variant="ghost" onClick={onCancel}>
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