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

const CLEAN_LIVING_ROOM_ID = "447e850d-d2bb-4d44-b32c-11fb60098c51";

function livingRoomTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CLEAN_LIVING_ROOM_ID,
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

export const CLEAN_LIVING_ROOM_TEMPLATE: ChecklistItem[] = [
    livingRoomTask(CLEAN_LIVING_ROOM_ID, "Clean living room", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Choose what would make the room easier or more comfortable to use. Start with the quickest win and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    livingRoomTask("5b722ab8-cb66-4052-8541-26eaec3e6707", "Gather supplies", 0, 1, FrequencyType.Weekly,
        `Gather only what you plan to use:

* [ ] trash bag
* [ ] basket or box for items from other rooms
* [ ] laundry hamper
* [ ] microfiber cloth or duster
* [ ] all-purpose cleaner
* [ ] electronics-safe cloth
* [ ] broom, vacuum, or mop for your floor type
* [ ] stable step stool, if needed
* [ ] music, podcast, or other pleasant background sound

**Minimum version:** Grab a trash bag and one cleaning cloth.`
    ),
    livingRoomTask("bf72a066-061f-4329-aad1-b4280d473c27", "Throw away trash", 1, 1, FrequencyType.Weekly,
        `Focus only on obvious trash:

* [ ] Pick up wrappers, tissues, and empty containers
* [ ] Check beside and underneath seating
* [ ] Put dishes near the sink
* [ ] Take out the bag if it is full

**Minimum version:** Fill your hands once, throw those items away, and stop.`
    ),
    livingRoomTask("18a62a57-0745-4b03-a51d-82cfa305f37d", "Declutter and reset the room", 2, 1, FrequencyType.Weekly,
        `Work by **type**, not by the whole room:

* [ ] Put clothes in the hamper
* [ ] Stack or shelve books and magazines
* [ ] Fold or drape blankets
* [ ] Put living-room items back in their homes
* [ ] Place items from other rooms into one basket
* [ ] Clear a comfortable place to sit and a safe path to walk

**Minimum version:** Choose one category or clear one seat.

The basket can wait. Returning everything to other rooms can be a separate task.`
    ),
    livingRoomTask("96d5d76f-aa36-4903-8b96-63a865c55d97", "Launder throw blankets and pillow covers", 3, 1, FrequencyType.Weekly,
        `* [ ] Choose one washable load
* [ ] Check the care labels
* [ ] Remove pillow covers, if applicable
* [ ] Start the washer
* [ ] Set a reminder to move the load
* [ ] Dry as directed
* [ ] Return clean items to the living room

**Minimum version:** Wash the item that needs it most.

Wash pillow inserts only when their care labels say they are machine washable.`
    ),
    livingRoomTask("3808f908-f4dd-4404-8e6a-756408f2be37", "Dust from top to bottom", 4, 1, FrequencyType.Weekly,
        `Choose one level or area at a time:

* [ ] Ceiling corners and reachable vents
* [ ] Ceiling fan blades
* [ ] Shelves and picture frames
* [ ] Electronics
* [ ] Baseboards

Work from high surfaces to low ones so fallen dust can be cleaned last.

**Minimum version:** Dust the most visible surface or one shelf.

> Turn off ceiling fans before cleaning. Use a stable step stool, and spray cleaner onto a cloth—not directly onto electronics.`
    ),
    livingRoomTask("c5aa20d0-6590-430f-b11b-e8d49959f977", "Wipe the coffee table and lamps", 5, 1, FrequencyType.Weekly,
        `* [ ] Move loose items into one spot
* [ ] Wipe the coffee table
* [ ] Wipe lamp bases and shades as appropriate
* [ ] Put back only what belongs there

**Minimum version:** Wipe the sticky or most visible spots.

Spray cleaner onto the cloth, not onto lamps or electrical parts.`
    ),
    livingRoomTask("b4240df1-4b24-4db8-865e-d6138fbd85b8", "Clean the floors", 6, 1, FrequencyType.Weekly,
        `Choose what matches your floor:

* [ ] Move only items blocking the floor
* [ ] Sweep hard floors or edges
* [ ] Vacuum rugs, carpet, or hard floors
* [ ] Mop hard floors if needed
* [ ] Empty the dustpan or vacuum bin

**Minimum version:** Clean the main walking path or the messiest section.

You do not need to sweep, vacuum, **and** mop every floor.`
    ),
    livingRoomTask("c276e9d3-a6c7-484d-82aa-b62e7726cc20", "Vacuum the couch", 7, 1, FrequencyType.Weekly,
        `* [ ] Remove blankets and loose items
* [ ] Vacuum the seat and back cushions
* [ ] Vacuum visible crumbs in the creases
* [ ] Check underneath the cushions if you have capacity
* [ ] Put the cushions and blankets back

**Minimum version:** Vacuum the seat and the most noticeable crumbs.`
    ),
    livingRoomTask("da5bb99b-bdf1-4fe7-bbc9-e4e677bde72e", "Water plants", 8, 1, FrequencyType.Weekly,
        `Check each plant before watering:

* [ ] Touch the soil to see whether it is dry
* [ ] Water only the plants that need it
* [ ] Let extra water drain
* [ ] Empty standing water from saucers or decorative pots
* [ ] Return the watering can to its home

**Minimum version:** Check the thirstiest-looking plant.

It is okay to skip plants with damp soil. Different plants need water at different times.`
    ),
    livingRoomTask("43955e19-0e7d-4758-a3d1-d7a4625470e9", "Wash the windows", 9, 2, FrequencyType.Monthly,
        `Choose **one window** to start:

* [ ] Move items away from the window
* [ ] Dust the sill and frame
* [ ] Spray cleaner onto a cloth
* [ ] Wipe the glass
* [ ] Dry visible streaks
* [ ] Wipe the sill

**Minimum version:** Clean the inside of the most noticeable window.

Only clean exterior glass when it is safely reachable from the ground.`
    ),
    livingRoomTask("229cae43-bc39-430b-8b4e-b06191f0f18a", "Wash the blinds", 10, 3, FrequencyType.Monthly,
        `Start with **one window**:

* [ ] Close the blinds
* [ ] Dust or vacuum them gently
* [ ] Wipe slats with a damp cloth if the material allows
* [ ] Turn the slats and clean the other side
* [ ] Let them dry

**Minimum version:** Dust one side of the most visible blinds.

Check the care instructions before using water on wood, fabric, or specialty blinds.`
    ),
];
