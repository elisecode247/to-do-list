import "./calendar-task-item.css";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { BookPlus, BookMinus } from "lucide-react";
import type { GoogleTask } from "./types";

type CalendarTaskItemProps = {
    task: GoogleTask;
    markCompleted: (taskId: string, listId: string, isCompleted: boolean) => Promise<void>;
}
const CalendarTaskItem = ({task, markCompleted }: CalendarTaskItemProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const [checked, setChecked] = useState(task.done);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const sanitizedHTML = DOMPurify.sanitize(task.note || '');
    return (
        <div className="calendar-task-item">
            <div className="calendar-task_main-content">
                <input
                    className="calendar-task_checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                        setChecked(e.target.checked);
                        markCompleted(task.id, task.listId ?? '', e.target.checked);
                    }}
                    aria-label={`Mark task as done`}
                    title={checked ? "Mark as not done" : "Mark as done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />
                <div className="calendar-task-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h4>Calendar Task: {task.text}</h4>
                    </div>
                </div>
                <div className="calendar-task-controls">
                    {!!task.note && (
                        <button
                            className="sortable-item_hide-button"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Expand task" : "Collapse task"}
                            title={`${collapsed ? "Expand task to see details" : "Collapse task details"}`}
                        >
                            {collapsed ? <BookPlus size={24} /> : <BookMinus size={24} />}
                        </button>

                    )}
                </div>
            </div>
            {/* Description */}
            {!task.note ? '' : !collapsed && (
                <div
                    className="calendar-task-description"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            )}

        </div>
    );
}

export default CalendarTaskItem;
