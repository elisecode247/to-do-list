import { describe, expect, it } from 'vitest';
import type {
    Active,
    ClientRect,
    CollisionDetection,
    DroppableContainer,
} from '@dnd-kit/core';
import { taskCollisionDetection } from './task-collision-detection';

const rect = (top: number, height = 100): ClientRect => ({
    top,
    bottom: top + height,
    left: 0,
    right: 400,
    width: 400,
    height,
});

const container = (id: string): DroppableContainer => ({
    id,
    key: id,
    disabled: false,
    data: { current: {} },
    node: { current: null },
    rect: { current: null },
});

const runDetection = ({
    draggedTop,
    pointerY = draggedTop + 50,
}: {
    draggedTop: number;
    pointerY?: number | null;
}) => {
    const activeRect = rect(0);
    const droppableRects = new Map<string, ClientRect>([
        ['active', activeRect],
        ['next', rect(100)],
        ['last', rect(200)],
        ['placeholder-parent', rect(320, 80)],
    ]);
    const droppableContainers = [
        container('active'),
        container('next'),
        container('last'),
        container('placeholder-parent'),
    ];
    const active: Active = {
        id: 'active',
        data: { current: {} },
        rect: {
            current: {
                initial: activeRect,
                translated: rect(draggedTop),
            },
        },
    };

    return taskCollisionDetection({
        active,
        collisionRect: rect(draggedTop),
        droppableRects,
        droppableContainers,
        pointerCoordinates: pointerY === null ? null : { x: 200, y: pointerY },
    } as Parameters<CollisionDetection>[0]);
};

describe('taskCollisionDetection', () => {
    it('keeps the active task selected before its center passes the next task center', () => {
        expect(runDetection({ draggedTop: 99 })[0]?.id).toBe('active');
    });

    it('selects the next task once the dragged task center passes its center', () => {
        expect(runDetection({ draggedTop: 100 })[0]?.id).toBe('next');
    });

    it('does not skip ahead to a task whose center has not been passed', () => {
        expect(runDetection({ draggedTop: 199 })[0]?.id).toBe('next');
        expect(runDetection({ draggedTop: 200 })[0]?.id).toBe('last');
    });

    it('prioritizes a subtask dropzone only when the pointer is inside it', () => {
        expect(runDetection({ draggedTop: 275, pointerY: 350 })[0]?.id)
            .toBe('placeholder-parent');
        expect(runDetection({ draggedTop: 275, pointerY: 310 })[0]?.id)
            .toBe('last');
    });
});
