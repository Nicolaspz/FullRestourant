"use client"

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Terminal, 
  Code, 
  FileText, 
  Play, 
  CheckCircle, 
  Zap,
  Shield,
  Globe,
  CreditCard,
  Smartphone,
  Download,
  BookOpen
} from "lucide-react"

const navigation = [
  { id: 'introducao', title: 'Introdução', icon: BookOpen },
  { id: 'autenticacao', title: 'Autenticação', icon: Shield },
  { id: 'endpoints', title: 'Endpoints', icon: Code },
  { id: 'payload', title: 'Estrutura do Payload', icon: FileText },
  { id: 'respostas', title: 'Respostas da API', icon: Play },
  { id: 'exemplos', title: 'Exemplos de Código', icon: CheckCircle },
]

export default function GPaymentDocumentation() {
  const [activeSection, setActiveSection] = useState('introducao')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleSectionChange = (sectionId: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSection(sectionId)
      setIsTransitioning(false)
    }, 200)
  }

  const handleGetStarted = () => {
    handleSectionChange('autenticacao')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'introducao':
        return <Introducao onGetStarted={handleGetStarted} />
      case 'autenticacao':
        return <Autenticacao />
      case 'endpoints':
        return <Endpoints />
      case 'payload':
        return <PayloadStructure />
      case 'respostas':
        return <APIResponses />
      case 'exemplos':
        return <Exemplos />
      default:
        return <Introducao onGetStarted={handleGetStarted} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Documentação</h2>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-sm"
                        onClick={() => handleSectionChange(item.id)}
                      >
                        <Icon className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                        {item.title}
                      </Button>
                    )
                  })}
                </nav>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-semibold mb-3">Recursos Úteis</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start transition-all duration-200 hover:scale-105" asChild>
                    <a href="/api-docs.json" download>
                      <Download className="w-4 h-4 mr-3" />
                      Download API Spec
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className={`max-w-4xl transition-all duration-300 ${
              isTransitioning 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-100 translate-y-0'
            }`}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

interface IntroducaoProps {
  onGetStarted: () => void
}

function Introducao({ onGetStarted }: IntroducaoProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary" className="animate-pulse">API v1.0</Badge>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          GPayment Gateway
        </h1>
        <p className="text-xl text-muted-foreground">
          Integre pagamentos digitais de forma simples e segura com a API poderosa da GPayment Angola
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Começo Rápido
            </CardTitle>
            <CardDescription>
              Comece a integrar em minutos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p>Obtenha sua chave API no painel</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p>Faça sua primeira requisição de pagamento</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p>Processe a resposta</p>
              </div>
            </div>
            <Button 
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={onGetStarted}
            >
              Começar a Integrar
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Funcionalidades
            </CardTitle>
            <CardDescription>
              O que você pode construir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" />
              <span>Pagamentos Multicaixa</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span>Pagamentos por Referência</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span>Notificações em Tempo Real</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
              <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span>Transações Seguras</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>URL Base</CardTitle>
          <CardDescription>
            Todas as requisições da API devem ser feitas para esta URL base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-4 rounded-md block text-sm font-mono border-2 border-transparent hover:border-primary transition-all duration-300">
            https://api.gpaymentangola.com
          </code>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Fluxo de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: "Cliente inicia pagamento", desc: "Cliente seleciona método de pagamento" },
              { step: 2, title: "Sistema cria transação", desc: "Sua aplicação envia dados para nossa API" },
              { step: 3, title: "Processamento", desc: "GPayment processa o pagamento" },
              { step: 4, title: "Confirmação", desc: "Sua aplicação recebe a confirmação" }
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:bg-muted/50 p-3 rounded-lg"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Autenticacao() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="animate-pulse">Primeiros Passos</Badge>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Autenticação
        </h2>
        <p className="text-muted-foreground">
          Proteja suas requisições API com headers de autenticação
        </p>
      </div>

      <Alert className="transition-all duration-300 hover:shadow-lg">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Chave API Obrigatória</AlertTitle>
        <AlertDescription>
          Inclua sua chave API no header <code className="bg-muted px-1 py-0.5 rounded">Authorization</code> para todas as requisições.
        </AlertDescription>
      </Alert>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Como Obter sua Chave API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Acesse o painel da GPayment",
            "Navegue até as configurações da API", 
            "Gere uma nova chave API",
            "Use essa chave em todas as requisições"
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-3 transition-all duration-200 hover:translate-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <p>{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Exemplo de Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre border-2 border-transparent hover:border-primary transition-all duration-300">
{`Headers:
  Content-Type: application/json
  Authorization: Bearer sua_chave_api_aqui
  X-API-Key: sua_chave_api_aqui`}
          </code>
        </CardContent>
      </Card>

      <Alert variant="destructive" className="transition-all duration-300 hover:shadow-lg">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Nunca exponha sua chave API no lado do cliente. Use variáveis de ambiente para armazenar suas credenciais.
        </AlertDescription>
      </Alert>
    </div>
  )
}



