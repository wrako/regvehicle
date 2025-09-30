"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    createVehicle,
    editVehicle,
    getProviders,
    getAvlDevices,
    getRdstDevices,
} from "@/lib/api";
import { format } from "date-fns";

// --- ŠPZ regex (BA-123AB or BA123AB) ---
const LICENSE_PLATE_RE =
    /^[A-Z]{2}(?:-\d{3}[A-Z]{2}|\d{3}[A-Z]{2})$/;

// VIN: 17 chars, exclude I O Q
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;

const formSchema = z.object({
    // Keep schema regex so submit still enforces it
    licensePlate: z
        .string()
        .regex(
            LICENSE_PLATE_RE,
            "Neplatný formát ŠPZ (napr. BA-123AB alebo BA123AB)"
        ),
    vinNum: z
        .string()
        .regex(VIN_RE, "VIN musí mať 17 znakov (bez I, O, Q)")
        .transform((s) => s.toUpperCase()),
    brand: z.string().min(1, "Značka je povinná"),
    model: z.string().min(1, "Model je povinný"),
    firstRegistrationDate: z.date().optional(),
    lastTechnicalCheckDate: z.date().optional(),
    technicalCheckValidUntil: z.date({
        required_error: "Platnosť STK je povinná",
    }),
    status: z.enum([
        "aktívne",
        "rezerva",
        "vyradené",
        "dočasne vyradené",
        "preregistrované",
    ]),
    providerId: z.string().min(1, "Vyberte poskytovateľa"),
    // avlDeviceId: z.string().optional(),
    // rdstDeviceId: z.string().optional(),
    // optional multiple file upload (attach after save)
    files: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusMap: Record<FormValues["status"], string> = {
    aktívne: "ACTIVE",
    rezerva: "RESERVE",
    vyradené: "DEREGISTERED",
    "dočasne vyradené": "TEMP_DEREGISTERED",
    preregistrované: "PREREGISTERED",
};

type Props = {
    vehicleId?: string;
    vehicle?: Partial<FormValues>;
    onSuccess?: () => void;
};

export function NewVehicleForm({ vehicleId, vehicle, onSuccess }: Props) {
    const { toast } = useToast();
    const router = useRouter();

    const [providerOptions, setProviderOptions] = useState<any[]>([]);
    const [avlOptions, setAvlOptions] = useState<any[]>([]);
    const [rdstOptions, setRdstOptions] = useState<any[]>([]);

// NEW: confirmation dialog state when backend detects existing VIN (PREREGISTERED)
    const [confirmReRegOpen, setConfirmReRegOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<any | null>(null);
    const [submitting, setSubmitting] = useState(false); // if you already have this, reuse yours


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        // default mode is onSubmit => we’ll do our own debounced check
        defaultValues: vehicle ?? {
            licensePlate: "",
            vinNum: "",
            brand: "",
            model: "",
            firstRegistrationDate: undefined,
            lastTechnicalCheckDate: undefined,
            technicalCheckValidUntil: undefined,
            status: "aktívne",
            providerId: "",
            // avlDeviceId: "",
            // rdstDeviceId: "",
            files: undefined,
        },
    });

    const edit = !!vehicleId;

    // Load reference data
    useEffect(() => {
        (async () => {
            try {
                const [prov, avls, rdsts] = await Promise.all([
                    getProviders(),
                    getAvlDevices(),
                    getRdstDevices(),
                ]);
                setProviderOptions(prov || []);
                setAvlOptions(avls || []);
                setRdstOptions(rdsts || []);
            } catch (e) {
                console.error("Failed to load reference data", e);
            }
        })();
    }, []);

    // --- Debounced (5s) ŠPZ validation after user stops typing ---
    const lp = form.watch("licensePlate");
    useEffect(() => {
        if (lp === undefined) return;
        const handle = setTimeout(() => {
            const probe = (lp || "").toUpperCase().trim();
            if (!probe) {
                form.setError("licensePlate", {
                    type: "manual",
                    message: "Zadajte ŠPZ",
                });
                return;
            }
            if (!LICENSE_PLATE_RE.test(probe)) {
                form.setError("licensePlate", {
                    type: "manual",
                    message:
                        "Neplatný formát ŠPZ (napr. BA-123AB alebo BA123AB)",
                });
            } else {
                // valid: clear error; optionally normalize to uppercase
                form.clearErrors("licensePlate");
                // Keep what user typed or normalize — uncomment if you prefer:
                // form.setValue("licensePlate", probe, { shouldDirty: true });
            }
        }, 1500); // 5 seconds after last keystroke

        return () => clearTimeout(handle);
    }, [lp, form]);

    async function finalizeAfterSave(saved: any) {
        // Upload files after entity exists
        const newId: number | undefined = Number(saved?.id) || Number(saved?.data?.id);
        if (Number.isFinite(newId)) {
            const files = form.getValues("files") as FileList | undefined;
            await uploadVehicleFiles(newId!, files);
        }
        onSuccess ? onSuccess() : router.push("/dashboard");
    }

    async function vinExists(vin: string): Promise<boolean> {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
        const url = new URL(`${apiBase}/vehicles`);
        url.searchParams.set("page", "0");
        url.searchParams.set("size", "1");
        url.searchParams.set("search", vin); // backend search matches VIN/plate
        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) return false;
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
        return list.some(
            (v: any) => (v?.vinNum || v?.vin || "").toUpperCase() === vin.toUpperCase() && !v?.archived
        );
    }


    // Upload files to /vehicles/{id}/files
    async function uploadVehicleFiles(vehicleIdNum: number, files?: FileList | null) {
        if (!files || files.length === 0) return;
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append("files", f));
        const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
        const res = await fetch(`${apiBase}/vehicles/${vehicleIdNum}/files`, {
            method: "POST",
            body: fd,
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || "Upload zlyhal");
        }
    }

    async function onSubmit(v: FormValues) {
        const payload = {
            id: edit ? Number(vehicleId) : undefined,
            licensePlate: (v.licensePlate || "").toUpperCase().trim(),
            vinNum: (v.vinNum || "").toUpperCase().trim(),
            brand: v.brand,
            model: v.model,
            firstRegistrationDate: v.firstRegistrationDate
                ? format(v.firstRegistrationDate, "yyyy-MM-dd")
                : null,
            lastTechnicalCheckDate: v.lastTechnicalCheckDate
                ? format(v.lastTechnicalCheckDate, "yyyy-MM-dd")
                : null,
            technicalCheckValidUntil: format(
                v.technicalCheckValidUntil,
                "yyyy-MM-dd"
            ),
            status: statusMap[v.status],
            providerId: v.providerId
            // avlDevice: v.avlDeviceId ? { id: Number(v.avlDeviceId) } : null,
            // rdstDevice: v.rdstDeviceId ? { id: Number(v.rdstDeviceId) } : null,
        };

        try {
            let saved: any;
            if (edit && vehicleId) {
                saved = await editVehicle(vehicleId, payload);
                toast({ title: "Vozidlo aktualizované" });
            } else {
            // NEW: preflight VIN check — ask user BEFORE creating if VIN exists
            const vin = (payload.vinNum || "").toUpperCase().trim();
            if (vin && (await vinExists(vin))) {
                setPendingPayload(payload);
                setConfirmReRegOpen(true);
                return; // IMPORTANT: stop here; do NOT create yet
            }

            // No duplicate found → proceed normally
            saved = await createVehicle(payload);
            toast({ title: "Vozidlo zaregistrované" });
        }



        // Upload files after entity exists
            const newId: number | undefined =
                Number(vehicleId) || Number(saved?.id) || Number(saved?.data?.id);
            if (Number.isFinite(newId)) {
                const files = form.getValues("files") as FileList | undefined;
                await uploadVehicleFiles(newId!, files);
            }

            onSuccess ? onSuccess() : router.push("/dashboard");
        } catch (e: any) {
            toast({
                title: "Chyba pri ukladaní",
                description: e?.message ?? "Skúste znova neskôr.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <Card className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle>{edit ? "Edit Vehicle" : "Vehicle Information"}</CardTitle>
                        <CardDescription>
                            {edit
                                ? "Update vehicle details"
                                : "Enter the details for the new vehicle registration"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ŠPZ with 5s debounce validation */}
                            <FormField
                                control={form.control}
                                name="licensePlate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ŠPZ *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="BA-123AB"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    // update value
                                                    field.onChange(e.target.value);
                                                    // clear old error immediately when typing
                                                    form.clearErrors("licensePlate");
                                                }}
                                                onBlur={(e) =>
                                                    field.onChange((e.target.value || "").toUpperCase())
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* VIN */}
                            <FormField
                                control={form.control}
                                name="vinNum"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VIN *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="WAUZZZ8V2JA123456"
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={(e) =>
                                                    field.onChange((e.target.value || "").toUpperCase())
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Brand */}
                            <FormField
                                control={form.control}
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

                            {/* Model */}
                            <FormField
                                control={form.control}
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

                            {/* First registration */}
                            <FormField
                                control={form.control}
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

                            {/* Last technical check */}
                            <FormField
                                control={form.control}
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

                            {/* STK valid until */}
                            <FormField
                                control={form.control}
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

                            {/* Status */}
                            <FormField
                                control={form.control}
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

                            {/* Provider */}
                            <FormField
                                control={form.control}
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


                            {/*/!* AVL device *!/*/}
                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="avlDeviceId"*/}
                            {/*    render={({ field }) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>AVL zariadenie</FormLabel>*/}
                            {/*            <Select*/}
                            {/*                onValueChange={field.onChange}*/}
                            {/*                value={field.value || ""}*/}
                            {/*            >*/}
                            {/*                <FormControl>*/}
                            {/*                    <SelectTrigger>*/}
                            {/*                        <SelectValue placeholder="Vyber AVL" />*/}
                            {/*                    </SelectTrigger>*/}
                            {/*                </FormControl>*/}
                            {/*                <SelectContent>*/}
                            {/*                    {avlOptions.map((d) => (*/}
                            {/*                        <SelectItem key={d.id} value={String(d.id)}>*/}
                            {/*                            {d.model} ({d.communicationId})*/}
                            {/*                        </SelectItem>*/}
                            {/*                    ))}*/}
                            {/*                </SelectContent>*/}
                            {/*            </Select>*/}
                            {/*            <FormMessage />*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            {/*/!* RDST device *!/*/}
                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="rdstDeviceId"*/}
                            {/*    render={({ field }) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>RDST zariadenie</FormLabel>*/}
                            {/*            <Select*/}
                            {/*                onValueChange={field.onChange}*/}
                            {/*                value={field.value || ""}*/}
                            {/*            >*/}
                            {/*                <FormControl>*/}
                            {/*                    <SelectTrigger>*/}
                            {/*                        <SelectValue placeholder="Vyber RDST" />*/}
                            {/*                    </SelectTrigger>*/}
                            {/*                </FormControl>*/}
                            {/*                <SelectContent>*/}
                            {/*                    {rdstOptions.map((d) => (*/}
                            {/*                        <SelectItem key={d.id} value={String(d.id)}>*/}
                            {/*                            {d.model} ({d.rdstId})*/}
                            {/*                        </SelectItem>*/}
                            {/*                    ))}*/}
                            {/*                </SelectContent>*/}
                            {/*            </Select>*/}
                            {/*            <FormMessage />*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            {/* NEW: Files to attach (multiple) */}
                            <FormField
                                control={form.control}
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
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Zrušiť
                    </Button>
                    <Button type="submit">
                        {edit ? "Uložiť zmeny" : "Zaregistrovať vozidlo"}
                    </Button>
                </div>
            </form>


            {/* NEW: Confirm re-registration when duplicate VIN is detected */}
            <Dialog open={confirmReRegOpen} onOpenChange={setConfirmReRegOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Preregistrácia VIN</DialogTitle>
                        <DialogDescription>
                            Vozidlo s týmto VIN už existuje. Chcete ho preregistrovať?
                            Pôvodné vozidlo bude archivované a nové bude v stave „preregistrované“.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                // CANCEL: do not create anything
                                setConfirmReRegOpen(false);
                                setPendingPayload(null);
                                setSubmitting(false);
                            }}
                        >
                            Zrušiť
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!pendingPayload) return;
                                try {
                                    setSubmitting(true);
                                    // PROCEED: now actually create
                                    const saved = await createVehicle(pendingPayload);
                                    toast({ title: "Vozidlo zaregistrované" });

                                    // replicate your existing post-save flow (upload files + navigate)
                                    const newId: number | undefined =
                                        Number(saved?.id) || Number(saved?.data?.id);
                                    if (Number.isFinite(newId)) {
                                        const files = form.getValues("files") as FileList | undefined;
                                        await uploadVehicleFiles(newId!, files);
                                    }
                                    onSuccess ? onSuccess() : router.push("/dashboard");
                                } catch (e: any) {
                                    toast({
                                        title: "Chyba pri preregistrácii",
                                        description: e?.message ?? "Skúste znova neskôr.",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setSubmitting(false);
                                    setConfirmReRegOpen(false);
                                    setPendingPayload(null);
                                }
                            }}
                        >
                            Pokračovať
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </Form>
    );
}
