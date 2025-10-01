import { Badge } from "@/components/ui/badge";

export type OperationType = "CREATE" | "UPDATE" | "DELETE";

interface OperationBadgeProps {
  operation: OperationType;
}

export function OperationBadge({ operation }: OperationBadgeProps) {
  const variantMap: Record<
    OperationType,
    "default" | "secondary" | "destructive"
  > = {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
  };

  return <Badge variant={variantMap[operation]}>{operation}</Badge>;
}
