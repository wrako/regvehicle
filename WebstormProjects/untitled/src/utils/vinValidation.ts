export async function vinExists(vin: string): Promise<boolean> {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
    const url = new URL(`${apiBase}/vehicles`);
    url.searchParams.set("page", "0");
    url.searchParams.set("size", "1");
    url.searchParams.set("search", vin);
    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
    return list.some(
        (v: any) => (v?.vinNum || v?.vin || "").toUpperCase() === vin.toUpperCase() && !v?.archived
    );
}