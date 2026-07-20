import { type ChecklistItem } from "src/app/types";

const now = new Date();
const twoDaysFromNow = new Date(now);
twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

export const DEMO_TASKS: ChecklistItem[] = [
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "1",
        text: "Put your thoughts somewhere safe",
        done: false,
        lastCompleted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        note: "",
        sortOrder: 0,
        tabSortOrder: {},
        category: "self-care",
        mode: "daily",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "2",
        text: "Tap to check something off",
        done: false,
        lastCompleted: "",
        note: "Nothing bad happens if you leave it unfinished.",
        sortOrder: 1,
        tabSortOrder: {},
        category: "work",
        mode: "occasional",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "3",
        text: "Mark one thing as important",
        done: false,
        lastCompleted: "",
        note: "Priority just means this matters a little more today.",
        sortOrder: 2,
        tabSortOrder: {},
        category: "housework",
        mode: "one-time",
        isPriority: true,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "4",
        text: "Break something into smaller steps",
        done: false,
        lastCompleted: "",
        note: "You can add subtasks if a task feels too big.",
        sortOrder: 3,
        tabSortOrder: {},
        category: "people",
        mode: "one-time",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: true,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "5",
        text: "Drag tasks into the order that feels right",
        done: false,
        lastCompleted: "",
        note: "There is no perfect order. Just what helps now.",
        sortOrder: 4,
        tabSortOrder: {},
        category: "work",
        mode: "one-time",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "6",
        text: "Hide this task for today",
        done: false,
        lastCompleted: "",
        note: "Hiding doesn't delete it. It just gives today some breathing room. You can revisit it tomorrow.",
        sortOrder: 5,
        tabSortOrder: {},
        category: "housework",
        mode: "one-time",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: true,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "7",
        text: "Example subtask: choose one tiny next step",
        done: false,
        lastCompleted: "",
        note: "Subtasks help reduce overwhelm.",
        sortOrder: 0,
        tabSortOrder: {},
        category: "people",
        mode: "one-time",
        isPriority: false,
        isArchived: false,
        parentUuid: "4",
        hasSubChores: false,
        isHidden: false,
        recurrence: null,
        nextDue: null
    },
    {
        isOwner: true,
        accessRole: 'owner',
        itemType: 'checklist-item',
        id: "8",
        text: "Example task with due date in two days",
        done: false,
        lastCompleted: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        note: "This demonstrates seeded last-completed and due fields.",
        sortOrder: 6,
        tabSortOrder: {},
        category: "self-care",
        mode: "occasional",
        isPriority: false,
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false,
        recurrence: {
            type: "interval",
            numberOfRepetitions: 1,
            frequency: "daily",
            startDate: '2024-01-01T00:00:00.000Z'
        },
        nextDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // + 2 days
    }
];

function demoTaskSignature(item: ChecklistItem) {
    return JSON.stringify({
        id: item.id,
        text: item.text,
        note: item.note,
        sortOrder: item.sortOrder,
        tabSortOrder: item.tabSortOrder,
        category: item.category,
        mode: item.mode,
        isPriority: item.isPriority,
        isArchived: item.isArchived,
        isHidden: item.isHidden,
        hasSubChores: item.hasSubChores,
        parentUuid: item.parentUuid,
        done: item.done,
        recurrence: item.recurrence && {
            type: item.recurrence.type,
            frequency: 'frequency' in item.recurrence ? item.recurrence.frequency : undefined,
            numberOfRepetitions: 'numberOfRepetitions' in item.recurrence
                ? item.recurrence.numberOfRepetitions
                : undefined,
        },
        hasNextDue: item.nextDue !== null,
    });
}

export function hasModifiedDemoTasks(items: ChecklistItem[]) {
    if (items.length !== DEMO_TASKS.length) return true;

    const originalById = new Map(DEMO_TASKS.map(item => [item.id, demoTaskSignature(item)]));
    return items.some(item => originalById.get(item.id) !== demoTaskSignature(item));
}
