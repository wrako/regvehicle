"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, History, X, ChevronDown, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { OperationBadge, type OperationType } from "@/components/common";
import { formatDate } from "@/lib/date";
import { ProviderLogDto, type ProviderState } from "@/types";
import { getProviderHistory, getProviderVehicleCount, getProviderNetworkPointCount } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDateTime(value?: string | Date | null): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || !isValid(date)) return "";

    const datePart = formatDate(date);
    if (!datePart) return "";

    const timePart = format(date, "HH:mm");
    return timePart ? `${datePart} ${timePart}` : datePart;
}

// Helper to get local calendar date (YYYY-MM-DD) for comparison
function getLocalDateString(date: Date | string | null | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (!isValid(d)) return "";

    // Get local date components
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const OPERATION_TYPES: OperationType[] = ["CREATE", "UPDATE", "DELETE", "ARCHIVE", "UNARCHIVE"];
const PROVIDER_STATES: ProviderState[] = ["ACTIVE", "DISABLED", "UNBALANCED"];

type ArchivedFilter = "any" | "yes" | "no";

// Multi-Select Dropdown Component
interface MultiSelectProps<T extends string> {
    options: T[];
    selected: T[];
    onSelectedChange: (selected: T[]) => void;
    placeholder?: string;
    getLabel?: (value: T) => string;
}

function MultiSelectDropdown<T extends string>({
    options,
    selected,
    onSelectedChange,
    placeholder = "Select...",
    getLabel = (v) => v,
}: MultiSelectProps<T>) {
    const [open, setOpen] = useState(false);

    const handleToggle = (value: T) => {
        const newSelected = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
        onSelectedChange(newSelected);
    };

    const handleClear = () => {
        onSelectedChange([]);
    };

    const handleRemove = (value: T) => {
        onSelectedChange(selected.filter((v) => v !== value));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-auto min-h-[28px] justify-between text-xs px-2 py-1"
                >
                    <div className="flex flex-col gap-1 flex-1 items-start">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selected.map((value) => (
                                <Badge
                                    key={value}
                                    variant="secondary"
                                    className="text-xs px-1 py-0 h-5"
                                >
                                    {getLabel(value)}
                                    <span
                                        className="ml-1 hover:text-destructive cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(value);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            {selected.length} selected
                        </span>
                        {selected.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={handleClear}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {options.map((option) => (
                            <div
                                key={option}
                                className={cn(
                                    "flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent",
                                    selected.includes(option) && "bg-accent"
                                )}
                                onClick={() => handleToggle(option)}
                            >
                                <Checkbox
                                    checked={selected.includes(option)}
                                    onCheckedChange={() => handleToggle(option)}
                                />
                                <span className="text-sm flex-1">{getLabel(option)}</span>
                                {selected.includes(option) && (
                                    <Check className="h-4 w-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function ProviderHistoryPage() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [logs, setLogs] = useState<ProviderLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vehicleCount, setVehicleCount] = useState<number>(0);
    const [networkPointCount, setNetworkPointCount] = useState<number>(0);
    const lastIdRef = useRef<string>("");

    // Typed filter state
    const [timestampDate, setTimestampDate] = useState(""); // Single date (YYYY-MM-DD)
    const [authorFilter, setAuthorFilter] = useState("");
    const [operationFilters, setOperationFilters] = useState<OperationType[]>([]); // MULTI-SELECT
    const [nameFilter, setNameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [addressFilter, setAddressFilter] = useState("");
    const [stateFilters, setStateFilters] = useState<ProviderState[]>([]); // MULTI-SELECT
    const [archivedFilter, setArchivedFilter] = useState<ArchivedFilter>("any");

    useEffect(() => {
        if (!id) return;

        // StrictMode guard: prevent duplicate calls
        if (lastIdRef.current === id) {
            return;
        }
        lastIdRef.current = id;

        (async () => {
            try {
                const [data, vCount, npCount] = await Promise.all([
                    getProviderHistory(id),
                    getProviderVehicleCount(id),
                    getProviderNetworkPointCount(id),
                ]);
                setLogs(data);
                setVehicleCount(vCount);
                setNetworkPointCount(npCount);
            } catch (e: any) {
                console.error(e);
                setError("Nepodarilo sa načítať históriu poskytovateľa.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Compute filtered logs with typed filters
    const filteredLogs = useMemo(() => {
        let result = logs;

        // Timestamp - Single date filter (match calendar day)
        if (timestampDate) {
            result = result.filter((log) => {
                const logDateStr = getLocalDateString(log.timestamp);
                return logDateStr === timestampDate;
            });
        }

        // Author filter (case-insensitive substring)
        if (authorFilter.trim()) {
            const query = authorFilter.toLowerCase();
            result = result.filter((log) =>
                (log.author || "").toLowerCase().includes(query)
            );
        }

        // Operation filter (multi-select with IN logic)
        if (operationFilters.length > 0) {
            result = result.filter((log) =>
                operationFilters.includes(log.operation as OperationType)
            );
        }

        // Name filter (case-insensitive substring)
        if (nameFilter.trim()) {
            const query = nameFilter.toLowerCase();
            result = result.filter((log) =>
                (log.name || "").toLowerCase().includes(query)
            );
        }

        // Email filter (case-insensitive substring)
        if (emailFilter.trim()) {
            const query = emailFilter.toLowerCase();
            result = result.filter((log) =>
                (log.email || "").toLowerCase().includes(query)
            );
        }

        // Address filter (case-insensitive substring)
        if (addressFilter.trim()) {
            const query = addressFilter.toLowerCase();
            result = result.filter((log) =>
                (log.address || "").toLowerCase().includes(query)
            );
        }

        // State filter (multi-select with IN logic)
        if (stateFilters.length > 0) {
            result = result.filter((log) => log.state && stateFilters.includes(log.state));
        }

        // Archived filter (tri-state: any/yes/no)
        if (archivedFilter !== "any") {
            const filterValue = archivedFilter === "yes";
            result = result.filter((log) => log.archived === filterValue);
        }

        return result;
    }, [
        logs,
        timestampDate,
        authorFilter,
        operationFilters,
        nameFilter,
        emailFilter,
        addressFilter,
        stateFilters,
        archivedFilter,
    ]);

    const handleClearAllFilters = () => {
        setTimestampDate("");
        setAuthorFilter("");
        setOperationFilters([]);
        setNameFilter("");
        setEmailFilter("");
        setAddressFilter("");
        setStateFilters([]);
        setArchivedFilter("any");
    };

    const hasActiveFilters =
        timestampDate !== "" ||
        authorFilter.trim() !== "" ||
        operationFilters.length > 0 ||
        nameFilter.trim() !== "" ||
        emailFilter.trim() !== "" ||
        addressFilter.trim() !== "" ||
        stateFilters.length > 0 ||
        archivedFilter !== "any";

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <History className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">História poskytovateľa</h1>
                        <p className="text-muted-foreground">
                            Zobrazovanie detailných udalostí a úprav vykonaných na poskytovateľovi.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Späť na zoznam
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <p>Načítavam históriu...</p>
                    </CardContent>
                </Card>
            ) : logs.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Záznamy o zmenách</CardTitle>
                        <CardDescription>
                            Pre tohto poskytovateľa neboli nájdené žiadne záznamy.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Záznamy o zmenách</CardTitle>
                                <CardDescription>
                                    Zobrazuje sa {filteredLogs.length} z {logs.length}{" "}
                                    {logs.length === 1 ? "záznamu" : logs.length < 5 ? "záznamov" : "záznamov"}
                                </CardDescription>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearAllFilters}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Vyčistiť filtre
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {/* Column Headers */}
                                    <TableRow>
                                        <TableHead>Dátum a čas</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Operácia</TableHead>
                                        <TableHead>Názov</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden lg:table-cell">Adresa</TableHead>
                                        <TableHead className="hidden xl:table-cell">Stav</TableHead>
                                        <TableHead className="hidden xl:table-cell">Vozidlá</TableHead>
                                        <TableHead className="hidden xl:table-cell">Sieťové body</TableHead>
                                        <TableHead className="hidden xl:table-cell">Archivované</TableHead>
                                    </TableRow>
                                    {/* Typed Filter Row - Always Visible */}
                                    <TableRow className="bg-muted/50">
                                        {/* Dátum a čas - Single Date */}
                                        <TableHead className="py-2">
                                            <Input
                                                type="date"
                                                value={timestampDate}
                                                onChange={(e) => setTimestampDate(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                        </TableHead>
                                        {/* Autor - Text */}
                                        <TableHead className="py-2">
                                            <Input
                                                type="text"
                                                placeholder="Filter..."
                                                value={authorFilter}
                                                onChange={(e) => setAuthorFilter(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                        </TableHead>
                                        {/* Operácia - MULTI-SELECT DROPDOWN */}
                                        <TableHead className="py-2">
                                            <MultiSelectDropdown
                                                options={OPERATION_TYPES}
                                                selected={operationFilters}
                                                onSelectedChange={setOperationFilters}
                                                placeholder="Any"
                                            />
                                        </TableHead>
                                        {/* Názov - Text */}
                                        <TableHead className="py-2">
                                            <Input
                                                type="text"
                                                placeholder="Filter..."
                                                value={nameFilter}
                                                onChange={(e) => setNameFilter(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                        </TableHead>
                                        {/* Email - Text */}
                                        <TableHead className="hidden md:table-cell py-2">
                                            <Input
                                                type="text"
                                                placeholder="Filter..."
                                                value={emailFilter}
                                                onChange={(e) => setEmailFilter(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                        </TableHead>
                                        {/* Adresa - Text */}
                                        <TableHead className="hidden lg:table-cell py-2">
                                            <Input
                                                type="text"
                                                placeholder="Filter..."
                                                value={addressFilter}
                                                onChange={(e) => setAddressFilter(e.target.value)}
                                                className="h-7 text-xs"
                                            />
                                        </TableHead>
                                        {/* Stav - MULTI-SELECT DROPDOWN */}
                                        <TableHead className="hidden xl:table-cell py-2">
                                            <MultiSelectDropdown
                                                options={PROVIDER_STATES}
                                                selected={stateFilters}
                                                onSelectedChange={setStateFilters}
                                                placeholder="Any"
                                            />
                                        </TableHead>
                                        {/* Vozidlá - No filter (shows current count) */}
                                        <TableHead className="hidden xl:table-cell py-2">
                                        </TableHead>
                                        {/* Sieťové body - No filter (shows current count) */}
                                        <TableHead className="hidden xl:table-cell py-2">
                                        </TableHead>
                                        {/* Archivované - Tri-state */}
                                        <TableHead className="hidden xl:table-cell py-2">
                                            <Select
                                                value={archivedFilter}
                                                onValueChange={(value) =>
                                                    setArchivedFilter(value as ArchivedFilter)
                                                }
                                            >
                                                <SelectTrigger className="h-7 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any</SelectItem>
                                                    <SelectItem value="yes">Áno</SelectItem>
                                                    <SelectItem value="no">Nie</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        Podľa aktuálnych filtrov sa nenašli žiadne záznamy.
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Skúste upraviť filtre alebo ich vyčistiť.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => window.location.href = `/dashboard/providers/${id}/history/${log.id}`}
                                            >
                                                <TableCell className="font-medium">
                                                    {formatDateTime(log.timestamp)}
                                                </TableCell>
                                                <TableCell>{log.author}</TableCell>
                                                <TableCell>
                                                    <OperationBadge operation={log.operation as OperationType} />
                                                </TableCell>
                                                <TableCell>{log.name || "-"}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {log.email || "-"}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {log.address || "-"}
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {log.state ? (
                                                        <Badge variant={
                                                            log.state === "ACTIVE" ? "default" :
                                                            log.state === "DISABLED" ? "secondary" :
                                                            log.state === "UNBALANCED" ? "destructive" :
                                                            "outline"
                                                        }>
                                                            {log.state}
                                                        </Badge>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {vehicleCount}
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {networkPointCount}
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {log.archived ? (
                                                        <Badge variant="outline">Áno</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Nie</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
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
