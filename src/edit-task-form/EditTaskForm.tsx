import 'src/edit-task-form/edit-task-form.css';
import 'src/task-form/task-form-shared.css';
import { useEffect, useMemo, useState, useRef, type FC } from 'react';
import type {
    ChecklistItem,
    ChoreMember,
    ChoreMemberRole,
    Mode,
} from 'app/types';
import { MODES, OCCASIONAL_MODE, ONE_TIME_MODE, DAILY_MODE } from 'checklist/constants';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';
import NoteEditor from 'src/editor/LazyNoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import {
    FrequencyType,
    INTERVAL_RECURRENCE,
    IntervalOptions,
    ONE_TIME_RECURRENCE,
    type IntervalRecurrence,
    type OneTimeRecurrence,
} from 'src/app/types';
import CloseButton from 'components/close-button/CloseButton';
import { useForm, FormProvider, type SubmitHandler, Controller, useWatch } from 'react-hook-form';
import { getDaysAgo } from 'src/utilities/days-ago';
import type { CategoryDefinition } from 'src/category-select/types';
import { useShareTasks, type SharedUser } from 'src/sharing/use-share-tasks';
import {
    getChoreMembers,
    addChoreMember,
    deleteChoreMember,
    updateChoreMemberRole,
} from 'src/app/api';
import {
    canEditTask,
    canManageTaskMembers,
} from 'src/sharing/chore-access';

type EditTaskFormProps = {
    isSaving?: boolean;
    formData: ChecklistItem;
    onSave: (item: ChecklistItem) => void;
    onClose: () => void;
    categories: CategoryDefinition[];
    enableSharing?: boolean;
    canManageSharing?: boolean;
    onMembersChanged?: () => void;
};

type RecurrenceFormValues = {
    startDate: string;
    endDate: string;
    numberOfRepetitions: number;
    isRepeating: boolean;
    frequency: FrequencyType;
};

type EditTaskFormValues = {
    taskName: string;
    category: string;
    lastCompleted: string;
    note: string;
} & RecurrenceFormValues;

