import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { VehicleFormValues } from "./vehicleFormSchema";

type Props = {
    control: Control<VehicleFormValues>;
};

export function VehicleFileUpload({ control }: Props) {
    return (
        <FormField
            control={control}
            name="files"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Priložiť súbory (viac súborov)</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            multiple
                            onChange={(e) => field.onChange(e.target.files)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}