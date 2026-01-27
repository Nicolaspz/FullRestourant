import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ComercialTabsProps {
  tabs: Tab[];
  defaultTab: string;
}

export function CommercialTabs({ tabs, defaultTab }: ComercialTabsProps) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger className="cursor-pointer" key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent  key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}