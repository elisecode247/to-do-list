import { useContext } from 'react';
import { DemoTaskContext } from 'src/pages/demo/demo-task-context';
import type { DemoTaskContextType } from './demo-task-context';

export function useDemoTask(): DemoTaskContextType {
    const context = useContext(DemoTaskContext);
    if (!context) {
        throw new Error('useDemoTask must be used within a DemoTaskProvider');
    }
    return context;
}

export const useTask = useDemoTask;
