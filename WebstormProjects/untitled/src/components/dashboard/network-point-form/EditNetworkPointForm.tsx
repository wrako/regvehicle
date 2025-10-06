import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { DatePickerField } from "@/components/common";
import type { NetworkPointEditFormData } from "@/utils/networkPointSchema";

type NetworkPointType = "RLP" | "RV" | "RZP" | "OTHER";

type Props = {
    form: UseFormReturn<NetworkPointEditFormData>;
    providers: any[];
    submitting: boolean;
    onSubmit: (data: NetworkPointEditFormData) => void;
};

const typeLabels: Record<NetworkPointType, string> = {
    RLP: "RLP",
    RV: "RV",
    RZP: "RZP",
    OTHER: "Other",
};

export function EditNetworkPointForm({ form, providers, submitting, onSubmit }: Props) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter network point code" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter network point name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select network point type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(typeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {providers.map((provider) => (
                                        <SelectItem key={provider.id} value={provider.id.toString()}>
                                            {provider.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePickerField
                        control={form.control}
                        name="validFrom"
                        label="Valid From (Optional)"
                    />
                    <DatePickerField
                        control={form.control}
                        name="validTo"
                        label="Valid To (Optional)"
                    />
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Network Point"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/network-points">Cancel</Link>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
