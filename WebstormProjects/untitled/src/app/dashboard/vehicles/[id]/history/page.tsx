"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, History, MoreHorizontal, ChevronDown, X, Check } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, isValid } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE } from "@/constants/api";
import { OperationBadge, type OperationType } from "@/components/common";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { VehicleLogBlockDto, VehicleLogDto } from "@/types";

const TIMEZONE = "Europe/Bratislava";

function formatDateTime(value?: string | Date | null): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || !isValid(date)) return "";

    const datePart = formatDate(date);
    if (!datePart) return "";

    const timePart = format(date, "HH:mm:ss");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

function getDateStringInTimeZone(value: string | Date | null | undefined): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || !isValid(date)) return "";

    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return formatter.format(date);
}

interface MultiSelectProps<T extends string> {
    options: T[];
    selected: T[];
    onSelectedChange: (values: T[]) => void;
    placeholder?: string;
    getLabel?: (value: T) => string;
}

function MultiSelectDropdown<T extends string>({
    options,
    selected,
    onSelectedChange,
    placeholder = "Vyberte",
    getLabel = (value) => value,
}: MultiSelectProps<T>) {
    const [open, setOpen] = useState(false);

    const toggleValue = (value: T) => {
        if (selected.includes(value)) {
            onSelectedChange(selected.filter((item) => item !== value));
        } else {
            onSelectedChange([...selected, value]);
        }
    };

    const clearAll = () => onSelectedChange([]);

    const removeValue = (value: T) => {
        onSelectedChange(selected.filter((item) => item !== value));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-auto min-h-[32px] justify-between px-2 py-1 text-xs"
                >
                    <div className="flex flex-col gap-1 flex-1 items-start max-h-20 overflow-y-auto">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selected.map((value) => (
                                <Badge
                                    key={value}
                                    variant="secondary"
                                    className="flex w-full items-center justify-between gap-2 px-2 py-1 text-xs"
                                >
                                    <span>{getLabel(value)}</span>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="flex items-center justify-center rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-offset-1"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeValue(value);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " " ) {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                removeValue(value);
                                            }
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-2" align="start">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                        {selected.length} z {options.length}
                    </span>
                    {selected.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAll}>
                            Vyčistiť
                        </Button>
                    )}
                </div>
                <div className="max-h-[220px] space-y-1 overflow-y-auto">
                    {options.map((option) => {
                        const isChecked = selected.includes(option);
                        return (
                            <div
                                key={option}
                                className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm",
                                    isChecked ? "bg-accent" : "hover:bg-accent/50"
                                )}
                                onClick={() => toggleValue(option)}
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => toggleValue(option)}
                                    aria-label={`Toggle ${getLabel(option)}`}
                                />
                                <span className="flex-1 text-xs">{getLabel(option)}</span>
                                {isChecked && <Check className="h-4 w-4" />}
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

const OPERATION_VALUES: OperationType[] = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "ARCHIVE",
    "UNARCHIVE",
];

const OPERATION_LABELS: Record<string, string> = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    ARCHIVE: "ARCHIVE",
    UNARCHIVE: "UNARCHIVE",
};

