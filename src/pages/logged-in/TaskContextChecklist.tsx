import type { ChecklistController } from 'src/checklist/types';
import type { ChecklistProps } from 'src/checklist/types';
import Checklist from 'src/checklist/Checklist';
import { useTask } from 'src/app/use-task';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import type { ChecklistItem } from 'src/app/types';
import { memo } from 'react';

type TaskContextChecklistProps = Omit<ChecklistProps, "controller"> & {
    items?: ChecklistItem[];
};

function TaskContextChecklist({ items, ...props }: TaskContextChecklistProps) {
    const google = useGoogleCalendar();
    const task = useTask();

    const controller: ChecklistController = {
        isLoading: task.isLoading,
        items: items ?? task.items,
        addItem: task.addItem,
        partialUpdateItem: task.partialUpdateItem,
        deleteItem: task.deleteItem,
        toggleItem: task.toggleItem,
        prioritizeItem: task.prioritizeItem,
        archiveItem: task.archiveItem,
        sortItems: task.sortItems,
        getSubtasks: task.getSubtasks,
        hideForToday: task.hideForToday,
        unhideForToday: task.unhideForToday,
        loadTasks: task.loadTasks,
        events: google.events,
        hideEventForToday: google.hideEventForToday,
        unhideEventForToday: google.unhideEventForToday
    };

    return <Checklist {...props} controller={controller} enablePullToRefresh={props.enablePullToRefresh ?? false} />;
}

export default memo(TaskContextChecklist);
