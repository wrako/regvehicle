import { useState } from "react";
import { API_BASE } from "@/constants/api";

export function useVehicleActions() {
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

    const handleDelete = async (id: number): Promise<boolean> => {
        if (!confirm("Naozaj chcete vymazať toto vozidlo?")) return false;
        try {
            const res = await fetch(`${API_BASE}/vehicles/${id}/delete`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(await res.text());
            return true;
        } catch (err) {
            console.error("Failed to delete vehicle", err);
            alert("Nepodarilo sa vymazať vozidlo");
            return false;
        }
    };

    const handleArchive = async (vehicleId: number, status: string, reason: string): Promise<boolean> => {
        try {
            const params = new URLSearchParams();
            params.append(
                "status",
                status === "DOČASNE VYRADENÉ" ? "TEMP_DEREGISTERED" : "DEREGISTERED"
            );
            if (reason) params.append("reason", reason);

            const res = await fetch(
                `${API_BASE}/vehicles/${vehicleId}/archive?${params}`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());
            return true;
        } catch (e) {
            console.error("Archive failed", e);
            alert("Nepodarilo sa archivovať vozidlo");
            return false;
        }
    };

    const openArchiveDialog = (id: number) => {
        setSelectedVehicleId(id);
        setArchiveOpen(true);
    };

    const closeArchiveDialog = () => {
        setArchiveOpen(false);
        setSelectedVehicleId(null);
    };

    return {
        archiveOpen,
        selectedVehicleId,
        handleDelete,
        handleArchive,
        openArchiveDialog,
        closeArchiveDialog,
    };
}