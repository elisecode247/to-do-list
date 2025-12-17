import './item-modal.css';
import type { FC } from 'react';
import type { ChecklistItem } from '../app/types';

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
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Task</h2>

        <div className="form-group">
          <label htmlFor="task-text">Task</label>
          <input
            id="task-text"
            type="text"
            value={formData.text}
            onChange={(e) =>
              setEditingItem({ ...formData, text: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Last Completed</label>
          <input
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
          <label>Notes</label>
          <textarea
            value={formData.note}
            onChange={(e) =>
              setEditingItem({ ...formData, note: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} type="button" aria-label="Close modal">
            Cancel
          </button>
          <button className="btn-primary" onClick={onSave} type="button" aria-label="Save changes">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
