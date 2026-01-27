import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onLoadData: () => void;
  message?: string;
}

export function EmptyState({ onLoadData, message = "Nenhum dado disponível" }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4 text-center">{message}</p>
        <Button onClick={onLoadData}>
          Carregar dados
        </Button>
      </CardContent>
    </Card>
  );
}