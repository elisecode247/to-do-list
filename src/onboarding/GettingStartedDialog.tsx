import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { FilePlus2, LayoutTemplate } from 'lucide-react';
import './getting-started-dialog.css';

type GettingStartedDialogProps = {
    isOpen: boolean;
    onStartFromScratch: () => void;
    onChooseTemplate: () => void;
};

export default function GettingStartedDialog({
    isOpen,
    onStartFromScratch,
    onChooseTemplate,
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
                    Start with a blank list, or choose a gentle template to give yourself a place to begin.
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
                </div>
            </DialogPanel>
        </Dialog>
    );
}
