import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { VehicleFormValues } from "./vehicleFormSchema";

type Provider = {
    id: number;
    name?: string;
    companyName?: string;
};

type Props = {
    control: Control<VehicleFormValues>;
    providerOptions: Provider[];
};

export function VehicleStatusFields({ control, providerOptions }: Props) {
    return (
        <>
            <FormField
                control={control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyber status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="aktívne">Aktívne</SelectItem>
                                <SelectItem value="rezerva">Rezerva</SelectItem>
                                <SelectItem value="vyradené">Vyradené</SelectItem>
                                <SelectItem value="dočasne vyradené">
                                    Dočasne vyradené
                                </SelectItem>
                                <SelectItem value="preregistrované">
                                    Preregistrované
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="providerId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Poskytovateľ *</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyber poskytovateľa" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {providerOptions.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}