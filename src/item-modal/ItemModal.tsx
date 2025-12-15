import './item-modal.css';
import type { FC } from 'react';
import type { ChecklistItem } from '../app/types';

type ItemModalProps = {
  formData: ChecklistItem;
  setFormData: (item: ChecklistItem) => void;
  onSave: () => void;
  onClose: () => void;
};

export const ItemModal: FC<ItemModalProps> = ({
  formData,
  setFormData,
  onSave,
  onClose,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Task</h2>

        <div className="form-group">
          <label>Task</label>
          <input
            type="text"
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Last Completed</label>
          <input
            type="date"
            value={formData.lastCompleted ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                lastCompleted: e.target.value || '',
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.note ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, note: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
