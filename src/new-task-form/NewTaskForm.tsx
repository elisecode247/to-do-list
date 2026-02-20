import { useState, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import type { ChecklistItem } from 'app/types';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import { type Mode } from 'app/types';
import './new-task-form.css';
import { ONE_TIME_MODE } from 'src/checklist/constants';
import NoteEditor from 'src/editor/NoteEditor';
import type { MDXEditorMethods } from '@mdxeditor/editor';

const NewTaskForm = () => {
    const { addItem } = useTask();
    const { showToast } = useToast();
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const noteRef = useRef<MDXEditorMethods | null>(null);

    const handleAddItem = async (): Promise<void> => {
        const text = inputText.trim();
        if (!text) return;
        let note = noteRef.current?.getMarkdown()

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text,
            done: false,
            lastCompleted: '',
            note: note ?? '',
            sortOrder: 0,
            tabSortOrder: {},
            category: newTaskCategory,
            categoryUuid: null,
            mode,
            isPriority: false,
            isArchived: false,
            isHidden: false,
            hasSubChores: false,
            parentUuid: null
        };
        try {
            await addItem(newItem);
            showToast('Task added ✨', 'success');
            setInputText('');
            if (noteRef.current) {
                noteRef.current.setMarkdown('');
            }
        } catch (err) {
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    const handleModeClick = (val: Mode): void => {
        setMode(val);
    }

    return  (<>
        <div ref={panelRef} className="new-task-form-item-container">
            <div className="new-task-form-item-header">
                <span className="new-task-form-title">New Task</span>
            </div>
            <FrequencyButtonGroup
                mode={mode}
                onClick={(mode: Mode) => handleModeClick(mode)}
            />
            <CategorySelect
                id="new-task-form-category-select"
                selectedCategory={newTaskCategory}
                onChange={(category: string) => setNewTaskCategory(category)}
            />
            <div className="new-task-form-notes-section">
                <label
                    htmlFor="new-task-form-notes-input"
                    className="new-task-form-notes-label"
                >
                    Notes
                </label>
                <div className="new-task-form-note-container">
                <NoteEditor
                    ref={noteRef}
                    initialMarkdown=""
                    readOnly={false}
                />
                </div>
            </div>
            <div className="new-task-form-input-row">
                <input
                    id="new-task-form-text-input"
                    className="new-task-form-text-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                            handleAddItem();
                        }
                    }}
                    placeholder="New item..."
                />
                <button
                    disabled={isAddButtonDisabled}
                    className={`new-task-form-add-button
                            ${isAddButtonDisabled &&
                        'new-task-form-add-button--disabled'}`
                    }
                    onClick={handleAddItem}
                >
                    Add
                </button>
            </div>
        </div >
    </>);
}
export default NewTaskForm;
