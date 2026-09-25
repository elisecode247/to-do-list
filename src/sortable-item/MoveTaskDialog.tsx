import { useMemo, useState, type SyntheticEvent } from 'react';
import {
    Description,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import type { ChecklistItem } from 'src/app/types';
import { getMoveTaskOptions } from './utilities/get-move-task-options';
import './move-task-dialog.css';

type MoveTaskDialogProps = {
    isOpen: boolean;
    taskId: string;
    taskName: string;
    parentUuid: string | null;
    itemLookup: ReadonlyMap<string, ChecklistItem>;
    onClose: () => void;
    onMove: (parentUuid: string | null) => Promise<void> | void;
};


export function MoveTaskDialog({
    isOpen,
    taskId,
    taskName,
    parentUuid,
    itemLookup,
    onClose,
    onMove,
}: MoveTaskDialogProps) {
    const [selectedParentUuid, setSelectedParentUuid] = useState(parentUuid ?? '');
    const [isMoving, setIsMoving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const options = useMemo(
        () => getMoveTaskOptions(itemLookup, taskId),
        [itemLookup, taskId],
    );
    const hasChanged = selectedParentUuid !== (parentUuid ?? '');
    const selectedDestination = selectedParentUuid
        ? options.find(option => option.id === selectedParentUuid)?.label ?? 'Unknown task'
        : 'Top level';

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault();
        if (!hasChanged || isMoving) return;

        setIsMoving(true);
        setErrorMessage(null);
        try {
            await onMove(selectedParentUuid || null);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error && error.message
                    ? error.message
                    : 'Failed to move task. Please try again.',
            );
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={isMoving ? () => undefined : onClose} className="move-task-dialog">
            <DialogBackdrop className="move-task-dialog__backdrop" />
            <div className="move-task-dialog__layout">
                <DialogPanel className="move-task-dialog__panel">
                    <DialogTitle className="move-task-dialog__title">
                        Move “{taskName}”
                    </DialogTitle>
                    <Description className="move-task-dialog__description">
                        Choose the task this should appear under. It will be placed at the end of that group.
                    </Description>
                    <form onSubmit={handleSubmit}>
                        <label
                            className="move-task-dialog__label"
                            htmlFor={`move-task-destination-${taskId}`}
                        >
                            Move to
                        </label>
                        <Listbox
                            value={selectedParentUuid}
                            onChange={(value: string) => {
                                setSelectedParentUuid(value);
                                setErrorMessage(null);
                            }}
                            disabled={isMoving}
                        >
                            <ListboxButton
                                id={`move-task-destination-${taskId}`}
                                className="move-task-dialog__select"
                            >
                                <span className="move-task-dialog__selected-value">
                                    {selectedDestination}
                                </span>
                                <span className="move-task-dialog__chevron" aria-hidden="true">
                                    ▾
                                </span>
                            </ListboxButton>
                            <ListboxOptions
                                anchor={{
                                    to: 'bottom start',
                                    gap: 'var(--spacing-xs)',
                                    padding: 'var(--spacing-sm)',
                                }}
                                className="move-task-dialog__options"
                            >
                                <ListboxOption
                                    className={({ active, selected }) =>
                                        `move-task-dialog__option ${active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`
                                    }
                                    value=""
                                >
                                    Top level
                                </ListboxOption>
                                {options.map(option => (
                                    <ListboxOption
                                        key={option.id}
                                        className={({ active, selected }) =>
                                            `move-task-dialog__option ${active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`
                                        }
                                        value={option.id}
                                    >
                                        {option.label}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                        {errorMessage && (
                            <p className="move-task-dialog__error" role="alert">
                                {errorMessage}
                            </p>
                        )}
                        <div className="move-task-dialog__actions">
                            <button
                                className="move-task-dialog__button"
                                type="button"
                                onClick={onClose}
                                disabled={isMoving}
                            >
                                Cancel
                            </button>
                            <button
                                className="move-task-dialog__button move-task-dialog__button--primary"
                                type="submit"
                                disabled={!hasChanged || isMoving}
                            >
                                {isMoving ? 'Moving…' : 'Move'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
