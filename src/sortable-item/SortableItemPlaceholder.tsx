import { useDndContext, useDroppable } from "@dnd-kit/core";
import { Sparkles, ArrowDownToLine } from "lucide-react";
import "./placeholder.css";

const SortableItemPlaceholder = ({ id }: { id: string }) => {
    const { active } = useDndContext();
    const isDraggingParent = active?.id === id;
    const activeTaskText = typeof active?.data.current?.taskText === 'string'
        ? active.data.current.taskText
        : null;
    const { setNodeRef, isOver } = useDroppable({
        id: `placeholder-${id}`,
        disabled: isDraggingParent,
    });
    const showTaskPreview = isOver && !isDraggingParent && !!activeTaskText;

    return (
        <div
            ref={setNodeRef}
            role="region"
            aria-label="Subtask drop target"
            aria-disabled={isDraggingParent}
            className={`sortable-item_subtask-dropzone${isOver ? " sortable-item_subtask-dropzone-over" : ""}${isDraggingParent ? " sortable-item_subtask-dropzone-disabled" : ""}`}
        >
            <div className={`sortable-item_subtask-dropzone-inner${showTaskPreview ? " sortable-item_subtask-dropzone-inner--task-preview" : ""}`}>
                <div className="sortable-item_subtask-dropzone-text" aria-live="polite">
                    {isDraggingParent ? (
                        <>
                            <span className="sortable-item_subtask-dropzone-title">
                                Choose another task
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                A task can’t be its own subtask.
                            </span>
                        </>
                    ) : showTaskPreview ? (
                        <>
                            <span className="sortable-item_subtask-dropzone-preview-label">
                                New subtask
                            </span>
                            <span className="sortable-item_subtask-dropzone-preview-task">
                                {activeTaskText}
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                Release to place it here.
                            </span>
                        </>
                    ) : isOver ? (
                        <>
                            <span className="sortable-item_subtask-dropzone-title">
                                Release to make a subtask
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                It will be grouped under this task.
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="sortable-item_subtask-dropzone-title">
                                Drop a task here
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                It will become this task’s first subtask.
                            </span>
                        </>
                    )}
                </div>
                <div className="sortable-item_subtask-dropzone-icon">
                    {isOver ? <Sparkles size={18} /> : <ArrowDownToLine size={18} />}
                </div>
            </div>
        </div>
    );
};

export default SortableItemPlaceholder;
