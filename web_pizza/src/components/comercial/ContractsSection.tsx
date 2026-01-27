import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search } from "lucide-react"

export function ContractsSection() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contratos Comerciais</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-gray-300">
            <Search className="mr-2" /> Buscar
          </Button>
          <Button className="cursor-pointer">
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Lista de contratos (exemplo) */}
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-3 border rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileText className="text-gray-500" />
              <span>Contrato #{item}</span>
            </div>
            <Button variant="ghost" className="text-blue-600">Visualizar</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}