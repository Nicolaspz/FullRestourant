// components/caixa/CaixaHeader.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PrinterIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CaixaHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CaixaHeader = ({ selectedDate, onDateChange, activeTab, onTabChange }: CaixaHeaderProps) => {
  const tabs = [
    { 
      id: 'pendentes', 
      label: 'Pendentes',
      badge: 'warning'
    },
    { 
      id: 'pagas', 
      label: 'Pagas'
    },
    { 
      id: 'canceladas', 
      label: 'Canceladas'
    },
    { 
      id: 'todas', 
      label: 'Todas'
    }
  ];

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: pt })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && onDateChange(date)}
                  initialFocus
                  locale={pt}
                />
              </PopoverContent>
            </Popover>

            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="relative"
              >
                {tab.label}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CaixaHeader;