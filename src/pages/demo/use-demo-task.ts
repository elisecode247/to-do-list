import { useContext } from 'react';
import { DemoTaskContext } from 'src/pages/demo/demo-task-context';

export function useTask() {
    const context = useContext(DemoTaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
}
