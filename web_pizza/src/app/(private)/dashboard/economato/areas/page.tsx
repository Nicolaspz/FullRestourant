import { AreasTable } from "@/components/dashboard/economato/AreasTable";

export default function AreasPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Áreas</h1>
        <p className="text-muted-foreground">
          Configure as áreas de armazenamento e operação do seu restaurante.
        </p>
      </div>

      <AreasTable />
    </div>
  );
}