function Endpoints() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Endpoints da API
        </h2>
        <p className="text-muted-foreground">
          Endpoints disponíveis para processamento de pagamentos
        </p>
      </div>

      <div className="space-y-4">
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Criar Pagamento
            </CardTitle>
            <CardDescription>
              Iniciar uma nova transação de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="animate-pulse">POST</Badge>
              <code className="text-sm font-mono">/payments</code>
              <Badge variant="secondary">Obrigatório</Badge>
            </div>
            
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="transition-all duration-300">
                <TabsTrigger value="curl" className="transition-all duration-200 hover:scale-105">cURL</TabsTrigger>
                <TabsTrigger value="javascript" className="transition-all duration-200 hover:scale-105">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre border-2 border-transparent hover:border-primary transition-all duration-300">
{`curl -X POST https://api.gpaymentangola.com/v1/payments \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SUA_CHAVE_API" \\
  -d '{
    "amount": 3500,
    "currency": "AOA",
    "customer_phone": "923456789",
    "payment_method": "multicaixa"
  }'`}
                </code>
              </TabsContent>
              <TabsContent value="javascript">
                <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre border-2 border-transparent hover:border-primary transition-all duration-300">
{`const response = await fetch('https://api.gpaymentangola.com/v1/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SUA_CHAVE_API'
  },
  body: JSON.stringify({
    amount: 3500,
    currency: "AOA",
    customer_phone: "923456789",
    payment_method: "multicaixa"
  })
});`}
                </code>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Outros cards de endpoints com as mesmas transições */}
      </div>
    </div>
  )
}

