import { useContext } from 'react';
import { DemoTaskContext } from 'src/demo/demo-task-context.tsx';

export function useTask() {
    const context = useContext(DemoTaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
}
