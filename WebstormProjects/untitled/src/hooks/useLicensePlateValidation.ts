import { useEffect } from "react";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";

const LICENSE_PLATE_RE = /^[A-Z]{2}(?:-\d{3}[A-Z]{2}|\d{3}[A-Z]{2})$/;

export function useLicensePlateValidation<T extends FieldValues>(
    form: UseFormReturn<T>,
    watchField: FieldPath<T>
) {
    const lp = form.watch(watchField);

    useEffect(() => {
        if (lp === undefined) return;
        const handle = setTimeout(() => {
            const probe = String(lp || "").toUpperCase().trim();
            if (!probe) {
                form.setError(watchField, { type: "manual", message: "Zadajte ŠPZ" });
                return;
            }
            if (!LICENSE_PLATE_RE.test(probe)) {
                form.setError(watchField, {
                    type: "manual",
                    message: "Neplatný formát ŠPZ (napr. BA-123AB alebo BA123AB)",
                });
            } else {
                form.clearErrors(watchField);
            }
        }, 1500);
        return () => clearTimeout(handle);
    }, [lp, form, watchField]);
}