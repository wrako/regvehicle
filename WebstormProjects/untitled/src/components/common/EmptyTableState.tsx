import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTableStateProps {
  colSpan: number;
  message?: string;
}

export function EmptyTableState({ colSpan, message = "Žiadne záznamy sa nenašli." }: EmptyTableStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        {message}
      </TableCell>
    </TableRow>
  );
}