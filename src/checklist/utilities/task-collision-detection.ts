import {
    closestCenter,
    pointerWithin,
    rectIntersection,
    type CollisionDetection,
} from '@dnd-kit/core';

const PLACEHOLDER_PREFIX = 'placeholder-';

const isSubtaskDropzone = (id: string | number) =>
    String(id).startsWith(PLACEHOLDER_PREFIX);

const centerY = ({ top, height }: { top: number; height: number }) =>
    top + height / 2;

/**
 * Keeps explicit subtask dropzones precise while delaying list reordering until
 * the dragged task's center has passed the center of another task.
 */
export const taskCollisionDetection: CollisionDetection = (args) => {
    const subtaskDropzones = args.droppableContainers.filter(({ id }) =>
        isSubtaskDropzone(id)
    );

    const subtaskCollisions = args.pointerCoordinates
        ? pointerWithin({ ...args, droppableContainers: subtaskDropzones })
        : rectIntersection({ ...args, droppableContainers: subtaskDropzones });

    if (subtaskCollisions.length > 0) return subtaskCollisions;

    const sortableContainers = args.droppableContainers.filter(({ id }) =>
        !isSubtaskDropzone(id)
    );
    const initialRect = args.active.rect.current.initial;

    if (!initialRect) {
        return closestCenter({ ...args, droppableContainers: sortableContainers });
    }

    const initialCenter = centerY(initialRect);
    const draggedCenter = centerY(args.collisionRect);
    const movingDown = draggedCenter > initialCenter;
    const movingUp = draggedCenter < initialCenter;

    const crossedContainers = sortableContainers.filter(({ id }) => {
        if (id === args.active.id) return true;

        const rect = args.droppableRects.get(id);
        if (!rect) return false;

        const targetCenter = centerY(rect);

        if (movingDown) {
            return targetCenter > initialCenter && targetCenter <= draggedCenter;
        }

        if (movingUp) {
            return targetCenter < initialCenter && targetCenter >= draggedCenter;
        }

        return false;
    });

    return closestCenter({ ...args, droppableContainers: crossedContainers });
};
