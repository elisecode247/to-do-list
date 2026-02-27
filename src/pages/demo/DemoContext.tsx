import { createContext } from "react";
import { type ChecklistItem } from 'app/types';

interface DemoContextType {
    items: ChecklistItem[];
    setItems: (items: ChecklistItem[]) => void;
    resetDemo: () => void;
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);
