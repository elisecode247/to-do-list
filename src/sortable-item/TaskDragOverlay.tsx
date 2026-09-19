import { GripVertical } from 'lucide-react';
import type { ChecklistItem } from 'src/app/types';
import './task-drag-overlay.css';

export const TaskDragOverlay = ({ item }: { item: ChecklistItem }) => (
    <div
        className="task-drag-overlay"
        aria-label={`Moving task: ${item.text}`}
    >
        <span className="task-drag-overlay_handle" aria-hidden="true">
            <GripVertical size={22} />
        </span>
        <span className="task-drag-overlay_text">{item.text}</span>
        <span className="task-drag-overlay_status">Moving</span>
    </div>
);
