import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { format } from "date-fns";
import { VehicleFormValues } from "./vehicleFormSchema";

type Props = {
    control: Control<VehicleFormValues>;
};

export function VehicleDateFields({ control }: Props) {
    return (
        <>
            <FormField
                control={control}
                name="firstRegistrationDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prvá registrácia</FormLabel>
                        <Input
                            type="date"
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) =>
                                field.onChange(
                                    e.target.value ? new Date(e.target.value) : undefined
                                )
                            }
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="lastTechnicalCheckDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Posledná technická kontrola</FormLabel>
                        <Input
                            type="date"
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) =>
                                field.onChange(
                                    e.target.value ? new Date(e.target.value) : undefined
                                )
                            }
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="technicalCheckValidUntil"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Platnosť STK *</FormLabel>
                        <Input
                            type="date"
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) =>
                                field.onChange(
                                    e.target.value ? new Date(e.target.value) : undefined
                                )
                            }
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}