import { createContext } from 'react';
import type { JournalContextType } from './types';

export const JournalContext = createContext<JournalContextType | undefined>(undefined);

