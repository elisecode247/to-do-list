import { useState } from 'react';
import NewTaskForm from 'src/new-task-form/NewTaskForm';
import NewEventForm from 'src/google-authorization/NewEventForm';
import CloseButton from 'components/close-button/CloseButton';
import 'src/task-form/new-form.css';
import 'src/task-form/task-form-shared.css';
import { ListTodo, CalendarCheck } from 'lucide-react';

type NewFormProps = {
    isDesktop: boolean;
    setRightOpen: (open: boolean) => void;
};

type FormType = 'task' | 'event';

const NewForm = ({ isDesktop, setRightOpen }: NewFormProps) => {
    const [formType, setFormType] = useState<FormType>('task');

    return (
        <div className="task-form-drawer">
            <div className="task-form-drawer__header">
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

                {isDesktop && (
                    <CloseButton
                        onClick={() => setRightOpen(false)}
                        label="Close new task form"
                    />
                )}
            </div>

            {formType === 'task' ? (
                <NewTaskForm setRightOpen={setRightOpen} />
            ) : (
                <NewEventForm setRightOpen={setRightOpen} />
            )}
        </div>
    );
};

export default NewForm;
