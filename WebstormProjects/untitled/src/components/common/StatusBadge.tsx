// This component is deprecated - VehicleStatus has been removed from the system
// Vehicles no longer have a status field
// Kept for reference only - do not use

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
      <Badge variant="outline">
          {status}
      </Badge>
  );
}