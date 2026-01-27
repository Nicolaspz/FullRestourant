"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Básico",
    price: "5.000 Kz/mês",
    features: ["1 Usuário", "Relatórios Simples", "Suporte por Email"],
  },
  {
    name: "Profissional",
    price: "12.000 Kz/mês",
    features: ["5 Usuários", "Dashboard Completo", "Suporte Prioritário"],
    highlight: true,
  },
  {
    name: "Empresarial",
    price: "25.000 Kz/mês",
    features: ["Usuários Ilimitados", "Integrações Avançadas", "Suporte 24/7"],
  },
]

export default function PricingPage() {
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Planos de Pagamento
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          Escolha o plano ideal para o seu negócio e comece hoje mesmo com o{" "}
          <span className="text-green-500 font-semibold">G-Pay</span>.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`p-6 shadow-lg border rounded-2xl transition-transform hover:scale-105 ${
                plan.highlight
                  ? "border-green-500 ring-2 ring-green-500"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4 text-green-600">
                  {plan.price}
                </p>
                <ul className="space-y-2 text-left text-gray-600 dark:text-gray-300">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      ✅ {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 cursor-pointer">
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
