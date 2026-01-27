import { ProductsTable } from "@/components/dashboard/produto/ProductsTable"; 

export default function ProductsPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h1>
        <p className="text-muted-foreground">
          Gerencie produtos, ingredientes e receitas do sistema
        </p>
      </div>
      
      <ProductsTable />
    </div>
  );
}