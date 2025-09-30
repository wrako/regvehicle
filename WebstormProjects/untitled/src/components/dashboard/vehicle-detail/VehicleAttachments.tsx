import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type Props = {
    filePaths?: string[];
    vehicleId: string;
};

export function VehicleAttachments({ filePaths, vehicleId }: Props) {
    if (!filePaths || filePaths.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Prílohy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Žiadne prílohy</p>
                </CardContent>
            </Card>
        );
    }

    const handleDownload = (filePath: string) => {
        const fileName = filePath.split('/').pop() || 'file';
        const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
        const url = `${apiBase}/vehicles/${vehicleId}/files/${fileName}`;
        window.open(url, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Prílohy ({filePaths.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {filePaths.map((filePath, idx) => {
                    const fileName = filePath.split('/').pop() || `file-${idx}`;
                    return (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{fileName}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(filePath)}
                            >
                                Stiahnuť
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}