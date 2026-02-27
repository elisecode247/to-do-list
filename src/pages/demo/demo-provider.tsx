import { useState, useEffect, type ReactNode } from "react";
import { type ChecklistItem } from 'app/types';
import { DemoContext } from "./DemoContext";

export const DemoProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem("demoChecklist");
        return saved ? JSON.parse(saved) : [];
    });

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
