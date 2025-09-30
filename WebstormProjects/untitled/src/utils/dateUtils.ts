import { format } from "date-fns";
import { sk } from "date-fns/locale";

export function formatDate(date: Date | null | undefined, formatString: string = "dd. MMMM yyyy"): string {
  if (!date) return "—";
  return format(date, formatString, { locale: sk });
}

export function formatDateForAPI(date: Date | null | undefined): string | null {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
}

export function toDateOrNull(s?: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return isNaN(dt.getTime()) ? null : dt;
}