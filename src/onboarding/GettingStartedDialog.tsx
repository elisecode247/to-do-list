import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { FilePlus2, LayoutTemplate, ListChecks } from 'lucide-react';
import './getting-started-dialog.css';

type GettingStartedDialogProps = {
    isOpen: boolean;
    onStartFromScratch: () => void;
    onChooseTemplate: () => void;
    onStartWithDemoTasks: () => void;
    onCopyDemoTasks?: () => void;
    isCopyingDemoTasks?: boolean;
};

export default function GettingStartedDialog({
    isOpen,
    onStartFromScratch,
    onChooseTemplate,
    onStartWithDemoTasks,
    onCopyDemoTasks,
    isCopyingDemoTasks = false,
}: GettingStartedDialogProps) {
    return (
        <Dialog open={isOpen} onClose={() => undefined} className="getting-started-dialog">
            <DialogBackdrop className="getting-started-dialog__backdrop" />
            <DialogPanel className="getting-started-dialog__panel">
                <p className="getting-started-dialog__eyebrow">Welcome to Daily Reset List</p>
                <DialogTitle className="getting-started-dialog__title">
                    How would you like to begin?
                </DialogTitle>
                <Description className="getting-started-dialog__description">
                    Start with a blank list, a gentle template, or a sample list to explore how it works.
                </Description>
                <div className="getting-started-dialog__choices">
                    <button type="button" className="getting-started-dialog__choice" onClick={onStartFromScratch}>
                        <FilePlus2 aria-hidden="true" size={22} />
                        <span>
                            <strong>Start from scratch</strong>
                            <small>Add the first thing you want to remember.</small>
                        </span>
                    </button>
                    <button type="button" className="getting-started-dialog__choice" onClick={onChooseTemplate}>
                        <LayoutTemplate aria-hidden="true" size={22} />
                        <span>
                            <strong>Choose a template</strong>
                            <small>Begin with a ready-made routine and make it your own.</small>
                        </span>
                    </button>
                    <button type="button" className="getting-started-dialog__choice" onClick={onStartWithDemoTasks}>
                        <ListChecks aria-hidden="true" size={22} />
                        <span>
                            <strong>Start with demo tasks</strong>
                            <small>Explore a guided sample list before making it your own.</small>
                        </span>
                    </button>
                    {onCopyDemoTasks && (
                        <button
                            type="button"
                            className="getting-started-dialog__choice"
                            onClick={onCopyDemoTasks}
                            disabled={isCopyingDemoTasks}
                        >
                            <ListChecks aria-hidden="true" size={22} />
                            <span>
                                <strong>{isCopyingDemoTasks ? 'Copying demo tasks…' : 'Copy my demo tasks'}</strong>
                                <small>Bring the changes you made in the demo into this account.</small>
                            </span>
                        </button>
                    )}
                </div>
            </DialogPanel>
        </Dialog>
    );
}
