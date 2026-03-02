import { useState, useEffect, type ReactNode } from "react";
import { type ChecklistItem } from 'app/types';
import { DemoContext } from "./DemoContext";

export const DemoProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem("demo-tasks");
        return saved ? JSON.parse(saved) : [];
    });

    // Save demo to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("demo-tasks", JSON.stringify(items));
    }, [items]);

    const resetDemo = () => {
        setItems([]);
        localStorage.removeItem("demo-tasks");
    };

    return (<DemoContext.Provider value={{ items, setItems, resetDemo }}>
        {children}
        </DemoContext.Provider>
    );
};