function Exemplos() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Exemplos de Código</h2>
        <p className="text-muted-foreground">
          Trechos de código prontos para usar em diferentes linguagens de programação
        </p>
      </div>

      <Tabs defaultValue="nodejs" className="w-full">
        <TabsList>
          <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="php">PHP</TabsTrigger>
          <TabsTrigger value="java">Java</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nodejs">
          <Card>
            <CardContent className="pt-6">
              <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`// Exemplo completo em Node.js
const GPaymentAPI = {
  baseURL: 'https://api.gpaymentangola.com/v1',
  apiKey: process.env.GPAYMENT_API_KEY,

  async createPayment(paymentData) {
    const response = await fetch(\`\${this.baseURL}/payments\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.apiKey}\`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error(\`Erro na API: \${response.status}\`);
    }

    return await response.json();
  }
};

// Uso da função
const payment = await GPaymentAPI.createPayment({
  amount: 3500,
  currency: "AOA",
  customer_phone: "923456789",
  customer_email: "cliente@exemplo.com",
  customer_name: "Alberto Roane",
  shop_name: "Minha Loja Online",
  transaction_type: "payment",
  transaction_id: "txn_" + Date.now(),
  payment_method: "multicaixa",
  description: "Compra de produtos eletrônicos",
  callback_url: "https://minhaloja.com/webhook/payments",
  metadata: {
    order_id: "ORD12345",
    customer_id: "CUST67890"
  }
});

console.log('Pagamento criado:', payment);`}
              </code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="python">
          <Card>
            <CardContent className="pt-6">
              <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`# Exemplo completo em Python
import requests
import os
import json

class GPaymentClient:
    def __init__(self):
        self.base_url = "https://api.gpaymentangola.com/v1"
        self.api_key = os.getenv('GPAYMENT_API_KEY')
    
    def create_payment(self, payment_data):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
        
        response = requests.post(
            f"{self.base_url}/payments",
            json=payment_data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Erro na API: {response.status_code}")
        
        return response.json()

# Uso da classe
client = GPaymentClient()

payment_data = {
    "amount": 3500,
    "currency": "AOA",
    "customer_phone": "923456789",
    "customer_email": "cliente@exemplo.com",
    "shop_name": "Minha Loja Python",
    "transaction_type": "payment",
    "transaction_id": "txn_12345",
    "payment_method": "multicaixa",
    "description": "Pagamento de serviços"
}

try:
    result = client.create_payment(payment_data)
    print("Pagamento criado:", result)
except Exception as e:
    print("Erro:", e)`}
              </code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="php">
          <Card>
            <CardContent className="pt-6">
              <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`<?php
// Exemplo completo em PHP
class GPaymentAPI {
    private $baseUrl = 'https://api.gpaymentangola.com/v1';
    private $apiKey;

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function createPayment($paymentData) {
        $url = $this->baseUrl . '/payments';
        
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ];

        $options = [
            'http' => [
                'header' => implode("\r\n", $headers),
                'method' => 'POST',
                'content' => json_encode($paymentData),
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        $statusCode = $this->getHttpStatus($http_response_header);
        
        if ($statusCode !== 200) {
            throw new Exception('Erro na API: ' . $statusCode);
        }

        return json_decode($response, true);
    }

    private function getHttpStatus($headers) {
        $statusLine = $headers[0];
        preg_match('{HTTP/\S*\s(\d{3})}', $statusLine, $match);
        return $match[1];
    }
}

// Uso da classe
$gpayment = new GPaymentAPI($_ENV['GPAYMENT_API_KEY']);

$paymentData = [
    'amount' => 3500,
    'currency' => 'AOA',
    'customer_phone' => '923456789',
    'shop_name' => 'Minha Loja PHP',
    'transaction_type' => 'payment',
    'transaction_id' => 'txn_' . time(),
    'payment_method' => 'multicaixa'
];

try {
    $result = $gpayment->createPayment($paymentData);
    echo "Pagamento criado: " . json_encode($result);
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
?>`}
              </code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="java">
          <Card>
            <CardContent className="pt-6">
              <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`// Exemplo completo em Java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GPaymentAPI {
    private static final String BASE_URL = "https://api.gpaymentangola.com/v1";
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GPaymentAPI(String apiKey) {
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public PaymentResponse createPayment(PaymentRequest paymentData) throws Exception {
        String requestBody = objectMapper.writeValueAsString(paymentData);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/payments"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(
                request, 
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            throw new RuntimeException("Erro na API: " + response.statusCode());
        }

        return objectMapper.readValue(response.body(), PaymentResponse.class);
    }
}

// Uso da classe
GPaymentAPI api = new GPaymentAPI(System.getenv("GPAYMENT_API_KEY"));

PaymentRequest request = new PaymentRequest();
request.setAmount(3500);
request.setCurrency("AOA");
request.setCustomerPhone("923456789");
request.setShopName("Minha Loja Java");
request.setTransactionType("payment");
request.setTransactionId("txn_" + System.currentTimeMillis());
request.setPaymentMethod("multicaixa");

try {
    PaymentResponse response = api.createPayment(request);
    System.out.println("Pagamento criado: " + response);
} catch (Exception e) {
    System.out.println("Erro: " + e.getMessage());
}`}
              </code>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetodosPagamento() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Métodos de Pagamento</h2>
        <p className="text-muted-foreground">
          Conheça todos os métodos de pagamento suportados pela GPayment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Multicaixa
            </CardTitle>
            <CardDescription>
              Pagamentos com cartão Multicaixa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cartão de Débito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cartão de Crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Processamento Instantâneo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Taxas Competitivas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Referência Multicaixa
            </CardTitle>
            <CardDescription>
              Pagamentos por referência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pagamento em Multicaixa Express</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Referência única por transação</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Validade de 24 horas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Ideal para pagamentos offline</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparação de Métodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Método</th>
                  <th className="text-left py-3">Velocidade</th>
                  <th className="text-left py-3">Taxas</th>
                  <th className="text-left py-3">Disponibilidade</th>
                  <th className="text-left py-3">Melhor para</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 font-medium">Multicaixa</td>
                  <td className="py-3">
                    <Badge variant="default">Instantâneo</Badge>
                  </td>
                  <td className="py-3">1.5%</td>
                  <td className="py-3">24/7</td>
                  <td className="py-3">Compras online</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Referência</td>
                  <td className="py-3">
                    <Badge variant="secondary">1-24 horas</Badge>
                  </td>
                  <td className="py-3">1.0%</td>
                  <td className="py-3">24/7</td>
                  <td className="py-3">Pagamentos offline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function PayloadStructure() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Estrutura do Payload</h2>
        <p className="text-muted-foreground">
          Campos obrigatórios e opcionais para requisições de pagamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corpo da Requisição de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`{
  "amount": 3500,                    // Obrigatório - Valor em AOA
  "currency": "AOA",                 // Obrigatório - Moeda (AOA, USD, EUR)
  "customer_phone": "923456789",     // Obrigatório - Telefone do cliente
  "customer_email": "cliente@exemplo.com", // Opcional - Email do cliente
  "customer_name": "Alberto Roane",  // Opcional - Nome do cliente
  "shop_name": "Minha Loja",         // Obrigatório - Nome da sua loja
  "transaction_type": "payment",     // Obrigatório - Tipo de transação
  "transaction_id": "txn_12345",     // Obrigatório - ID único da transação
  "payment_method": "multicaixa",    // Obrigatório - "multicaixa" ou "referencia"
  "description": "Pagamento de serviços", // Opcional - Descrição
  "callback_url": "https://sualoja.com/webhook", // Opcional - URL de callback
  "metadata": {                      // Opcional - Metadados personalizados
    "order_id": "12345",
    "customer_id": "67890"
  }
}`}
          </code>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campos Obrigatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { field: 'amount', desc: 'Valor da transação em centavos' },
              { field: 'currency', desc: 'Moeda (AOA, USD, EUR)' },
              { field: 'customer_phone', desc: 'Telefone do cliente' },
              { field: 'shop_name', desc: 'Nome do estabelecimento' },
              { field: 'transaction_type', desc: 'Tipo de transação' },
              { field: 'transaction_id', desc: 'ID único da transação' },
              { field: 'payment_method', desc: 'Método de pagamento' }
            ].map(item => (
              <div key={item.field} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <code className="text-sm font-semibold">{item.field}</code>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campos Opcionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { field: 'customer_email', desc: 'Email do cliente' },
              { field: 'customer_name', desc: 'Nome completo do cliente' },
              { field: 'description', desc: 'Descrição do pagamento' },
              { field: 'callback_url', desc: 'URL para webhooks' },
              { field: 'metadata', desc: 'Dados personalizados' }
            ].map(item => (
              <div key={item.field} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <code className="text-sm font-semibold">{item.field}</code>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function APIResponses() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Respostas da API</h2>
        <p className="text-muted-foreground">
          Entenda o formato das respostas para requisições bem-sucedidas e com erro
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Resposta de Sucesso
            </CardTitle>
            <CardDescription>200 OK - Pagamento criado com sucesso</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`{
  "success": true,
  "status": "completed",
  "message": "Pagamento processado com sucesso",
  "transaction_id": "txn_12345",
  "payment_id": "pay_67890",
  "payment_method": "multicaixa",
  "amount": 3500,
  "currency": "AOA",
  "customer_phone": "923456789",
  "reference": "REF123456789",
  "entity": "1234",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:31:00Z",
  "metadata": {
    "order_id": "12345"
  }
}`}
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Resposta Pendente
            </CardTitle>
            <CardDescription>202 Accepted - Pagamento em processamento</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`{
  "success": true,
  "status": "pending",
  "message": "Pagamento em processamento",
  "transaction_id": "txn_12345",
  "payment_id": "pay_67890",
  "payment_method": "referencia",
  "amount": 3500,
  "reference": "REF123456789",
  "entity": "1234",
  "expires_at": "2024-01-15T11:30:00Z"
}`}
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Resposta de Erro
            </CardTitle>
            <CardDescription>400 Bad Request - Dados inválidos</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-4 rounded-md block text-sm font-mono whitespace-pre">
{`{
  "success": false,
  "status": "error",
  "message": "transaction_id inválido. Utilize apenas letras e números.",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "transaction_id",
    "reason": "formato_invalido"
  }
}`}
            </code>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



