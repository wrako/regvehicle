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

                {/* Owner removed - system auto-sets based on current provider in queue */}
                {/* validFrom removed - managed via queue start dates */}
                <DatePickerField
                    control={form.control}
                    name="validTo"
                    label="Valid To *"
                />

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
