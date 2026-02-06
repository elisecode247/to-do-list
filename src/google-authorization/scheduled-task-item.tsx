import "./scheduled-task-item.css";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { EyeClosed, BookPlus, BookMinus } from "lucide-react";
import { type Task } from "src/google-authorization/types";

type ScheduledTaskItemProps = {
    task: Task;
    markCompleted: (taskId: string, listId: string, isCompleted: boolean) => Promise<void>;
}
const ScheduledTaskItem = ({ task, markCompleted }: ScheduledTaskItemProps) => {
    const [hidden, setHidden] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [checked, setChecked] = useState(task.done);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const sanitizedHTML = DOMPurify.sanitize(task.note || '');
    if (hidden) return null;
    return (
        <div className="scheduled-task-item">
            <div className="scheduled-task_main-content">
                <input
                    className="scheduled-task_checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                        setChecked(e.target.checked);
                        markCompleted(task.id, task.listId, e.target.checked);
                    }}
                    aria-label={`Mark task as done`}
                    title={checked ? "Mark as not done" : "Mark as done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />
                <div className="scheduled-task-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h4>Scheduled Task: {task.text}</h4>
                    </div>
                </div>
                <div className="scheduled-task-controls">
                    {!!task.note && (
                        <button
                            className="sortable-item_hide-button"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Expand task" : "Collapse task"}
                        >
                            {collapsed ? <BookPlus size={24} /> : <BookMinus size={24} />}
                        </button>

                    )}
                    <button
                        className="scheduled-task_hide-button"
                        onClick={() => setHidden(true)}
                        aria-label="Hide task"
                    >
                        <EyeClosed size={24} />
                    </button>
                </div>
            </div>
            {/* Description */}
            {!task.note ? '' : !collapsed && (
                <div
                    className="scheduled-task-description"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            )}

        </div>
    );
}

export default ScheduledTaskItem;
