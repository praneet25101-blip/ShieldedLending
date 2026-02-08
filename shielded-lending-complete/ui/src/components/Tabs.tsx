import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  className, 
  children 
}: { 
  defaultValue: string; 
  className?: string; 
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 bg-purple-900/30 p-1 rounded-lg border border-purple-500/20">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`
        flex-1 px-6 py-3 rounded-md font-semibold transition
        ${isActive 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
          : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
        }
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { 
  value: string; 
  className?: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
}
