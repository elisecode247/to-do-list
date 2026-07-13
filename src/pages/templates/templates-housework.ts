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
    note: string = "",
    parentUuid: string | null = DAILY_CLEANING_ID,
): ChecklistItem {
    const task = templateTaskDefaults(id, text, sortOrder, parentUuid);

    return {
        ...task,
        note,
        mode: "daily",
        tabSortOrder: { today: 0 },
        hasSubChores: parentUuid === null,
    };
}

export const DAILY_CLEANING_TEMPLATE: ChecklistItem[] = [
    dailyCleaningTask(DAILY_CLEANING_ID, "Daily Cleaning", 0,
        `**Good enough counts.** This is a menu, not a requirement to clean everything every day.

Choose what would make your space feel easier to use. Start with the quickest win and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    dailyCleaningTask("c218ba2d-5661-4e7d-af6d-efad18a9102a", "Make beds", 0,
        `Choose the version that helps today:

* [ ] Pull up the covers
* [ ] Straighten the pillows
* [ ] Move anything that does not belong on the bed

**Minimum version:** Pull the covers over the bed. Wrinkles are fine.`
    ),
    dailyCleaningTask("aef8d2fe-c917-4e53-81fd-08c24ce20b13", "Wipe bathroom counters", 1,
        `* [ ] Move loose items into one spot
* [ ] Wipe around the sink and faucet
* [ ] Put back only what you need

**Minimum version:** Wipe one clear, usable section.`
    ),
    dailyCleaningTask("60564a2e-6f6f-43d0-a127-19f353dfdd55", "One load of laundry", 2,
        `* [ ] Choose the load you need most
* [ ] Put it in the washer
* [ ] Add detergent and start the wash
* [ ] Set a reminder to move it
* [ ] Dry or hang the clothes
* [ ] Put them where you can find them

**Minimum version:** Start one load. Folding can be a separate task.`
    ),
    dailyCleaningTask("b1f8d2fe-c917-4e53-81fd-08c24ce20b14", "Wipe kitchen counters", 3,
        `* [ ] Put food away
* [ ] Move loose items into one spot
* [ ] Wipe crumbs, spills, and sticky areas
* [ ] Clear one space for preparing food

**Minimum version:** Wipe the area you need next.`
    ),
    dailyCleaningTask("a3efcf04-220b-441f-8a00-c84444e2a8e4", "Wash dishes and clear kitchen sink", 4,
        `Pick a starting point:

* [ ] Throw away food scraps
* [ ] Load the dishwasher or fill the sink
* [ ] Wash what fits in one batch
* [ ] Start the dishwasher, if using it
* [ ] Rinse or wipe the sink

**Minimum version:** Wash the dishes you need for your next meal.`
    ),
    dailyCleaningTask("4493325e-3c4f-413f-86aa-b85d04859e7d", "Take out trash", 5,
        `* [ ] Tie or close the full bag
* [ ] Put in a new liner
* [ ] Take the bag to the main bin

**Minimum version:** Tie the bag and put it by the door.`
    ),
    dailyCleaningTask("ed2843eb-14da-4748-affd-eb14dd5b2eb5", "Tidy living room", 6,
        `Set a short timer or choose **one visible area**:

* [ ] Throw away obvious trash
* [ ] Put dishes near the sink
* [ ] Put loose items into a basket
* [ ] Clear a place to sit or walk

**Minimum version:** Remove five things that do not belong.

The basket can wait. You do not have to put everything away now.`
    ),
    dailyCleaningTask("5073850f-f890-4cef-905b-737815fddab2", "Sweep kitchen floor in the evening", 7,
        `* [ ] Move only what blocks the floor
* [ ] Sweep visible crumbs and debris
* [ ] Focus on cooking and eating areas
* [ ] Empty the dustpan

**Minimum version:** Sweep the messiest section.`
    ),
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
    bathroomTask(CLEAN_BATHROOMS_ID, "Clean bathrooms", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Choose what needs attention today, start with the easiest item, and stop when you need to.

You can **skip any task** to hide it from Today.`,
        null
    ),
    bathroomTask("gather-supplies", "Gather supplies", 0, 1, FrequencyType.Weekly,
        `Gather supplies:

* [ ] all-purpose bathroom cleaner
* [ ] toilet bowl cleaner
* [ ] glass cleaner
* [ ] floor cleaner
* [ ] a toilet brush
* [ ] rags and/or paper towels
* [ ] no-scratch scrub sponge
* [ ] vacuum or broom
* [ ] mop
* [ ] bucket
* [ ] fan
* [ ] rubber gloves
* [ ] trash bags
* [ ] music or podcast to listen to while cleaning`
    ),
    bathroomTask("108d1b81-acb9-4b5a-89e8-52eea373ab9c", "Clean mirror", 1, 2, FrequencyType.Weekly,
        `* [ ] Spray cleaner onto a cloth
* [ ] Wipe the mirror
* [ ] Dry any visible streaks

**Minimum version:** Wipe the most noticeable spots.`
    ),
    bathroomTask("8f951692-af77-45bb-9142-e551d71b810c", "Clean counters", 2, 1, FrequencyType.Weekly,
        `* [ ] Move loose items into one spot
* [ ] Spray and wipe the counter
* [ ] Put back only what belongs there

**Minimum version:** Clear and wipe one usable section.`
    ),
    bathroomTask("71ff36dd-8666-4bab-97f2-9feeba2a268e", "Clean sink", 3, 1, FrequencyType.Weekly,
        `* [ ] Move items away from the sink
* [ ] Rinse away loose debris
* [ ] Apply cleaner
* [ ] Wipe the basin, faucet, and handles
* [ ] Rinse and dry

**Minimum version:** Wipe the basin and faucet.`
    ),
    bathroomTask("4e16cb16-8ed0-47e8-bc83-fdedade55109", "Clean toilet and toilet bowl", 4, 1, FrequencyType.Weekly,
        `* [ ] Add toilet bowl cleaner
* [ ] Let it sit while cleaning the outside
* [ ] Wipe the handle, lid, seat, rim, and outside
* [ ] Scrub the bowl
* [ ] Flush

**Minimum version:** Clean the seat and flush handle.

> Never mix cleaning products, especially bleach and ammonia.`
    ),
    bathroomTask("620c10fb-7cf5-474c-bac7-7ef603291fb3", "Clean showers and bathtubs", 5, 3, FrequencyType.Weekly,
        `Pick the part that needs attention most:

* [ ] Remove bottles and loose items
* [ ] Spray the tub or shower
* [ ] Let the cleaner sit
* [ ] Scrub visible buildup
* [ ] Rinse
* [ ] Return the items

**Minimum version:** Clean one wall, the tub floor, or the drain area.`
    ),
    bathroomTask("b85c102c-472f-4058-8c72-245019fe3421", "Wash bath rugs", 6, 2, FrequencyType.Weekly,
        `* [ ] Check the care label
* [ ] Put rugs in the washer
* [ ] Set a reminder to move them
* [ ] Dry as directed
* [ ] Return them to the bathroom

**Minimum version:** Start the wash. It is okay to finish the rest later.`
    ),
    bathroomTask("2f808c89-bd76-45ed-ab5a-dcbbb9e243cc", "Replace towels", 7, 1, FrequencyType.Weekly,
        `* [ ] Put used towels in the hamper
* [ ] Hang clean towels
* [ ] Check whether hand towels need replacing

**Minimum version:** Replace the towel you use most.`
    ),
    bathroomTask("89cda339-e3ce-4a17-bac7-bb282d73c258", "Sweep or vacuum floor", 8, 1, FrequencyType.Weekly,
        `* [ ] Move only the items blocking the floor
* [ ] Sweep or vacuum visible debris
* [ ] Return moved items

**Minimum version:** Clean the area around the toilet and sink.`
    ),
    bathroomTask("7e21bace-4049-42d3-b878-f6bfa77716c2", "Mop floor", 9, 2, FrequencyType.Weekly,
        `* [ ] Sweep or vacuum loose debris
* [ ] Prepare the mop
* [ ] Mop from the far corner toward the door
* [ ] Let the floor dry
* [ ] Put the supplies away

**Minimum version:** Spot-clean sticky or visibly dirty areas.`
    ),
    bathroomTask("e4f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Empty trash", 10, 1, FrequencyType.Weekly,
        `* [ ] Remove the full bag
* [ ] Put in a new liner
* [ ] Take the bag to the main trash

**Minimum version:** Tie the bag and place it by the door.`
    ),
    bathroomTask("c1f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Clean bathroom cabinets", 11, 1, FrequencyType.Monthly,
        `Choose **one cabinet or drawer**:

* [ ] Remove obvious trash and empty containers
* [ ] Set aside expired products
* [ ] Wipe the shelf or drawer
* [ ] Put back the items you use

You do not need to organize every cabinet today.`
    ),
    bathroomTask("d4f4f4a4-1f4a-4b4a-8f4a-1f4a4b4a8f4a", "Clean bathroom vents", 12, 1, FrequencyType.Annually,
        `* [ ] Turn off the fan
* [ ] Vacuum dust from the vent cover
* [ ] Wipe the outside with a damp cloth

**Optional deep clean:** Remove and wash the cover only if it is safe and easy to access.

Do not climb on an unstable chair.`
    ),
];
