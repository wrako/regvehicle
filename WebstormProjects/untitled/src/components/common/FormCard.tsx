import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function FormCard({ title, description, children }: FormCardProps) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}