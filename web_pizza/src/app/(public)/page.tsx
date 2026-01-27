'use client';

import { useState } from 'react';
import { 
  Utensils, 
  Smartphone, 
  TrendingUp, 
  UserPlus, 
  LogIn,
  Check,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import logoImg from '../../../public/Logo.png';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
});

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Email enviado:', values.email);
    alert('Obrigado pelo interesse! Entraremos em contato em breve.');
    form.reset();
  };

  const features = [
    {
      icon: Smartphone,
      title: 'Pedidos Online',
      description: 'Sistema de pedidos integrado com mesa/comanda, delivery e retirada. Interface amigável para garçons e clientes.'
    },
    {
      icon: TrendingUp,
      title: 'Gestão Completa',
      description: 'Controle de estoque, finanças, funcionários e relatórios em tempo real para tomar decisões estratégicas.'
    },
    {
      icon: UserPlus,
      title: 'Fidelização',
      description: 'Programa de fidelidade integrado, cadastro de clientes e marketing digital para aumentar suas vendas.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Básico',
      description: 'Para pequenos estabelecimentos',
      price: 'R$199',
      period: '/mês',
      features: ['Até 2 caixas', 'Gestão de pedidos', 'Relatórios básicos'],
      popular: false
    },
    {
      name: 'Profissional',
      description: 'Para restaurantes em crescimento',
      price: 'R$399',
      period: '/mês',
      features: ['Até 5 caixas', 'Gestão completa', 'Relatórios avançados', 'App para clientes'],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'Para redes de restaurantes',
      price: 'R$899',
      period: '/mês',
      features: ['Caixas ilimitados', 'Multi-franquias', 'Suporte prioritário', 'Personalização'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sistema Completo para Gestão de Restaurantes</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Gerencie pedidos, estoque, funcionários e clientes em uma única plataforma intuitiva e poderosa.
          </p>
          <div className="max-w-md mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Digite seu e-mail" 
                          className="bg-background text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="bg-background text-primary hover:bg-background/90 font-semibold"
                >
                  Solicitar Demonstração
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos do Sistema</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-primary mb-4">
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Planos e Assinaturas</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`
                  relative hover:shadow-lg transition-all
                  ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    {plan.name === 'Enterprise' ? 'Fale Conosco' : 'Assinar Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar seu restaurante?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experimente gratuitamente por 14 dias. Sem necessidade de cartão de crédito.
          </p>
          <Button 
            variant="secondary" 
            className="bg-background text-primary hover:bg-background/90 font-semibold shadow-lg"
          >
            Comece Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image 
                  src={logoImg} 
                  alt="ServeFixe" 
                  width={70}
                  height={70}
                />
              </div>
              <p className="mb-4 text-muted-foreground">
                O sistema completo para gestão de restaurantes, bares e lanchonetes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <address className="not-italic text-muted-foreground">
                <p className="mb-2">contato@servefixe.com</p>
                <p className="mb-2">+55 (11) 1234-5678</p>
                <p>Av. Paulista, 1000<br/>São Paulo - SP</p>
              </address>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Serve Fixe. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}