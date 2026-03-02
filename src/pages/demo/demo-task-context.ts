import { createContext } from 'react';
import type { TaskContextType } from 'app/types';

export const DemoTaskContext = createContext<TaskContextType | undefined>(undefined);
