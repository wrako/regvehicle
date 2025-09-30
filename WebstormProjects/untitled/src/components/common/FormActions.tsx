import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel?: () => void;
  cancelText?: string;
  submitText?: string;
  isEdit?: boolean;
  className?: string;
}

export function FormActions({
  onCancel = () => history.back(),
  cancelText = "Zrušiť",
  submitText,
  isEdit = false,
  className = "md:col-span-2 flex justify-end gap-2 pt-2"
}: FormActionsProps) {
  const defaultSubmitText = isEdit ? "Uložiť zmeny" : "Uložiť";

  return (
    <div className={className}>
      <Button type="button" variant="outline" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button type="submit">
        {submitText || defaultSubmitText}
      </Button>
    </div>
  );
}