export async function uploadVehicleFiles(vehicleIdNum: number, files?: FileList | null): Promise<void> {
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