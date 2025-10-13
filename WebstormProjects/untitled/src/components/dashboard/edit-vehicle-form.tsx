"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, CalendarIcon } from "lucide-react";
import { API_BASE } from "@/constants/api";
import { editVehicle } from "@/lib/api";
import { fileNameFromPath } from "@/utils/stringHelpers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDate, toApiDate } from "@/lib/date";

export interface EditInitial {
    licensePlate: string;
    brand: string;
    model: string;
    vinNum: string;
    firstRegistrationDate: Date | null;
    lastTechnicalCheckDate: Date | null;
    technicalCheckValidUntil: Date | null;
    providerId: string;
    providerAssignmentStartDate: Date | null;
    providerAssignmentEndDate: Date | null;
    avlDeviceId: string;
    rdstDeviceId: string;
    filePaths?: string[];
}

export function EditVehicleForm({
                                    vehicleId,
                                    initial,
                                    providers,
                                    // avlDevices,
                                    // rdstDevices,
                                }: {
    vehicleId: string;
    initial: EditInitial;
    providers: { id: number | string; name: string }[];
    // avlDevices: { id: number | string; model: string; communicationId: string }[];
    // rdstDevices: { id: number | string; model: string; rdstId: string }[];
}) {
    const form = useForm<EditInitial>({ defaultValues: initial });
    const { register, handleSubmit, control } = form;
    const { toast } = useToast();

    const onSubmit = async (values: EditInitial) => {
        const payload = {
            ...values,
            firstRegistrationDate: toApiDate(values.firstRegistrationDate ?? undefined),
            lastTechnicalCheckDate: toApiDate(values.lastTechnicalCheckDate ?? undefined),
            technicalCheckValidUntil: toApiDate(values.technicalCheckValidUntil ?? undefined),
            providerAssignmentStartDate: toApiDate(values.providerAssignmentStartDate ?? undefined),
            providerAssignmentEndDate: toApiDate(values.providerAssignmentEndDate ?? undefined),
        };
        try {
            await editVehicle(vehicleId, payload);

            toast({
                title: "Úspech",
                description: "Vozidlo bolo úspešne upravené.",
            });
        } catch (err: any) {
            console.error(err);
            // Show the error message directly in the title for better visibility
            const errorMessage = err?.message ?? "Upravovanie vozidla zlyhalo.";
            toast({
                title: errorMessage.length > 100 ? "Chyba" : errorMessage,
                description: errorMessage.length > 100 ? errorMessage : undefined,
                variant: "destructive",
            });
        }
    };

    const renderDatePicker = (
        name: keyof Pick<EditInitial, "firstRegistrationDate" | "lastTechnicalCheckDate" | "technicalCheckValidUntil" | "providerAssignmentStartDate" | "providerAssignmentEndDate">,
        label: string,
        required = false,
        disabled = false
    ) => (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {label}
                        {required ? " *" : ""}
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={disabled}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? formatDate(field.value) : <span>Vyberte dátum</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={(d) => field.onChange(d ?? null)}
                                disabled={disabled}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        />
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">ŠPZ *</label>
                <Input {...register("licensePlate")} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Značka *</label>
                <Input {...register("brand")} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <Input {...register("model")} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">VIN *</label>
                <Input {...register("vinNum")} />
            </div>

            {renderDatePicker("firstRegistrationDate", "Prvá registrácia")}

            {renderDatePicker("lastTechnicalCheckDate", "Posledná technická kontrola")}

            {renderDatePicker("technicalCheckValidUntil", "Platnosť STK", true)}

            {/*<div>*/}
            {/*    <label className="block text-sm font-medium mb-1">AVL zariadenie</label>*/}
            {/*    <Controller*/}
            {/*        control={control}*/}
            {/*        name="avlDeviceId"*/}
            {/*        render={({ field }) => (*/}
            {/*            <Select onValueChange={field.onChange} defaultValue={field.value}>*/}
            {/*                <SelectTrigger>*/}
            {/*                    <SelectValue placeholder="Vyber AVL" />*/}
            {/*                </SelectTrigger>*/}
            {/*                <SelectContent>*/}
            {/*                    {avlDevices.map((a) => (*/}
            {/*                        <SelectItem key={a.id} value={String(a.id)}>*/}
            {/*                            {a.model} ({a.communicationId})*/}
            {/*                        </SelectItem>*/}
            {/*                    ))}*/}
            {/*                </SelectContent>*/}
            {/*            </Select>*/}
            {/*        )}*/}
            {/*    />*/}
            {/*</div>*/}

            {/*<div>*/}
            {/*    <label className="block text-sm font-medium mb-1">RDST zariadenie</label>*/}
            {/*    <Controller*/}
            {/*        control={control}*/}
            {/*        name="rdstDeviceId"*/}
            {/*        render={({ field }) => (*/}
            {/*            <Select onValueChange={field.onChange} defaultValue={field.value}>*/}
            {/*                <SelectTrigger>*/}
            {/*                    <SelectValue placeholder="Vyber RDST" />*/}
            {/*                </SelectTrigger>*/}
            {/*                <SelectContent>*/}
            {/*                    {rdstDevices.map((r) => (*/}
            {/*                        <SelectItem key={r.id} value={String(r.id)}>*/}
            {/*                            {r.model} ({r.rdstId})*/}
            {/*                        </SelectItem>*/}
            {/*                    ))}*/}
            {/*                </SelectContent>*/}
            {/*            </Select>*/}
            {/*        )}*/}
            {/*    />*/}
            {/*</div>*/}


            <div>
                <label className="block text-sm font-medium mb-1">Poskytovateľ *</label>
                <Controller
                    control={control}
                    name="providerId"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Vyber poskytovateľa" />
                            </SelectTrigger>
                            <SelectContent>
                                {providers.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {renderDatePicker("providerAssignmentStartDate", "Dátum začiatku pridelenia", false, false)}

            {renderDatePicker("providerAssignmentEndDate", "Dátum ukončenia pridelenia", true)}


            {/* Files (read-only like the detail page) */}
            <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Prílohy</label>
                {initial.filePaths && initial.filePaths.length > 0 ? (
                    <ul className="space-y-2">
                        {initial.filePaths.map((p, idx) => (
                            <li key={idx} className="flex items-center">
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <a
                                        href={`${API_BASE}/vehicles/file?path=${encodeURIComponent(
                                            p
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        {fileNameFromPath(p)}
                                    </a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Žiadne prílohy.</p>
                )}
            </div>

            <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline">
                    Zrušiť
                </Button>
                <Button type="submit">Uložiť zmeny</Button>
            </div>
        </form>
    );
}
