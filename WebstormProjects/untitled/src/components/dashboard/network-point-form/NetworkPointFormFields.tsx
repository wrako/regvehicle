import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/common";
import { Control } from "react-hook-form";
import { NetworkPointFormValues } from "./networkPointSchema";

type Provider = { id: number; name?: string; companyName?: string };

type Props = {
    control: Control<NetworkPointFormValues>;
    providers: Provider[];
};

export function NetworkPointFormFields({ control, providers }: Props) {
    return (
        <>
            <FormField
                control={control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kód *</FormLabel>
                        <FormControl>
                            <Input placeholder="NP-001" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Názov *</FormLabel>
                        <FormControl>
                            <Input placeholder="Stanica 01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Typ *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte typ" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="RLP">RLP</SelectItem>
                                <SelectItem value="RV">RV</SelectItem>
                                <SelectItem value="RZP">RZP</SelectItem>
                                <SelectItem value="OTHER">Iné</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <DatePickerField control={control} name="validFrom" label="Platné od" />
            <DatePickerField control={control} name="validTo" label="Platné do" />

            <FormField
                control={control}
                name="providerId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Poskytovateľ *</FormLabel>
                        <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value ? String(field.value) : undefined}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte poskytovateľa" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {providers.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name || p.companyName || `#${p.id}`}
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