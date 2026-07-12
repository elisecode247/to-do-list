import { FrequencyType, INTERVAL_RECURRENCE, type ChecklistItem } from "src/app/types";

const DAILY_CLEANING_ID = "e52f0220-aff1-4344-b944-a08a4c29a04d";

function dailyCleaningTask(
    id: string,
    text: string,
    sortOrder: number,
    parentUuid: string | null = DAILY_CLEANING_ID,
): ChecklistItem {
    return {
        itemType: "checklist-item",
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: "",
        note: "",
        sortOrder,
        tabSortOrder: { today: 0 },
        category: "housework",
        mode: "daily",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

export const DAILY_CLEANING_TEMPLATE: ChecklistItem[] = [
    dailyCleaningTask(DAILY_CLEANING_ID, "Daily Cleaning", 0, null),
    dailyCleaningTask("c218ba2d-5661-4e7d-af6d-efad18a9102a", "Make beds", 0),
    dailyCleaningTask("aef8d2fe-c917-4e53-81fd-08c24ce20b13", "Wipe bathroom counters", 1),
    dailyCleaningTask("60564a2e-6f6f-43d0-a127-19f353dfdd55", "One load of laundry", 2),
    dailyCleaningTask("b1f8d2fe-c917-4e53-81fd-08c24ce20b14", "Wipe kitchen counters", 3),
    dailyCleaningTask("a3efcf04-220b-441f-8a00-c84444e2a8e4", "Wash dishes and clear kitchen sink", 4),
    dailyCleaningTask("4493325e-3c4f-413f-86aa-b85d04859e7d", "Take out trash", 5),
    dailyCleaningTask("ed2843eb-14da-4748-affd-eb14dd5b2eb5", "Tidy living room", 6),
    dailyCleaningTask("5073850f-f890-4cef-905b-737815fddab2", "Sweep kitchen floor in the evening", 7),
];

const CLEAN_BATHROOMS_ID = "860f2094-b66e-49db-bc97-05bf1bcddeab";

function bathroomTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: typeof FrequencyType.Weekly | typeof FrequencyType.Monthly,
    parentUuid: string | null = CLEAN_BATHROOMS_ID,
): ChecklistItem {
    return {
        itemType: "checklist-item",
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: "",
        note: "Gather supplies: an all-purpose bathroom cleaner, " +
            "toilet bowl cleaner, glass cleaner, a toilet brush, rags and/or " +
            "paper towels, vacuum or broom, mop, and rubber gloves.",
        sortOrder,
        tabSortOrder: { today: 0 },
        category: "housework",
        mode: "occasional",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: {
            type: INTERVAL_RECURRENCE,
            numberOfRepetitions,
            frequency,
            startDate: "",
        },
        nextDue: null,
    };
}

export const CLEAN_BATHROOMS_TEMPLATE: ChecklistItem[] = [
    bathroomTask(CLEAN_BATHROOMS_ID, "Clean bathrooms", 0, 1, FrequencyType.Weekly, null),
    bathroomTask("108d1b81-acb9-4b5a-89e8-52eea373ab9c", "Clean mirror", 0, 2, FrequencyType.Weekly),
    bathroomTask("8f951692-af77-45bb-9142-e551d71b810c", "Clean counters", 1, 1, FrequencyType.Weekly),
    bathroomTask("71ff36dd-8666-4bab-97f2-9feeba2a268e", "Clean sink", 2, 1, FrequencyType.Weekly),
    bathroomTask("4e16cb16-8ed0-47e8-bc83-fdedade55109", "Clean toilet and toilet bowl", 3, 1, FrequencyType.Weekly),
    bathroomTask("620c10fb-7cf5-474c-bac7-7ef603291fb3", "Clean showers and bathtubs", 4, 1, FrequencyType.Monthly),
    bathroomTask("b85c102c-472f-4058-8c72-245019fe3421", "Wash bath rugs", 5, 2, FrequencyType.Weekly),
    bathroomTask("2f808c89-bd76-45ed-ab5a-dcbbb9e243cc", "Replace towels", 6, 1, FrequencyType.Weekly),
    bathroomTask("89cda339-e3ce-4a17-bac7-bb282d73c258", "Sweep floor", 7, 1, FrequencyType.Weekly),
    bathroomTask("7e21bace-4049-42d3-b878-f6bfa77716c2", "Mop floor", 8, 1, FrequencyType.Monthly),
];
