import { type ChecklistItem } from "src/app/types";
import { PRIORITY_TAG } from "src/checklist/constants";

export const DEMO_TASKS: ChecklistItem[] = [
    {
        id: "1",
        text: "Put your thoughts somewhere safe",
        done: false,
        lastCompleted: "",
        note: "",
        sortOrder: 0,
        category: "",
        tags: [],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    },
    {
        id: "2",
        text: "Tap to check something off",
        done: false,
        lastCompleted: "",
        note: "Nothing bad happens if you leave it unfinished.",
        sortOrder: 1,
        category: "",
        tags: [],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    },
    {
        id: "3",
        text: "Mark one thing as important",
        done: false,
        lastCompleted: "",
        note: "Priority just means this matters a little more today.",
        sortOrder: 3,
        category: "",
        tags: [PRIORITY_TAG],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    },
    {
        id: "4",
        text: "Break something into smaller steps",
        done: false,
        lastCompleted: "",
        note: "You can add subtasks if a task feels too big.",
        sortOrder: 4,
        category: "",
        tags: [],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    },
    {
        id: "5",
        text: "Drag tasks into the order that feels right",
        done: false,
        lastCompleted: "",
        note: "There is no perfect order. Just what helps now.",
        sortOrder: 5,
        category: "",
        tags: [],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    },
    {
        id: "6",
        text: "Hide this task for today",
        done: false,
        lastCompleted: "",
        note: "Hiding doesn't delete it. It just gives today some breathing room. You can revisit it tomorrow.",
        sortOrder: 6,
        category: "",
        tags: [],
        isArchived: false,
        parentUuid: null,
        hasSubChores: false,
        isHidden: false
    }
];