export default function VehicleHistoryPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [logs, setLogs] = useState<VehicleLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastIdRef = useRef<string>("");

    // Filter state
    const [timestampDate, setTimestampDate] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [operationFilters, setOperationFilters] = useState<OperationType[]>([]);
    const [stkDate, setStkDate] = useState("");
    const [brandModelFilter, setBrandModelFilter] = useState("");

    useEffect(() => {
        if (!id) return;

        if (lastIdRef.current === id) {
            return;
        }
        lastIdRef.current = id;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/vehicle-logs/history/${id}/grouped`);

                if (res.status === 404) {
                    setLogs([]);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data: VehicleLogBlockDto[] = await res.json();
                const flatLogs: VehicleLogDto[] = data.flatMap((block) =>
                    (block.logs || []).map((log) => ({
                        ...log,
                        providerId: log.providerId ?? block.providerId,
                        providerName: log.providerName ?? block.providerName,
                    }))
                );
                setLogs(flatLogs);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať históriu vozidla.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const availableOperations = useMemo(() => {
        const seen = new Set<OperationType>();
        logs.forEach((log) => {
            const op = (log.operation || "").toUpperCase() as OperationType;
            if (OPERATION_VALUES.includes(op)) {
                seen.add(op);
            }
        });
        const result = OPERATION_VALUES.filter((op) => seen.has(op));
        return result.length > 0 ? result : OPERATION_VALUES;
    }, [logs]);

    const filteredLogs = useMemo(() => {
        let result = logs;

        if (timestampDate) {
            result = result.filter((log) => getDateStringInTimeZone(log.timestamp) === timestampDate);
        }

        if (authorFilter.trim()) {
            const query = authorFilter.trim().toLowerCase();
            result = result.filter((log) => (log.author || "").toLowerCase().includes(query));
        }

        if (operationFilters.length > 0) {
            result = result.filter((log) => operationFilters.includes((log.operation || "").toUpperCase() as OperationType));
        }

        if (stkDate) {
            result = result.filter((log) => getDateStringInTimeZone(log.technicalCheckValidUntil) === stkDate);
        }

        if (brandModelFilter.trim()) {
            const query = brandModelFilter.trim().toLowerCase();
            result = result.filter((log) => {
                const combined = `${log.brand || ""} ${log.model || ""}`.toLowerCase();
                return combined.includes(query);
            });
        }

        return result;
    }, [logs, timestampDate, authorFilter, operationFilters, stkDate, brandModelFilter]);

    const clearFilters = () => {
        setTimestampDate("");
        setAuthorFilter("");
        setOperationFilters([]);
        setStkDate("");
        setBrandModelFilter("");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="rounded-md bg-primary/10 p-2">
                        <History className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">História vozidla</h1>
                        <p className="text-muted-foreground">
                            Zobrazovanie detailných udalostí a úprav vykonaných na vozidle.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/vehicles/${id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Späť na detail vozidla
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent>
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card>
                    <CardContent>
                        <p>Načítavam históriu...</p>
                    </CardContent>
                </Card>
            ) : logs.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Pre toto vozidlo neboli nájdené žiadne záznamy.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Záznamy o zmenách</CardTitle>
                                <CardDescription>
                                    Detailné záznamy všetkých operácií, ktoré sa udiali na vozidle.
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>
                                    Zobrazuje sa {filteredLogs.length} z {logs.length} záznamov.
                                </span>
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    Vyčistiť filtre
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Dátum a čas</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Operácia</TableHead>
                                        <TableHead className="whitespace-nowrap">Platnosť STK</TableHead>
                                        <TableHead className="hidden md:table-cell">Značka &amp; Model</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Akcie</span>
                                        </TableHead>
                                    </TableRow>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>
                                            <Input
                                                aria-label="Filtrovať podľa dátumu"
                                                type="date"
                                                value={timestampDate}
                                                onChange={(event) => setTimestampDate(event.target.value)}
                                                className="h-8 w-full text-xs"
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <Input
                                                aria-label="Filtrovať podľa autora"
                                                value={authorFilter}
                                                onChange={(event) => setAuthorFilter(event.target.value)}
                                                placeholder="Akýkoľvek autor"
                                                className="h-8 w-full text-xs"
                                            />
                                        </TableHead>
                                        <TableHead className="min-w-[180px]">
                                            <MultiSelectDropdown
                                                options={availableOperations}
                                                selected={operationFilters}
                                                onSelectedChange={setOperationFilters}
                                                placeholder="Akákoľvek operácia"
                                                getLabel={(value) => OPERATION_LABELS[value] || value}
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <Input
                                                aria-label="Filtrovať podľa platnosti STK"
                                                type="date"
                                                value={stkDate}
                                                onChange={(event) => setStkDate(event.target.value)}
                                                className="h-8 w-full text-xs"
                                            />
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            <Input
                                                aria-label="Filtrovať podľa značky alebo modelu"
                                                value={brandModelFilter}
                                                onChange={(event) => setBrandModelFilter(event.target.value)}
                                                placeholder="Akákoľvek značka alebo model"
                                                className="h-8 w-full text-xs"
                                            />
                                        </TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Podľa aktuálnych filtrov sa nenašli žiadne záznamy.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => {
                                            const operation = (log.operation || "").toUpperCase() as OperationType;
                                            return (
                                                <TableRow key={log.id}>
                                                    <TableCell className="whitespace-nowrap font-medium">
                                                        {log.timestampFormatted || formatDateTime(log.timestamp)}
                                                    </TableCell>
                                                    <TableCell className="min-w-[140px]">{log.author || "—"}</TableCell>
                                                    <TableCell className="min-w-[140px]">
                                                        <OperationBadge operation={operation} />
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {formatDate(log.technicalCheckValidUntil) || "—"}
                                                    </TableCell>
                                                    <TableCell className="hidden min-w-[200px] md:table-cell">
                                                        {`${log.brand || "—"}${log.model ? ` ${log.model}` : ""}`}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    aria-haspopup="true"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Otvoriť menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Akcie</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboard/vehicles/${id}/history/${log.id}`}>
                                                                        Viac informácií
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
