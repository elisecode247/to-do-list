import 'src/edit-task-form/edit-task-form.css';
import 'src/task-form/task-form-shared.css';
import CloseButton from 'components/close-button/CloseButton';
import { useForm, FormProvider, type SubmitHandler, useWatch, Controller } from 'react-hook-form';
import type { GoogleEvent } from './types';
import { type FC, useRef } from 'react';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { formatGoogleEventDateTime } from 'src/google-authorization/utilities/format-google-event-date-time';
import { addOneDay } from 'src/google-authorization/utilities/add-one-day';

type FormData = GoogleEvent & {
    startTime: string;
    endTime: string;
}
type EditEventFormProps = {
    isSaving?: boolean;
    formData: GoogleEvent;
    onSave: (item: GoogleEvent) => void;
    onClose: () => void;
};


export const EditEventForm: FC<EditEventFormProps> = ({
    isSaving = false,
    formData,
    onSave,
    onClose,
}) => {
    const defaultValues = {
        ...formData,
        note: formData.description ?? '',
        // The value is always a 24-hour HH:mm or HH:mm:ss formatted time, with leading zeros, regardless of the UI's input format.
        startTime: formData.allDay ? '' : new Date(formData.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: formData.allDay ? '' : new Date(formData.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        // format is 2026-02-31 for date inputs, so strip time portion if present. Google Calendar API will ignore time for all-day events but the form requires a date-only string.
        start: formData.allDay ? formData.start : formData.start.split('T')[0],
        end: formData.allDay ? formData.end : formData.end.split('T')[0],
        allDay: formData.allDay || false,
    };

    const methods = useForm<FormData>({ defaultValues });
    const { register, handleSubmit, control, formState: { errors } } = methods;
    const allDay = useWatch({ control, name: 'allDay' });
    const watchNote = useWatch({ control, name: 'note' });
    const noteRef = useRef<MDXEditorMethods>(null);
    const startTime = useWatch({ control, name: 'startTime' });
    const endTime = useWatch({ control, name: 'endTime' });
    const handleSaveItem: SubmitHandler<GoogleEvent> = async (data) => {
        // if timed event, send full ISO timestamps with timezone/offset rather than plain dates
        const updatedResource = {
            id: formData.id,
            title: data.title,
            description: watchNote,
            start: allDay ? data.start : formatGoogleEventDateTime(data.start, startTime),
            end: allDay ? addOneDay(data.end) : formatGoogleEventDateTime(data.end, endTime),
        };
        onSave(updatedResource as GoogleEvent);
        onClose();
    };


    return (
        <FormProvider {...methods}>
            <form
                className="task-form-drawer edit-item-container"
                onSubmit={handleSubmit(handleSaveItem)}
            >
                <div className="task-form-drawer__header">
                    <h2 className="task-form-drawer__title">Edit Event</h2>
                    <CloseButton onClick={onClose} label="Close edit task form" />
                </div>

                <div className="task-form-drawer__body">
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="edit-task-form-name">Event name</label>
                        <input
                            id="edit-task-form-name"
                            className="task-form-input"
                            type="text"
                            placeholder="Event name"
                            {...register('title', { required: 'Event name is required' })}
                        />
                        {errors.title && <p className="task-form-field__error">{errors.title.message}</p>}
                    </div>
                    <div className="task-form-field">
                        <label className="task-form-field__label">All Day</label>
                        <input
                            id="edit-task-form-all-day"
                            type="checkbox"
                            {...register('allDay')}
                            className="task-form-input task-form-checkbox"
                        />
                    </div>
                    <div className="task-form-field">
                        <label className="task-form-field__label">Starting</label>
                        <input
                            className="task-form-input task-form-recurrence-start-date"
                            type="date"
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            {...register('start', { required: 'Start date is required' })}
                        />
                        {errors.start && <p className="task-form-field__error">{errors.start.message}</p>}
                    </div>
                    {!allDay && (
                        <div className="task-form-field">
                            <label className="task-form-field__label">Starting Time</label>
                            <input
                                className="task-form-input task-form-recurrence-start-date"
                                type="time"
                                {...register('startTime', { required: 'Start time is required' })}
                            />
                            {!allDay && errors.startTime && <p className="task-form-field__error">{errors.startTime.message}</p>}
                        </div>
                    )}
                    <div className="task-form-field">
                        <label className="task-form-field__label">Ending</label>
                        <input
                            className="task-form-input task-form-recurrence-start-date"
                            type="date"
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            {...register('end', { required: 'End date is required' })}
                        />
                        {errors.end && <p className="task-form-field__error">{errors.end.message}</p>}
                    </div>
                    {!allDay && (
                    <div className="task-form-field">
                        <label className="task-form-field__label">Ending Time</label>
                        <input
                            className="task-form-input task-form-recurrence-start-date"
                            type="time"
                            {...register('endTime', { required: 'End time is required' })}
                        />
                        {!allDay && errors.endTime && <p className="task-form-field__error">{errors.endTime.message}</p>}
                    </div>
                    )}
                    <div className="task-form-field">
                        <label className="task-form-field__label">Notes</label>
                        <div className="edit-task-notes-wrap">
                            <Controller
                                name="note"
                                control={control}
                                render={({ field }) => (
                                    <NoteEditor
                                        ref={noteRef}
                                        initialMarkdown={field.value ?? ''}
                                        onChange={field.onChange}
                                        readOnly={false}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="task-form-drawer__footer">

                    {errors.start && (
                        <div className="task-form-drawer__error">
                            {errors.start.message || 'Start date is required'}
                        </div>
                    )}
                    <button
                        className="task-form-action-button task-form-action-button--cancel"
                        onClick={onClose}
                        type="button"
                        aria-label="Close form"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSaving}
                        className="task-form-action-button task-form-action-button--save"
                        type="submit"
                        aria-label="Save changes"
                    >
                        {isSaving ? <span>Saving...</span> : <span>Save</span>}
                    </button>
                </div>
            </form>
        </FormProvider >
    );
};

export default EditEventForm;
