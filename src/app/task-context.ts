import { createContext } from 'react';
import type { TaskContextType } from './types';

export const TaskContext = createContext<TaskContextType | undefined>(undefined);


