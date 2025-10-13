import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { VehicleFormValues } from "./vehicleFormSchema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";

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

            <FormField
                control={control}
                name="providerAssignmentEndDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dátum ukončenia pridelenia *</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? formatDate(field.value) : <span>Vyberte dátum</span>}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}