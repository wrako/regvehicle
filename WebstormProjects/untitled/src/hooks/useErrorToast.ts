import { useToast } from "@/hooks/use-toast";

export function useErrorToast() {
  const { toast } = useToast();

  const showError = (error: any, title: string = "Chyba", fallbackMessage: string = "Skúste znova neskôr.") => {
    toast({
      title,
      description: error?.message ?? fallbackMessage,
      variant: "destructive"
    });
  };

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description
    });
  };

  return { showError, showSuccess };
}