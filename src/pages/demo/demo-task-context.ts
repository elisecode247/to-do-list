import { createContext } from 'react';
import type { TaskContextType } from 'app/types';

export interface DemoTaskContextType extends TaskContextType {
    clear: () => void;
}

export const DemoTaskContext = createContext<DemoTaskContextType | undefined>(undefined);
