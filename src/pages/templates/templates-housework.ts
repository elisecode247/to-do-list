import { FrequencyType, INTERVAL_RECURRENCE, type ChecklistItem } from "src/app/types";

const DAILY_CLEANING_ID = "e52f0220-aff1-4344-b944-a08a4c29a04d";

function templateTaskDefaults(
    id: string,
    text: string,
    sortOrder: number,
    parentUuid: string | null,
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

function dailyCleaningTask(
    id: string,
    text: string,
    sortOrder: number,
    parentUuid: string | null = DAILY_CLEANING_ID,
): ChecklistItem {
    const task = templateTaskDefaults(id, text, sortOrder, parentUuid);

    return {
        ...task,
        mode: "daily",
        tabSortOrder: { today: 0 },
        hasSubChores: parentUuid === null,
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
    frequency: FrequencyType,
    note: string = "",
    parentUuid: string | null = CLEAN_BATHROOMS_ID,
): ChecklistItem {
    const task = templateTaskDefaults(id, text, sortOrder, parentUuid);
    const recurrence = {
        type: INTERVAL_RECURRENCE,
        numberOfRepetitions,
        frequency,
        startDate: "",
    } as const;

    return {
        ...task,
        note,
        mode: "occasional",
        tabSortOrder: { today: 0 },
        hasSubChores: parentUuid === null,
        recurrence,
    };
}

export const CLEAN_BATHROOMS_TEMPLATE: ChecklistItem[] = [
    bathroomTask(CLEAN_BATHROOMS_ID, "Clean bathrooms", 0, 1, FrequencyType.Weekly, "", null),
    bathroomTask("gather-supplies", "Gather supplies (see notes)", 0, 1, FrequencyType.Weekly,
        "Gather supplies:\n1\\) an all-purpose bathroom cleaner " +
        "\n2\\) toilet bowl cleaner \n3\\) glass cleaner \n4\\) a toilet brush \n5\\) rags and/or " +
        "paper towels \n6\\) no-scratch scrub sponge \n7\\) vacuum or broom" +
        "\n8\\) mop \n9\\) bucket \n10\\) fan \n11\\) rubber gloves \n12\\) trash bags \n13\\) " +
        "music or podcast to listen to while cleaning"
    ),
    bathroomTask("108d1b81-acb9-4b5a-89e8-52eea373ab9c", "Clean mirror", 1, 2, FrequencyType.Weekly),
    bathroomTask("8f951692-af77-45bb-9142-e551d71b810c", "Clean counters", 2, 1, FrequencyType.Weekly),
    bathroomTask("71ff36dd-8666-4bab-97f2-9feeba2a268e", "Clean sink", 3, 1, FrequencyType.Weekly),
    bathroomTask("4e16cb16-8ed0-47e8-bc83-fdedade55109", "Clean toilet and toilet bowl", 4, 1, FrequencyType.Weekly),
    bathroomTask("620c10fb-7cf5-474c-bac7-7ef603291fb3", "Clean showers and bathtubs", 5, 3, FrequencyType.Weekly),
    bathroomTask("b85c102c-472f-4058-8c72-245019fe3421", "Wash bath rugs", 6, 2, FrequencyType.Weekly),
    bathroomTask("2f808c89-bd76-45ed-ab5a-dcbbb9e243cc", "Replace towels", 7, 1, FrequencyType.Weekly),
    bathroomTask("89cda339-e3ce-4a17-bac7-bb282d73c258", "Sweep or vacuum floor", 8, 1, FrequencyType.Weekly),
    bathroomTask("7e21bace-4049-42d3-b878-f6bfa77716c2", "Mop floor", 9, 2, FrequencyType.Weekly),
    bathroomTask("e4f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Empty Trash", 10, 1, FrequencyType.Weekly),
    bathroomTask("c1f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Clean bathroom cabinets", 11, 1, FrequencyType.Monthly),
    bathroomTask("d4f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Clean bathroom vents", 12, 1, FrequencyType.Annually),
];