export const EditTaskForm: FC<EditTaskFormProps> = ({
    isSaving = false,
    formData,
    onSave,
    onClose,
    categories,
    enableSharing = false,
    canManageSharing = enableSharing,
    onMembersChanged,
}) => {
    const [mode, setMode] = useState<Mode>(formData.mode);
    const [isPriority, setIsPriority] = useState(formData.isPriority);
    const [members, setMembers] = useState<ChoreMember[]>([]);
    const [selectedUserUuid, setSelectedUserUuid] = useState('');
    const [selectedRole, setSelectedRole] = useState<ChoreMemberRole>('editor');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [pendingMemberUuid, setPendingMemberUuid] = useState<string | null>(null);
    const [isLoadingMembers, setIsLoadingMembers] = useState(enableSharing);
    const [memberError, setMemberError] = useState<string | null>(null);
    const canEdit = canEditTask(formData.accessRole);
    const canManageMembers = canManageSharing
        && canManageTaskMembers(formData.accessRole);
    const { sharedUsers } = useShareTasks({ enabled: enableSharing });
    const noteRef = useRef<MDXEditorMethods>(null);
    const recurrence = formData.recurrence;
    const isIntervalRecurrence = recurrence?.type === INTERVAL_RECURRENCE;
    const isOneTimeRecurrence = recurrence?.type === ONE_TIME_RECURRENCE;
    const categoryId = categories.find(category =>
        category.id === formData.category || category.builtInKey === formData.category
    )?.id ?? formData.category;

    const availableSharedUsers = useMemo(
        () => sharedUsers.filter(user =>
            user.status === 'accepted'
            && !members.some(member => member.userUuid === user.uuid)
        ),
        [members, sharedUsers],
    );

    useEffect(() => {
        if (!enableSharing) {
            return;
        }

        let cancelled = false;
        void getChoreMembers(formData.id)
            .then(choreMembers => {
                if (!cancelled) {
                    setMembers(choreMembers);
                    setMemberError(null);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setMemberError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load task members.',
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingMembers(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [enableSharing, formData.id]);

    const defaultValues: EditTaskFormValues = {
        taskName: formData.text,
        category: categoryId,
        lastCompleted: formData.lastCompleted ? formatDate(new Date(formData.lastCompleted)) : '',
        note: formData.note ?? '',
        startDate: recurrence?.startDate ? formatDate(new Date(recurrence.startDate)) : formatDate(new Date()),
        endDate: '',
        numberOfRepetitions: isIntervalRecurrence
            ? (recurrence as IntervalRecurrence).numberOfRepetitions ?? 1
            : 1,
        isRepeating: isOneTimeRecurrence ? false : isIntervalRecurrence,
        frequency: isIntervalRecurrence
            ? (recurrence as IntervalRecurrence).frequency
            : FrequencyType.Weekly
    };

    const methods = useForm<EditTaskFormValues>({ defaultValues });
    const { register, handleSubmit, control, formState: { errors } } = methods;
    const watchNote = useWatch({ control, name: 'note' });
    const watchCategory = useWatch({ control, name: 'category' });
    const handleSaveItem: SubmitHandler<EditTaskFormValues> = async (data) => {
        if (!canEdit) return;

        let recurrence: OneTimeRecurrence | IntervalRecurrence | null = null;
        if (mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
            };
        } else if (mode === DAILY_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: FrequencyType.Daily,
                numberOfRepetitions: 1,
            };
        } else if (mode === OCCASIONAL_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: data.frequency,
                numberOfRepetitions: data.numberOfRepetitions,
            };
        }

        onSave({
            ...formData,
            text: data.taskName,
            category: data.category,
            isPriority,
            mode,
            note: watchNote,
            lastCompleted: data.lastCompleted
                ? new Date(localDateWithNowTime(data.lastCompleted)).toISOString()
                : '',
            recurrence,
        });
        onClose();
    };

    const modeLabel = (m: string) =>
        m === 'one-time' ? 'One-time' : m.charAt(0).toUpperCase() + m.slice(1);

    const getUserLabel = (
        user: Pick<SharedUser, 'displayName' | 'email'> & {
            uuid?: string;
            userUuid?: string;
        },
    ) => user.displayName || user.email || user.uuid || user.userUuid || 'Unknown user';

    const handleAddMember = async () => {
        if (!canManageMembers) return;

        if (!selectedUserUuid) {
            setMemberError('Choose a shared user to add.');
            return;
        }

        setIsAddingMember(true);
        setMemberError(null);

        try {
            const selectedUser = sharedUsers.find(user => user.uuid === selectedUserUuid);
            const membership = await addChoreMember(formData.id, selectedUserUuid, selectedRole);
            const member: ChoreMember = {
                ...membership,
                userUuid: membership.userUuid ?? selectedUserUuid,
                role: membership.role ?? selectedRole,
                choreUuid: membership.choreUuid ?? formData.id,
                displayName: membership.displayName ?? selectedUser?.displayName ?? null,
                avatarUrl: membership.avatarUrl ?? selectedUser?.avatarUrl ?? null,
                email: membership.email ?? selectedUser?.email ?? null,
                createdAt: membership.createdAt ?? new Date().toISOString(),
                updatedAt: membership.updatedAt ?? new Date().toISOString(),
            };

            setMembers(currentMembers => [...currentMembers, member]);
            setSelectedUserUuid('');
            onMembersChanged?.();
        } catch (error) {
            setMemberError(error instanceof Error ? error.message : 'Failed to add task member.');
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleChangeMemberRole = async (
        member: ChoreMember,
        role: ChoreMemberRole,
    ) => {
        if (!canManageMembers) return;

        setPendingMemberUuid(member.userUuid);
        setMemberError(null);

        try {
            const updatedMember = await updateChoreMemberRole(
                formData.id,
                member.userUuid,
                role,
            );
            setMembers(currentMembers => currentMembers.map(currentMember =>
                currentMember.userUuid === member.userUuid
                    ? {
                        ...currentMember,
                        ...updatedMember,
                        userUuid: updatedMember.userUuid ?? member.userUuid,
                        role: updatedMember.role ?? role,
                    }
                    : currentMember
            ));
            onMembersChanged?.();
        } catch (error) {
            setMemberError(
                error instanceof Error ? error.message : 'Failed to update task member.',
            );
        } finally {
            setPendingMemberUuid(null);
        }
    };

    const handleDeleteMember = async (member: ChoreMember) => {
        if (!canManageMembers) return;

        setPendingMemberUuid(member.userUuid);
        setMemberError(null);

        try {
            await deleteChoreMember(formData.id, member.userUuid);
            setMembers(currentMembers =>
                currentMembers.filter(currentMember =>
                    currentMember.userUuid !== member.userUuid
                )
            );
            onMembersChanged?.();
        } catch (error) {
            setMemberError(
                error instanceof Error ? error.message : 'Failed to remove task member.',
            );
        } finally {
            setPendingMemberUuid(null);
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                className="task-form-drawer edit-item-container"
                onSubmit={handleSubmit(handleSaveItem)}
            >
                <div className="task-form-drawer__header">
                    <h2 className="task-form-drawer__title">
                        {canEdit ? 'Edit task' : 'View task'}
                    </h2>
                    <CloseButton onClick={onClose} label="Close edit task form" />
                </div>

                <div className="task-form-drawer__body">
                    {!canEdit && (
                        <p className="edit-task-read-only-message" role="status">
                            Editing requires owner or editor access.
                        </p>
                    )}
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="edit-task-form-name">Task name</label>
                        <input
                            {...register('taskName', { required: true })}
                            id="edit-task-form-name"
                            className="task-form-input"
                            type="text"
                            placeholder="Task name"
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Category</label>
                        <div className="task-form-category-wrap">
                            <CategorySelect
                                id={formData.id}
                                categories={categories}
                                selectedCategory={watchCategory}
                                onChange={(value) => methods.setValue('category', value)}
                                disabled={!canEdit}
                            />
                        </div>
                    </div>

                    <div className="task-form-field">
                        <div className="task-form-section-divider">Schedule</div>
                        <div className="edit-task-chip-row">
                            {MODES.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMode(m)}
                                    disabled={!canEdit}
                                    className={`edit-task-chip ${mode === m ? 'edit-task-chip--active' : ''}`}
                                >
                                    {modeLabel(m)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {mode === OCCASIONAL_MODE && (
                        <div className="task-form-field">
                            <label
                                htmlFor={`edit-task-form_recurrence-count-${formData.id}`}
                                className="task-form-field__label"
                            >
                                Repeat every
                            </label>
                            <div className="task-form-inline-row">
                                <input
                                    {...register('numberOfRepetitions', { valueAsNumber: true, min: 1 })}
                                    id={`edit-task-form_recurrence-count-${formData.id}`}
                                    className="task-form-input task-form-recurrence-count"
                                    type="number"
                                    min={1}
                                    max={1000}
                                    disabled={!canEdit}
                                />
                                <select
                                    {...register('frequency')}
                                    className="task-form-input task-form-select task-form-recurrence-frequency"
                                    disabled={!canEdit}
                                >
                                    {IntervalOptions.map(option => (
                                        <option key={option.key} value={option.key}>{option.title}(s)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="task-form-field">
                        <label className="task-form-field__label">Starting</label>
                        <input
                            {...register('startDate')}
                            className="task-form-input task-form-recurrence-start-date"
                            type="date"
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            disabled={!canEdit}
                        />
                    </div>
                    <div className="task-form-field">
                        <label className="task-form-field__label">Last completed</label>
                        <input
                            {...register('lastCompleted')}
                            className="task-form-input"
                            type="date"
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            disabled={!canEdit}
                        />
                    </div>
                    <div className="task-form-field">
                        <div className="task-form-section-divider">Sharing</div>
                        <span className="task-form-field__label">Task members</span>
                        {isLoadingMembers ? (
                            <p className="edit-task-sharing__empty">Loading task members…</p>
                        ) : members.length > 0 ? (
                            <ul className="edit-task-member-list">
                                {members.map(member => (
                                    <li
                                        className="edit-task-member"
                                        key={member.userUuid}
                                    >
                                        {member.avatarUrl ? (
                                            <img
                                                className="edit-task-member__avatar"
                                                src={member.avatarUrl}
                                                alt=""
                                            />
                                        ) : (
                                            <span
                                                aria-hidden="true"
                                                className="edit-task-member__avatar edit-task-member__avatar--fallback"
                                            >
                                                {(member.displayName
                                                    || member.email
                                                    || '?').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <span className="edit-task-member__identity">
                                            <span className="edit-task-member__name">
                                                {getUserLabel(member)}
                                            </span>
                                            {member.displayName && member.email && (
                                                <span className="edit-task-member__email">
                                                    {member.email}
                                                </span>
                                            )}
                                        </span>
                                        {canManageMembers ? (
                                            <span className="edit-task-member__actions">
                                                <select
                                                    aria-label={`Role for ${
                                                        getUserLabel(member)
                                                    }`}
                                                    className="task-form-input task-form-select edit-task-member__role-select"
                                                    value={member.role}
                                                    onChange={event => void handleChangeMemberRole(
                                                        member,
                                                        event.target.value as ChoreMemberRole,
                                                    )}
                                                    disabled={pendingMemberUuid !== null}
                                                >
                                                    <option value="editor">Editor</option>
                                                    <option value="doer">Doer</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                                <button
                                                    aria-label={`Remove ${
                                                        getUserLabel(member)
                                                    } from task`}
                                                    className="edit-task-member__remove"
                                                    type="button"
                                                    onClick={() => void handleDeleteMember(member)}
                                                    disabled={pendingMemberUuid !== null}
                                                >
                                                    {pendingMemberUuid === member.userUuid
                                                        ? 'Working…'
                                                        : 'Remove'}
                                                </button>
                                            </span>
                                        ) : (
                                            <span className="edit-task-member__role">{member.role}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="edit-task-sharing__empty">Only you have access to this task.</p>
                        )}

                        {canManageMembers && (
                            <div className="edit-task-sharing__add">
                                <label
                                    className="task-form-field__label"
                                    htmlFor={`edit-task-member-user-${formData.id}`}
                                >
                                    Add a shared user
                                </label>
                                <select
                                    id={`edit-task-member-user-${formData.id}`}
                                    className="task-form-input task-form-select"
                                    value={selectedUserUuid}
                                    onChange={event => {
                                        setSelectedUserUuid(event.target.value);
                                        setMemberError(null);
                                    }}
                                    disabled={
                                        isAddingMember
                                        || pendingMemberUuid !== null
                                        || availableSharedUsers.length === 0
                                    }
                                >
                                    <option value="">
                                        {availableSharedUsers.length > 0
                                            ? 'Choose a user'
                                            : 'No other accepted shared users'}
                                    </option>
                                    {availableSharedUsers.map(user => (
                                        <option key={user.uuid} value={user.uuid}>
                                            {getUserLabel(user)}
                                        </option>
                                    ))}
                                </select>
                                <div className="edit-task-sharing__controls">
                                    <select
                                        aria-label="Member role"
                                        className="task-form-input task-form-select edit-task-sharing__role"
                                        value={selectedRole}
                                        onChange={event =>
                                            setSelectedRole(event.target.value as ChoreMemberRole)
                                        }
                                        disabled={isAddingMember || pendingMemberUuid !== null}
                                    >
                                        <option value="editor">Editor</option>
                                        <option value="doer">Doer</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <button
                                        className="task-form-action-button edit-task-sharing__add-button"
                                        type="button"
                                        onClick={() => void handleAddMember()}
                                        disabled={
                                            isAddingMember
                                            || pendingMemberUuid !== null
                                            || !selectedUserUuid
                                        }
                                    >
                                        {isAddingMember ? 'Adding…' : 'Add'}
                                    </button>
                                </div>
                                {memberError && (
                                    <p className="task-form-drawer__error" role="alert">
                                        {memberError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="task-form-field">
                        <div className="task-form-section-divider">Options</div>
                        <button
                            type="button"
                            onClick={() => setIsPriority(p => !p)}
                            disabled={!canEdit}
                            className={`edit-task-priority ${isPriority ? 'edit-task-priority--active' : ''}`}
                            title="Prioritize this task"
                        >
                            <span className="edit-task-priority_icon">{isPriority ? '★' : '☆'}</span>
                            Priority
                        </button>
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Notes</label>
                        <div className="edit-task-notes-wrap">
                            <Controller
                                name="note"
                                control={control}
                                render={({ field }) => (
                                    <NoteEditor
                                        ref={noteRef}
                                        initialMarkdown={field.value}
                                        onChange={canEdit ? field.onChange : undefined}
                                        readOnly={!canEdit}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="task-form__info">
                        {formData.createdAt && (
                            <div className="task-form__info-item">
                                <span className="task-form__info-label">Created: {' '}
                                    {new Date(formData.createdAt).toLocaleString()}{' '}
                                    {getDaysAgo(new Date(formData.createdAt), false)}
                                </span>
                            </div>
                        )}
                        {formData.updatedAt && (
                            <div className="task-form__info-item">
                                <span className="task-form__info-label">Last Updated: {' '}
                                    {new Date(formData.updatedAt).toLocaleString()}{' '}
                                    {getDaysAgo(new Date(formData.updatedAt), false)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="task-form-drawer__footer">
                    {errors.taskName && (
                        <div className="task-form-drawer__error">
                            {errors.taskName.message || 'Task name is required'}
                        </div>
                    )}
                    {errors.startDate && (
                        <div className="task-form-drawer__error">
                            {errors.startDate.message || 'Start date is required'}
                        </div>
                    )}
                    {errors.endDate && (
                        <div className="task-form-drawer__error">
                            {errors.endDate.message || 'End date is invalid'}
                        </div>
                    )}
                    {errors.numberOfRepetitions && (
                        <div className="task-form-drawer__error">
                            {errors.numberOfRepetitions.message || 'Number of repetitions is invalid'}
                        </div>
                    )}
                    {errors.frequency && (
                        <div className="task-form-drawer__error">
                            {errors.frequency.message || 'Frequency is required'}
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
                        disabled={isSaving || !canEdit}
                        className="task-form-action-button task-form-action-button--save"
                        type="submit"
                        aria-label="Save changes"
                    >
                        {isSaving ? <span>Saving...</span> : <span>Save</span>}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};

export default EditTaskForm;
