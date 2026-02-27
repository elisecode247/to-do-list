import { createContext } from 'react';
import type { ToastContextType } from 'src/toast/types';


export const ToastContext = createContext<ToastContextType | undefined>(undefined);


