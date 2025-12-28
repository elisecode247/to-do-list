import 'item-modal/item-modal.css';
import { useEffect, useEffectEvent, useRef, type FC } from 'react';
import type { ChecklistItem } from 'app/types';

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

    first?.focus();

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
            value={formData.lastCompleted ?? ''}
            onChange={(e) =>
              setEditingItem({
                ...formData,
                lastCompleted: e.target.value || '',
              })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.note}
            onChange={(e) =>
              setEditingItem({ ...formData, note: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            Cancel
          </button>
          <button
            className="btn-primary"
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
