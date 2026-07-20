import type { ChoreAccessRole } from 'src/app/types';

export const canEditTask = (role: ChoreAccessRole): boolean =>
    role === 'owner' || role === 'editor';

export const canCompleteTask = (role: ChoreAccessRole): boolean =>
    role === 'owner' || role === 'editor' || role === 'doer';

export const canDeleteTask = (role: ChoreAccessRole): boolean =>
    role === 'owner';

export const canManageTaskMembers = canDeleteTask;
