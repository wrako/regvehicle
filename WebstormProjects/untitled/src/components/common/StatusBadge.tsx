import { Badge } from "@/components/ui/badge";
import type { VehicleStatus } from "@/types";

interface StatusBadgeProps {
  status: VehicleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusLabels: Record<VehicleStatus, string> = {
      aktívne: "Aktívne",
      rezerva: "Rezerva",
      vyradené: "Vyradené",
      "dočasne vyradené": "Dočasne vyradené",
      preregistrované: "Preregistrované",
  };

  const variantMap: Record<
      VehicleStatus,
      "default" | "secondary" | "destructive" | "outline"
  > = {
      aktívne: "default",
      rezerva: "secondary",
      vyradené: "destructive",
      "dočasne vyradené": "outline",
      preregistrované: "secondary",
  };

  const variant = variantMap[status];
  let className =
      status === "aktívne"
          ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
          : "";
  if (status === "dočasne vyradené") {
      className += " whitespace-nowrap";
  }

  return (
      <Badge variant={variant} className={`capitalize ${className}`}>
          {statusLabels[status]}
      </Badge>
  );
}