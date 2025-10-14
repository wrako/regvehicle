import { Badge } from "@/components/ui/badge";

export type OperationType = "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "UNARCHIVE";

interface OperationBadgeProps {
  operation: OperationType;
}

export function OperationBadge({ operation }: OperationBadgeProps) {
  const variantMap: Record<
    OperationType,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
    ARCHIVE: "outline",
    UNARCHIVE: "outline",
  };

  return <Badge variant={variantMap[operation]}>{operation}</Badge>;
}
