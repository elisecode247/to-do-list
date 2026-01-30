import { useContext } from 'react';
import { TaskContext } from 'src/app/task-context.tsx';

export function useTask() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
}
