import { createContext, useState, useEffect, type ReactNode } from "react";
import { type ChecklistItem } from 'app/types';

interface DemoContextType {
    items: ChecklistItem[];
    setItems: (items: ChecklistItem[]) => void;
    resetDemo: () => void;
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ChecklistItem[]>([]);

    // Load demo from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("demoChecklist");
        if (saved) setItems(JSON.parse(saved));
    }, []);

    // Save demo to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("demoChecklist", JSON.stringify(items));
    }, [items]);

    const resetDemo = () => {
        setItems([]);
        localStorage.removeItem("demoChecklist");
    };

    return (<DemoContext.Provider value={{ items, setItems, resetDemo }}>
        {children}
        </DemoContext.Provider>
    );
};
