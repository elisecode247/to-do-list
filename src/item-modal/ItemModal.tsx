import 'item-modal/item-modal.css';
import { useEffect, useEffectEvent, useRef, type FC } from 'react';
import type { ChecklistItem } from 'app/types';
import { TAGS } from 'checklist/constants';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';

type ItemModalProps = {
    formData: ChecklistItem;
    setEditingItem: (item: ChecklistItem) => void;
    onSave: () => void;
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

    const toggleTag = (tag: string) => {
        setEditingItem({
            ...formData,
            tags: formData.tags.includes(tag) ?
                formData.tags.filter(t => t !== tag) :
                [...formData.tags, tag]
        });
    };
    const closeModal = useEffectEvent(onClose);

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
                closeModal();
                return;
            }

            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement?.current?.focus();
        };
    }, []);

    return (
        <div className="modal-overlay">
            <div
                className="modal"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2 id="modal-title">Edit Task</h2>

                <div className="form-group">
                    <label htmlFor="task-text">Task</label>
                    <input
                        className="item-modal_text-input"
                        id="task-text"
                        type="text"
                        value={formData.text}
                        onChange={(e) =>
                            setEditingItem({ ...formData, text: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="last-completed">Last Completed</label>
                    <input
                        id="last-completed"
                        type="date"
                        value={formatDate(new Date(formData.lastCompleted)) ?? ''}
                        onChange={(e) => {
                            const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
                            setEditingItem({
                                ...formData,
                                lastCompleted: isoDateString || '',
                            })
                        }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        value={formData.note ?? ''}
                        onChange={(e) =>
                            setEditingItem({ ...formData, note: e.target.value })
                        }
                        rows={4}
                    />
                </div>

                <div className="item-modal_tag-container">
                    {TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`item-modal_tag-button ${formData.tags.includes(tag)
                                ? getTagColor(tag)
                                : 'item-modal_tag-button--inactive'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

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
                        onClick={onSave}
                        type="button"
                        aria-label="Save changes"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
