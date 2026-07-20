import { useState } from 'react';
import NewTaskForm from 'src/new-task-form/NewTaskForm';
import NewEventForm from 'src/google-authorization/NewEventForm';
import CloseButton from 'components/close-button/CloseButton';
import 'src/task-form/new-form.css';
import 'src/task-form/task-form-shared.css';
import { ListTodo, CalendarCheck } from 'lucide-react';
import type { CategoryDefinition } from 'src/category-select/types';

type NewFormProps = {
    isDesktop: boolean;
    setRightOpen: (open: boolean) => void;
    categories: CategoryDefinition[];
};

type FormType = 'task' | 'event';

const NewForm = ({ setRightOpen, categories }: NewFormProps) => {
    const [formType, setFormType] = useState<FormType>('task');

    return (
        <div className="task-form-drawer">
            <div className="task-form-drawer__header">
                <h2 className="task-form-drawer__title">New item</h2>
                <CloseButton
                    onClick={() => setRightOpen(false)}
                    label="Close new item form"
                />
            </div>

            <div
                className="form-type-toggle"
                role="tablist"
                aria-label="Create type"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={formType === 'task'}
                    className={`form-type-toggle__btn${formType === 'task' ? ' form-type-toggle__btn--active' : ''}`}
                    onClick={() => setFormType('task')}
                >
                    <ListTodo className="form-type-toggle__icon" />
                    Task
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={formType === 'event'}
                    className={`form-type-toggle__btn${formType === 'event' ? ' form-type-toggle__btn--active' : ''}`}
                    onClick={() => setFormType('event')}
                >
                    <CalendarCheck className="form-type-toggle__icon" />
                    Event
                </button>
            </div>

            {formType === 'task' ? (
                <NewTaskForm setRightOpen={setRightOpen} categories={categories} />
            ) : (
                <NewEventForm setRightOpen={setRightOpen} />
            )}
        </div>
    );
};

export default NewForm;
