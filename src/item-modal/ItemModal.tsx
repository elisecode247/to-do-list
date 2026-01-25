import 'item-modal/item-modal.css';
import { useEffect, useRef, type FC } from 'react';
import type { ChecklistItem } from 'app/types';
import { TAGS, EXCLUSIVE_TAGS, PRIORITY_TAG, type ExclusiveTag } from 'checklist/constants';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';

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
        const isExclusive = EXCLUSIVE_TAGS.includes(tag as ExclusiveTag);

        if (isExclusive) {
            if (formData.tags.includes(tag)) return;

            setEditingItem({
                ...formData,
                tags: [
                    ...formData.tags.filter(
                        t => !EXCLUSIVE_TAGS.includes(t as ExclusiveTag)
                    ),
                    tag,
                ],
            });
            return;
        }

        setEditingItem({
            ...formData,
            tags: formData.tags.includes(tag)
                ? formData.tags.filter(t => t !== tag)
                : [...formData.tags, tag],
        });
    };

    useEffect(() => {
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        let initialClick = false;
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
                // let tab focus inside the modal
                if (!initialClick) {
                    e.preventDefault();
                    first?.focus();
                    initialClick = true;
                    return;
                }

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
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

    return (
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
                    <textarea
                        value={formData.note ?? ''}
                        onChange={e =>
                            setEditingItem({ ...formData, note: e.target.value })
                        }
                        rows={4}
                    />
                </div>

                {/* Tags */}
                <div className="item-modal_tag-container">
                    <p className="item-modal_tag-label">Schedule (choose one)</p>

                    <div className="item-modal_tag-group">
                        {TAGS.filter(tag =>
                            EXCLUSIVE_TAGS.includes(tag as ExclusiveTag)
                        ).map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`item-modal_tag-button
                                    ${formData.tags.includes(tag)
                                        ? getTagColor(tag)
                                        : 'item-modal_tag-button--inactive'}
                                `}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="item-modal_tag-container">

                    <p className="item-modal_tag-label">Options</p>

                    <div className="item-modal_tag-group">
                        {TAGS.filter(tag => tag === PRIORITY_TAG).map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`item-modal_tag-button
                                    item-modal_tag-button--priority
                                    ${formData.tags.includes(tag)
                                        ? 'item-modal_tag-button--priority-active'
                                        : ''}
                                `}
                                title="Can be combined with any schedule"
                            >
                                ⭐ {tag}
                            </button>
                        ))}
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
