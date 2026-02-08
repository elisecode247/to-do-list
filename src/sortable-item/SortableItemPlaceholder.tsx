import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sparkles, ArrowDownToLine } from "lucide-react";
import "./placeholder.css";

const SortableItemPlaceholder = ({ id }: { id: string }) => {
    const { attributes, setNodeRef, transform, transition, isDragging, isOver } =
        useSortable({ id: 'placeholder-' + id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`sortable-item_subtask-dropzone ${isOver ? "sortable-item_subtask-dropzone-over" : ""
                }`}
        >
            <div className="sortable-item_subtask-dropzone-inner">
                <div className="sortable-item_subtask-dropzone-icon">
                    {isDragging ? <Sparkles size={18} /> : <ArrowDownToLine size={18} />}
                </div>

                <div className="sortable-item_subtask-dropzone-text">
                    {isDragging ? (
                        <span className="sortable-item_subtask-dropzone-title">
                            Moving task…
                        </span>
                    ) : isOver ? (
                        <>
                            <span className="sortable-item_subtask-dropzone-title">
                                Release to nest as a subtask
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                It will be grouped under this task.
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="sortable-item_subtask-dropzone-title">
                                Drop here to make a subtask
                            </span>
                            <span className="sortable-item_subtask-dropzone-subtitle">
                                Drag a task onto this zone to nest it.
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SortableItemPlaceholder;
