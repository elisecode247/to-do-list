import 'item-modal/item-modal.css';
import { useEffect, useRef, type FC } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { MODES } from 'checklist/constants';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';
import { createPortal } from 'react-dom';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';

type ItemModalProps = {
    formData: ChecklistItem;
    setEditingItem: (item: ChecklistItem) => void;
    onSave: (item: ChecklistItem) => void;
    onClose: () => void;
};

export const ItemModal: FC<ItemModalProps> = ({
    formData,
    setEditingItem,
    onSave,
    onClose,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);
    const noteRef = useRef<MDXEditorMethods>(null)

    const handleSave = async () => {
        let note = noteRef.current?.getMarkdown()
        onSave({
            ...formData,
            note: note ?? formData.note ?? '',
        });
    }

    const toggleMode = (mode: Mode) => {
        setEditingItem({
            ...formData,
            mode: mode
        });
    };

    const togglePriority = () => {
        setEditingItem({
            ...formData,
            isPriority: !formData.isPriority
        });
    }

    useEffect(() => {
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
            'input, textarea, button, [tabindex]:not([tabindex="-1"])'
        );

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const active = document.activeElement as HTMLElement;

                // Enter modal on first Tab
                if (!modal.contains(active)) {
                    e.preventDefault();
                    first?.focus();
                    return;
                }

                // Trap focus inside modal
                if (e.shiftKey && active === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && active === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement.current?.focus();
        };
    }, []);

    return createPortal(
        <div className="modal-overlay">
            <div
                className="modal"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"

            >
                <h2>Edit Task</h2>

                {/* Task */}
                <div className="form-group">
                    <label>Task</label>
                    <input
                        className="item-modal_text-input"
                        type="text"
                        value={formData.text}
                        onChange={(e) =>
                            setEditingItem({ ...formData, text: e.target.value })
                        }
                    />
                </div>
                {/* Category */}
                <CategorySelect
                    id="item-modal-category-select"
                    isFilter={false}
                    selectedCategory={formData.category}
                    onChange={(category: string) =>
                        setEditingItem({ ...formData, category })
                    }
                />
                {/* Date */}
                <div className="form-group">
                    <label>Last Completed</label>
                    <input
                        type="date"
                        value={formatDate(new Date(formData.lastCompleted)) ?? ''}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onFocus={(e) => e.currentTarget.showPicker?.()}
                        onChange={(e) => {
                            const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
                            setEditingItem({
                                ...formData,
                                lastCompleted: isoDateString || '',
                            })
                        }}
                    />
                </div>

                {/* Notes */}
                <div className="form-group">
                    <label>Notes</label>
                    <NoteEditor
                        ref={noteRef}
                        initialMarkdown={formData.note ?? ''}
                        readOnly={false}
                    />
                </div>

                <div className="item-modal_mode-container">
                    <p className="item-modal_mode-label">Schedule (choose one)</p>

                    <div className="item-modal_mode-group">
                        {MODES.map(mode => (
                            <button
                                key={mode}
                                onClick={() => toggleMode(mode)}
                                className={`item-modal_mode-button
                                    ${formData.mode === mode ?
                                        getModeColor(mode) :
                                        'item-modal_mode-button--inactive'
                                    }
                                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="item-modal_mode-container">

                    <p className="item-modal_mode-label">Options</p>

                    <div className="item-modal_mode-group">
                        <button
                            key="priority"
                            onClick={() => togglePriority()}
                            className={`item-modal_mode-button
                                item-modal_mode-button--priority
                                ${formData.isPriority
                                    ? 'item-modal_mode-button--priority-active'
                                    : ''}
                            `}
                            title="Can be combined with any schedule"
                        >
                            ⭐ Priority
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        className="item-modal_button btn-secondary"
                        onClick={onClose}
                        type="button"
                        aria-label="Close modal"
                    >
                        Cancel
                    </button>
                    <button
                        className="item-modal_button btn-primary"
                        onClick={handleSave}
                        type="button"
                        aria-label="Save changes"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    , document.body);
};

export default ItemModal;
