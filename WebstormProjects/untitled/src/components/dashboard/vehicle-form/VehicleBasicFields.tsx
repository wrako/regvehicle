import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, UseFormClearErrors } from "react-hook-form";
import { VehicleFormValues } from "./vehicleFormSchema";

type Props = {
    control: Control<VehicleFormValues>;
    clearErrors: UseFormClearErrors<VehicleFormValues>;
};

export function VehicleBasicFields({ control, clearErrors }: Props) {
    return (
        <>
            <FormField
                control={control}
                name="licensePlate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>ŠPZ *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="BA-123AB"
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    clearErrors("licensePlate");
                                }}
                                onBlur={(e) => field.onChange((e.target.value || "").toUpperCase())}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="vinNum"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>VIN *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="WAUZZZ8V2JA123456"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={(e) => field.onChange((e.target.value || "").toUpperCase())}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="brand"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Značka *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Mercedes-Benz" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="model"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Sprinter" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}