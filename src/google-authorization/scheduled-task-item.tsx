import "./scheduled-task-item.css";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { EyeClosed } from "lucide-react";
import { type Task } from "src/google-authorization/types";

type ScheduledTaskItemProps = {
    task: Task;
    markCompleted: (taskId: string, listId: string, isCompleted: boolean) => Promise<void>;
}
const ScheduledTaskItem = ({ task, markCompleted }: ScheduledTaskItemProps) => {
    const [hidden, setHidden] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [checked, setChecked] = useState(!!task.completed);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const sanitizedHTML = DOMPurify.sanitize(task.notes || '');
    if (hidden) return null;
    return (
        <div className="scheduled-task-item">
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
                    <h4>Scheduled Task: {task.title}</h4>
                </div>
            </div>
            <div className="scheduled-task-controls">
                {!!task.notes && (
                    <button
                        onClick={toggleCollapsed}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                        }}
                        aria-label={collapsed ? "Expand task" : "Collapse task"}
                    >
                        {collapsed ? "➕" : "➖"}
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

            {/* Description */}
            {!task.notes ? '' : !collapsed && (
                <div
                    className="scheduled-task-description"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            )}
        </div>
    );
}

export default ScheduledTaskItem;
