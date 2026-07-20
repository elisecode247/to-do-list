import { describe, expect, test } from 'vitest';
import {
    canCompleteTask,
    canDeleteTask,
    canEditTask,
    canManageTaskMembers,
} from './chore-access';

describe('chore access permissions', () => {
    test('allows owners to perform every task action', () => {
        expect(canEditTask('owner')).toBe(true);
        expect(canCompleteTask('owner')).toBe(true);
        expect(canDeleteTask('owner')).toBe(true);
        expect(canManageTaskMembers('owner')).toBe(true);
    });

    test('allows editors to edit and complete without owner-only actions', () => {
        expect(canEditTask('editor')).toBe(true);
        expect(canCompleteTask('editor')).toBe(true);
        expect(canDeleteTask('editor')).toBe(false);
        expect(canManageTaskMembers('editor')).toBe(false);
    });

    test('limits doers to completion', () => {
        expect(canEditTask('doer')).toBe(false);
        expect(canCompleteTask('doer')).toBe(true);
        expect(canDeleteTask('doer')).toBe(false);
        expect(canManageTaskMembers('doer')).toBe(false);
    });

    test('keeps viewers read-only', () => {
        expect(canEditTask('viewer')).toBe(false);
        expect(canCompleteTask('viewer')).toBe(false);
        expect(canDeleteTask('viewer')).toBe(false);
        expect(canManageTaskMembers('viewer')).toBe(false);
    });
});
