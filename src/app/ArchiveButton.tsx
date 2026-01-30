import { type FC } from 'react';
import { Archive, FolderArchive } from 'lucide-react';
import type { ChecklistItem } from 'app/types';

interface ToggleChecklistButtonProps {
    isActiveList: boolean;
    editingItem?: ChecklistItem | null;
    onToggle: () => void;
}
const ToggleChecklistButton: FC<ToggleChecklistButtonProps> = ({
    isActiveList,
    editingItem,
    onToggle,
}) => {
    const isArchivedView = isActiveList;
    const buttonId = isArchivedView ? 'see-archived-data' : 'see-active-checklist';
    const buttonClass = isArchivedView
        ? 'app_see-archived-checklist-button'
        : 'app_see-active-checklist-button';
    const buttonTitle = isArchivedView ? 'See Archived Items' : 'See Active Checklist';
    const buttonText = isArchivedView ? 'See Archived Checklist' : 'See Active Checklist';

    return (
        <button
            id={buttonId}
            className={buttonClass}
            onClick={onToggle}
            disabled={!!editingItem}
            title={buttonTitle}
        >
            {isArchivedView ? <Archive size={12} /> : <FolderArchive size={12} />}
            <span className="app_see-archived-checklist-text">
                &nbsp; {buttonText}
            </span>
        </button>
    );
};

export default ToggleChecklistButton;
