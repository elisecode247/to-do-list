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
    livingRoomTask("8880e213-3415-4911-a20d-4a81f12447f1", "Deep-clean rugs and carpets", 7, 1, FrequencyType.Annually,
        `Choose **one rug or carpeted area**:

* [ ] Check the care label or flooring guidance
* [ ] Pick up loose items and move light furniture
* [ ] Vacuum slowly in more than one direction
* [ ] Test the cleaning method in a hidden spot
* [ ] Deep-clean or wet-vacuum one section at a time
* [ ] Keep people and pets off the damp area
* [ ] Ventilate the room and let it dry completely
* [ ] Return furniture when the area is dry

**Minimum version:** Vacuum thoroughly and spot-clean the most noticeable stain.

Do not wet-clean rugs or carpets that require professional or dry cleaning. Avoid soaking the flooring underneath.`
    ),
    livingRoomTask("c276e9d3-a6c7-484d-82aa-b62e7726cc20", "Vacuum the couch", 8, 1, FrequencyType.Weekly,
        `* [ ] Remove blankets and loose items
* [ ] Vacuum the seat and back cushions
* [ ] Vacuum visible crumbs in the creases
* [ ] Check underneath the cushions if you have capacity
* [ ] Put the cushions and blankets back

**Minimum version:** Vacuum the seat and the most noticeable crumbs.`
    ),
    livingRoomTask("da5bb99b-bdf1-4fe7-bbc9-e4e677bde72e", "Water plants", 9, 1, FrequencyType.Weekly,
        `Check each plant before watering:

* [ ] Touch the soil to see whether it is dry
* [ ] Water only the plants that need it
* [ ] Let extra water drain
* [ ] Empty standing water from saucers or decorative pots
* [ ] Return the watering can to its home

**Minimum version:** Check the thirstiest-looking plant.

It is okay to skip plants with damp soil. Different plants need water at different times.`
    ),
    livingRoomTask("43955e19-0e7d-4758-a3d1-d7a4625470e9", "Wash the windows", 10, 2, FrequencyType.Monthly,
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
    livingRoomTask("229cae43-bc39-430b-8b4e-b06191f0f18a", "Wash the blinds", 11, 3, FrequencyType.Monthly,
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

const CLEAN_KITCHEN_ID = "2fe9ad2e-bb2a-4d77-a132-115bc665265c";

function kitchenTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CLEAN_KITCHEN_ID,
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

export const CLEAN_KITCHEN_TEMPLATE: ChecklistItem[] = [
    kitchenTask(CLEAN_KITCHEN_ID, "Clean kitchen", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Choose what would make the kitchen safer or easier to use. Start with the quickest win and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    kitchenTask("095aecfc-c1c2-4411-8211-0d7056b5eece", "Gather supplies", 0, 1, FrequencyType.Weekly,
        `Gather only what you plan to use:

* [ ] trash bag
* [ ] donation box or bag
* [ ] gloves
* [ ] cleaning cloths or paper towels
* [ ] all-purpose kitchen cleaner
* [ ] dish soap
* [ ] floor cleaner and mop
* [ ] broom or vacuum
* [ ] music, podcast, or other pleasant background sound

**Minimum version:** Grab a trash bag and one cleaning cloth.

> Never mix cleaning products. Check labels before using a product on food-contact surfaces or a new material.`
    ),
    kitchenTask("7d6831d9-05b9-4ff8-afb7-cd13ce803e87", "Throw away trash", 1, 1, FrequencyType.Weekly,
        `Focus only on obvious trash:

* [ ] Throw away wrappers and empty containers
* [ ] Check counters, the table, and the floor
* [ ] Tie or close the full bag
* [ ] Put in a new liner
* [ ] Take the bag to the main bin

**Minimum version:** Fill your hands once and throw those items away.`
    ),
    kitchenTask("8b78546d-d629-4dbc-8f4c-ab5f4dd98e2e", "Wash kitchen towels", 2, 1, FrequencyType.Weekly,
        `* [ ] Collect towels, dishcloths, and washable drying mats
* [ ] Check care labels if needed
* [ ] Start the washer
* [ ] Set a reminder to move the load
* [ ] Dry as directed
* [ ] Return clean towels to the kitchen

**Minimum version:** Put used towels in the hamper and set out one clean towel.`
    ),
    kitchenTask("6a0ea2ac-979a-4e06-a036-370e59ffc5cf", "Do the dishes", 3, 1, FrequencyType.Weekly,
        `Pick the starting point that feels easiest:

* [ ] Throw away food scraps
* [ ] Put away clean dishes if you need the space
* [ ] Load the dishwasher or fill the sink
* [ ] Wash what fits in one batch
* [ ] Start the dishwasher, if using it
* [ ] Set a reminder to unload it later

**Minimum version:** Wash the dishes you need for your next meal or fill one dishwasher rack.

You can stop after one batch. The sink does not have to be completely empty.`
    ),
    kitchenTask("6a1351af-e123-4031-96e0-a65006b05fb6", "Wipe knobs, switches, and outlet covers", 4, 1, FrequencyType.Weekly,
        `* [ ] Turn off or unplug nearby appliances if needed
* [ ] Spray cleaner onto a cloth—not onto electrical fixtures
* [ ] Wipe cabinet and appliance knobs
* [ ] Wipe light switches
* [ ] Carefully wipe outlet covers
* [ ] Dry any damp areas

**Minimum version:** Wipe the most frequently touched knobs and switches.

> Keep liquid out of outlets and switches. Do not clean damaged or loose electrical covers.`
    ),
    kitchenTask("4cc44285-ff7e-49ef-a743-7f861218dbfa", "Wipe the table, chairs, and stools", 5, 1, FrequencyType.Weekly,
        `* [ ] Move loose items into one spot
* [ ] Wipe the tabletop
* [ ] Wipe chair and stool seats
* [ ] Wipe visibly dirty backs, legs, or rungs
* [ ] Put back only what belongs there

**Minimum version:** Clear and wipe one place to sit and eat.`
    ),
    kitchenTask("8de007db-4858-46db-b249-c281293bb1ad", "Discard expired pantry food and wipe shelves", 6, 6, FrequencyType.Monthly,
        `Work on **one shelf or category** at a time:

* [ ] Remove the items
* [ ] Check dates and condition
* [ ] Discard spoiled, unsafe, or unwanted food
* [ ] Set aside unopened food you can donate
* [ ] Wipe and dry the shelf
* [ ] Return the food you are keeping

**Minimum version:** Check one shelf or five items.

Package dates can mean different things. When appropriate, check the food and storage guidance instead of relying only on the printed date.`
    ),
    kitchenTask("5718f426-dd01-4449-b225-6e7cb288a990", "Organize the pantry", 7, 6, FrequencyType.Monthly,
        `Choose **one shelf, bin, or food category**:

* [ ] Group similar foods together
* [ ] Put frequently used items within easy reach
* [ ] Move older items toward the front
* [ ] Combine duplicates when safe
* [ ] Add missing staples to the shopping list

**Minimum version:** Make one category easier to find.

The goal is visibility, not a picture-perfect pantry.`
    ),
    kitchenTask("a8bff54f-13dd-433d-bc5f-13905eefc542", "Check the refrigerator for expired food", 8, 1, FrequencyType.Weekly,
        `* [ ] Check leftovers first
* [ ] Look for spoiled produce and leaking containers
* [ ] Discard food that is no longer safe or wanted
* [ ] Put food to use soon near the front
* [ ] Wipe obvious spills

**Minimum version:** Check leftovers and the produce drawer.

When you are unsure whether food is safe, follow reliable food-storage guidance rather than tasting it.`
    ),
    kitchenTask("a122ce5e-6e52-4c74-8149-b49f9d534ac4", "Donate unused kitchen supplies", 9, 6, FrequencyType.Monthly,
        `Choose **one drawer, cabinet, or item type**:

* [ ] Find duplicates or items you no longer use
* [ ] Put usable items in a donation box
* [ ] Discard broken or unsafe items
* [ ] Put the donation box near the door
* [ ] Add the drop-off to your errands

**Minimum version:** Choose one item to donate.

You do not have to reorganize the space after removing items.`
    ),
    kitchenTask("9420cb3c-f1cb-4e1d-b1e7-4fef5936b2f7", "Degrease the range, burner grates, and oven racks", 10, 4, FrequencyType.Monthly,
        `Check the appliance manual before removing or soaking parts.

* [ ] Make sure every surface is cool
* [ ] Remove grates and racks that are safe to remove
* [ ] Apply a compatible degreaser
* [ ] Let it sit for the label's recommended time
* [ ] Scrub one section at a time
* [ ] Rinse and dry removable parts
* [ ] Wipe the range and return the parts

**Minimum version:** Degrease the range around the most-used burner.

> Never mix cleaning products. Avoid getting liquid into burners, igniters, or electrical parts.`
    ),
    kitchenTask("ff532210-e9a8-4db6-955f-65c254fb2544", "Dust from top to bottom", 11, 1, FrequencyType.Monthly,
        `Choose one level or area at a time:

* [ ] Ceiling corners
* [ ] Light fixtures and ceiling fans
* [ ] Top of the refrigerator and cabinets
* [ ] Shelves and decor
* [ ] Baseboards

Work from high surfaces to low ones so fallen dust can be cleaned last.

**Minimum version:** Dust one visible surface.

> Turn off fans and lights before cleaning. Use a stable step stool and skip anything you cannot reach safely.`
    ),
    kitchenTask("f32e4495-631e-4357-8896-2426976213e7", "Clean cabinet fronts and knobs", 12, 1, FrequencyType.Monthly,
        `Choose **one section of cabinets**:

* [ ] Spray a material-safe cleaner onto a cloth
* [ ] Wipe cabinet fronts
* [ ] Wipe knobs and handles
* [ ] Dry the surfaces

**Minimum version:** Wipe the handles and the area around them.

Test a new cleaner in a hidden spot first.`
    ),
    kitchenTask("2f0b4246-41e2-4763-8949-0d549afc6727", "Degrease cabinets and backsplash", 13, 3, FrequencyType.Monthly,
        `Choose the greasiest section near the stove:

* [ ] Apply a compatible degreaser to a cloth or small area
* [ ] Let it sit as directed
* [ ] Wipe the backsplash
* [ ] Wipe nearby cabinet fronts
* [ ] Repeat only where needed
* [ ] Rinse or dry as the product directs

**Minimum version:** Clean one greasy patch.

Test the product first, especially on painted, wood, stone, or specialty surfaces.`
    ),
    kitchenTask("a8342c24-c960-4152-b7f8-866a665b398f", "Deep-clean the oven", 14, 6, FrequencyType.Monthly,
        `Check the appliance manual before choosing a cleaning method.

* [ ] Make sure the oven is off and cool
* [ ] Remove loose crumbs
* [ ] Remove racks if the manual recommends it
* [ ] Apply an oven-safe cleaner or start the approved cleaning cycle
* [ ] Set a reminder for the waiting or cooling time
* [ ] Wipe out residue
* [ ] Return dry racks

**Minimum version:** Remove loose crumbs and wipe the oven door.

> Ventilate the room and never mix oven cleaner with other products.`
    ),
    kitchenTask("ac0fcaaa-2577-47de-8890-5b14c29a5044", "Deep-clean the refrigerator and freezer", 15, 4, FrequencyType.Monthly,
        `Do **one compartment at a time** so food stays cold:

* [ ] Prepare a cooler or temporary cold space if needed
* [ ] Remove food from one shelf, drawer, or freezer section
* [ ] Discard unsafe or unwanted food
* [ ] Wash and dry the shelf or drawer
* [ ] Wipe spills and crumbs
* [ ] Return food and group similar items
* [ ] Repeat only if you have capacity

**Minimum version:** Clean one shelf or drawer.

Follow food-safety guidance for anything left at room temperature.`
    ),
    kitchenTask("a226c66b-17e2-4e1f-9852-fb2a72c441b9", "Deep-clean the microwave", 16, 1, FrequencyType.Monthly,
        `* [ ] Unplug the microwave if the manual recommends it
* [ ] Remove and wash the turntable
* [ ] Loosen stuck-on food with steam or a damp cloth
* [ ] Wipe the ceiling, walls, floor, and door
* [ ] Wipe the outside and controls
* [ ] Dry and replace the turntable

**Minimum version:** Wipe the biggest spill and the handle.

Do not spray cleaner into vents or electrical openings.`
    ),
    kitchenTask("196ec1a9-ff86-4ab8-b6d6-685ebd7bcbb3", "Deep-clean the dishwasher and clean its filter", 17, 3, FrequencyType.Monthly,
        `Check the appliance manual for the filter location and approved cleaner.

* [ ] Empty the dishwasher
* [ ] Remove visible debris
* [ ] Remove and rinse the filter if it is user-serviceable
* [ ] Wipe the door seal and edges
* [ ] Return the filter securely
* [ ] Run an approved cleaning cycle
* [ ] Replace the filter only if the manual says it is disposable or damaged

**Minimum version:** Remove visible debris and wipe the door seal.`
    ),
    kitchenTask("05b10aeb-4c19-4acf-a9f8-82cd770e927a", "Wipe the counters", 18, 1, FrequencyType.Weekly,
        `* [ ] Put food away
* [ ] Move loose items into one spot
* [ ] Wipe crumbs, spills, and sticky areas
* [ ] Clean around frequently used appliances
* [ ] Clear one space for preparing food

**Minimum version:** Wipe the area you need next.

Follow the product directions for food-contact surfaces.`
    ),
    kitchenTask("d83bab21-f4d0-4f36-a060-1cd393e3a063", "Scrub the sink", 19, 1, FrequencyType.Weekly,
        `* [ ] Move dishes and sink items aside
* [ ] Rinse away loose debris
* [ ] Apply a sink-safe cleaner
* [ ] Scrub the basin, drain, faucet, and handles
* [ ] Rinse and dry

**Minimum version:** Scrub the basin and rinse it.

Do not mix cleaning products, and use a cleaner that is safe for the sink material.`
    ),
    kitchenTask("4c1e6072-a432-43e3-950c-4bc0863f0f77", "Freshen the garbage disposal", 20, 1, FrequencyType.Weekly,
        `* [ ] Turn off the disposal
* [ ] Remove debris from the sink without reaching into the disposal
* [ ] Freshen it using the manufacturer's recommended method
* [ ] If the manual allows it, grind a few ice cubes while running cold water
* [ ] Wipe the splash guard if it can be handled safely
* [ ] Rinse the sink

**Minimum version:** Rinse the disposal using the recommended method.

> Never put your hand into the disposal. Disconnect power before servicing it, and avoid drain chemicals unless the manufacturer allows them.`
    ),
    kitchenTask("ef033291-e6d4-4cd8-8fc3-69e3ee3eb521", "Sweep the floor", 21, 1, FrequencyType.Weekly,
        `* [ ] Move only what blocks the floor
* [ ] Sweep under the table and along cabinet edges
* [ ] Focus on cooking and eating areas
* [ ] Empty the dustpan

**Minimum version:** Sweep the messiest section or main walking path.`
    ),
    kitchenTask("9fd5c8f1-a321-42f2-92e9-26ba354b58c7", "Mop the floor", 22, 1, FrequencyType.Weekly,
        `* [ ] Sweep or vacuum loose debris
* [ ] Prepare a floor-safe cleaner
* [ ] Spot-clean sticky areas
* [ ] Mop from the far corner toward the exit
* [ ] Let the floor dry
* [ ] Put the supplies away

**Minimum version:** Mop the sticky spots or the area in front of the sink and stove.`
    ),
];

const CLEAN_BEDROOM_ID = "8db540aa-e7b2-4382-91d3-9ab9c82185f4";

function bedroomTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CLEAN_BEDROOM_ID,
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

export const CLEAN_BEDROOM_TEMPLATE: ChecklistItem[] = [
    bedroomTask(CLEAN_BEDROOM_ID, "Clean bedroom", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Choose what would make the bedroom more restful or easier to use. Start with the quickest win and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    bedroomTask("423426f0-d13f-4d95-8a69-7e150c4447f9", "Gather supplies", 0, 1, FrequencyType.Weekly,
        `Gather only what you plan to use:

* [ ] trash bag
* [ ] basket for items from other rooms
* [ ] laundry hamper
* [ ] clean sheets or pillowcases
* [ ] microfiber cloth or duster
* [ ] material-safe cleaner
* [ ] vacuum or broom
* [ ] stable step stool, if needed
* [ ] music, podcast, or other pleasant background sound

**Minimum version:** Grab a trash bag and laundry hamper.`
    ),
    bedroomTask("931c6a0c-b9d2-47b6-b60c-944035b3e82b", "Remove trash and return dishes", 1, 1, FrequencyType.Weekly,
        `Focus only on obvious trash and dishes:

* [ ] Throw away wrappers, tissues, and empty containers
* [ ] Check the nightstand, floor, and under the bed edge
* [ ] Take cups and dishes to the kitchen
* [ ] Tie the trash bag if it is full

**Minimum version:** Fill your hands once and remove those items.`
    ),
    bedroomTask("220a1b3f-a1c1-4937-a035-ae4424e9db86", "Organize and declutter", 2, 1, FrequencyType.Weekly,
        `Choose **one visible area** or work by item type:

* [ ] Put dirty clothes in the hamper
* [ ] Put clean clothes in one designated spot
* [ ] Return books, products, and accessories to their homes
* [ ] Put items from other rooms into one basket
* [ ] Clear a safe path and one restful surface

**Minimum version:** Put away five items or clear one bedside surface.

The basket can wait. Returning everything to other rooms can be a separate task.`
    ),
    bedroomTask("7f7f962b-99b1-4ba0-8464-9d0360f3acec", "Do laundry", 3, 1, FrequencyType.Weekly,
        `* [ ] Choose the load you need most
* [ ] Put it in the washer
* [ ] Add detergent and start the wash
* [ ] Set a reminder to move it
* [ ] Dry or hang the clothes
* [ ] Put clean clothes where you can find them

**Minimum version:** Start one load. Folding and putting away can be separate tasks.`
    ),
    bedroomTask("de03229f-a7b0-4342-ae94-e28830fe7686", "Change the bedsheets", 4, 2, FrequencyType.Weekly,
        `Put the clean bedding within reach before stripping the bed:

* [ ] Remove pillowcases and sheets
* [ ] Put used bedding in the hamper
* [ ] Check whether the mattress protector needs washing
* [ ] Put on the fitted sheet
* [ ] Add the top sheet or duvet
* [ ] Put on clean pillowcases

**Minimum version:** Change the pillowcases and the sheet you sleep directly on.

The bed does not need to look perfect. Clean and usable is enough.`
    ),
    bedroomTask("16522612-5b5b-4d33-bc83-c7a10a39dc80", "Dust", 5, 1, FrequencyType.Weekly,
        `Work from high surfaces to low ones:

* [ ] Dust reachable corners, fixtures, and fan blades
* [ ] Dust shelves, frames, and decor
* [ ] Wipe nightstands and other flat surfaces

**Minimum version:** Dust one visible surface.

> Turn off fans and lights before cleaning. Use a stable step stool and skip anything you cannot reach safely.`
    ),
    bedroomTask("b304b68f-a376-44b0-9364-bb491c408812", "Vacuum", 6, 1, FrequencyType.Weekly,
        `* [ ] Pick up only the items blocking the floor
* [ ] Vacuum the main walking path
* [ ] Vacuum rugs and visible floor areas
* [ ] Use an edge tool where dust collects, if you have capacity
* [ ] Empty the vacuum bin if needed

**Minimum version:** Vacuum the main walking path or the messiest section.

You do not need to move furniture or reach every corner.`
    ),
    bedroomTask("10b54d58-11ea-4778-9773-e0ee065bf807", "Wipe furniture and door handles", 7, 1, FrequencyType.Monthly,
        `Choose **one section of the room**:

* [ ] Move loose items into one spot
* [ ] Spray a material-safe cleaner onto a cloth
* [ ] Wipe furniture tops, fronts, and handles
* [ ] Wipe door and closet handles
* [ ] Dry the surfaces and return needed items

**Minimum version:** Wipe the most frequently touched handles and one surface.

Test a new cleaner in a hidden spot first.`
    ),
    bedroomTask("d144a037-858d-4f94-966b-5b2f4c81ad0d", "Vacuum under the bed and furniture", 8, 1, FrequencyType.Monthly,
        `Choose **one reachable area**:

* [ ] Move only lightweight items that block access
* [ ] Use a vacuum attachment or long-handled duster
* [ ] Clean under the bed from each reachable side
* [ ] Clean under one other piece of furniture
* [ ] Return moved items

**Minimum version:** Vacuum around the bed edges and as far underneath as the tool reaches.

Do not move heavy furniture by yourself.`
    ),
    bedroomTask("4b2c492d-f6d7-46f7-8bb9-da2a2dc851cf", "Vacuum the mattress", 9, 3, FrequencyType.Monthly,
        `* [ ] Remove the bedding
* [ ] Check the mattress care instructions
* [ ] Vacuum the top using an upholstery attachment
* [ ] Vacuum seams and edges
* [ ] Spot-clean only if the manufacturer allows it
* [ ] Let the mattress dry before remaking the bed

**Minimum version:** Vacuum the area where your upper body rests.

Avoid soaking the mattress or applying unapproved powders or cleaners.`
    ),
    bedroomTask("e27bfcab-bc14-4699-a58a-49166f756c12", "Wash pillows and the mattress protector", 10, 6, FrequencyType.Monthly,
        `Check every care label before washing:

* [ ] Remove pillowcases and the mattress protector
* [ ] Choose only items that can be washed together
* [ ] Start the washer using the recommended settings
* [ ] Set a reminder to move the load
* [ ] Dry everything completely as directed
* [ ] Return the protector and pillows to the bed

**Minimum version:** Wash the mattress protector or one washable pillow.

Foam and specialty pillows may require spot cleaning instead of machine washing.`
    ),
    bedroomTask("11737483-e84d-46de-a9bc-af8980ac58a1", "Rotate the mattress", 11, 6, FrequencyType.Monthly,
        `First check whether the mattress manufacturer recommends rotation:

* [ ] Remove bedding and nearby obstacles
* [ ] Ask for help if the mattress is heavy or awkward
* [ ] Rotate it so the head moves to the foot
* [ ] Check that the mattress is centered and supported
* [ ] Remake the bed

**Minimum version:** Check the manufacturer's guidance and arrange help for another day.

Do not flip a one-sided mattress or lift a heavy mattress alone.`
    ),
    bedroomTask("9621e533-45a5-41ab-a829-cf1ac45b33a0", "Straighten closets and drawers", 12, 2, FrequencyType.Monthly,
        `Choose **one drawer, shelf, or clothing category**:

* [ ] Remove obvious trash and empty packaging
* [ ] Put dirty clothes in the hamper
* [ ] Group similar items together
* [ ] Put frequently used items within easy reach
* [ ] Set aside anything that belongs elsewhere

**Minimum version:** Make one drawer or shelf easier to use.

You do not need to fold everything or create a perfect system.`
    ),
    bedroomTask("c1f7c6fa-3355-43f5-8148-855dcbb466af", "Deep-clean the closet", 13, 1, FrequencyType.Annually,
        `Work on **one section at a time**:

* [ ] Prepare bags for donations, trash, and items to relocate
* [ ] Remove items from one shelf, rail section, or floor area
* [ ] Decide what to keep, donate, repair, or discard
* [ ] Dust or wipe the empty area
* [ ] Vacuum or sweep the closet floor
* [ ] Return the items you are keeping
* [ ] Put donation bags near the door

**Minimum version:** Fill one donation bag or deep-clean one shelf.

Stop before emptying another section. A usable closet is the goal—not finishing it all at once.`
    ),
    bedroomTask("769345ad-1492-43bf-a1bb-7b75dbc542a4", "Clean the windows", 14, 2, FrequencyType.Monthly,
        `Choose **one window** to start:

* [ ] Move nearby items
* [ ] Dust the sill and frame
* [ ] Spray cleaner onto a cloth
* [ ] Wipe the inside glass
* [ ] Dry visible streaks
* [ ] Wipe the sill

**Minimum version:** Clean the most noticeable section of glass.

Only clean exterior glass when it is safely reachable from the ground.`
    ),
    bedroomTask("30e426c2-8788-471a-885d-c8965523616a", "Clean curtains and blinds", 15, 1, FrequencyType.Annually,
        `Choose **one window treatment** and check its care instructions:

* [ ] Vacuum or dust curtains, blinds, and hardware
* [ ] Spot-clean marks if the material allows
* [ ] Launder or steam curtains only as directed
* [ ] Wipe blind slats if the material allows
* [ ] Let everything dry completely
* [ ] Rehang or reset the window treatment

**Minimum version:** Dust one set of blinds or vacuum one curtain panel.

Wood, fabric, blackout, and specialty materials may require different cleaning methods.`
    ),
];

const CLEAN_HALLS_AND_STAIRS_ID = "9bf978f6-9943-424b-afeb-ac4032ded4d3";

function hallsAndStairsTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CLEAN_HALLS_AND_STAIRS_ID,
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

export const CLEAN_HALLS_AND_STAIRS_TEMPLATE: ChecklistItem[] = [
    hallsAndStairsTask(CLEAN_HALLS_AND_STAIRS_ID, "Clean halls and stairs", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Clear anything that could cause a trip first. Then choose what would make the space safer or easier to use, and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    hallsAndStairsTask("f495021b-bc92-4f87-b27f-f87db8dc1903", "Gather supplies", 0, 1, FrequencyType.Weekly,
        `Gather only what you plan to use:

* [ ] basket for items from other rooms
* [ ] trash bag
* [ ] microfiber cloth or duster
* [ ] material-safe cleaner
* [ ] broom or vacuum with attachments
* [ ] floor-safe cleaner and mop, if needed
* [ ] stable step stool for level floors only
* [ ] music, podcast, or other pleasant background sound

**Minimum version:** Grab a basket, trash bag, and cleaning cloth.

Keep supplies together on a level landing—never on the stairs.`
    ),
    hallsAndStairsTask("d8ad45c8-e8ae-41bb-8308-5bedddfc00e2", "Clear trip hazards", 1, 1, FrequencyType.Weekly,
        `Walk through the area before cleaning:

* [ ] Remove items from the stairs
* [ ] Clear the main walking path
* [ ] Secure or move loose cords
* [ ] Check for loose rugs or mats
* [ ] Move shoes and bags away from landings

**Minimum version:** Clear the stairs and one safe walking path.

If a tread, railing, rug, or light is unsafe, make a separate repair task.`
    ),
    hallsAndStairsTask("3e17caa2-9883-4557-bb40-9116d52029d4", "Remove trash and return misplaced items", 2, 1, FrequencyType.Weekly,
        `Work by item type:

* [ ] Throw away obvious trash
* [ ] Put laundry in the hamper
* [ ] Put items from other rooms into one basket
* [ ] Return hallway items to their homes
* [ ] Leave the basket near its next destination

**Minimum version:** Remove five items or clear one stair.

The basket can wait. Returning everything at once is not required.`
    ),
    hallsAndStairsTask("cc2dbed9-a59a-41bb-893d-ab1e81d5da9e", "Straighten drawers, desks, and shelves", 3, 1, FrequencyType.Weekly,
        `Choose **one drawer, desk, shelf, or console table**:

* [ ] Remove obvious trash
* [ ] Group similar items together
* [ ] Put frequently used items within easy reach
* [ ] Place items from elsewhere into the return basket
* [ ] Clear one usable surface

**Minimum version:** Make one small area easier to use.

You do not need to empty a drawer or create a perfect organization system.`
    ),
    hallsAndStairsTask("7d6ee55e-fb7b-4df7-a540-b902df650151", "Straighten and declutter closets", 4, 1, FrequencyType.Annually,
        `Work on **one closet section at a time**:

* [ ] Prepare bags for donations, trash, and items to relocate
* [ ] Remove items from one shelf, hook area, or floor section
* [ ] Decide what to keep, donate, repair, or discard
* [ ] Wipe the empty area
* [ ] Return the items you are keeping
* [ ] Put donation bags near the door

**Minimum version:** Fill one donation bag or straighten one shelf.

Stop before emptying another section. A usable closet is the goal.`
    ),
    hallsAndStairsTask("dd87d9ed-1c6c-4691-abca-9ab95d780a2a", "Dust ceiling fans and light fixtures", 5, 1, FrequencyType.Annually,
        `Clean high areas before lower surfaces and floors:

* [ ] Turn off fans and lights
* [ ] Let bulbs cool completely
* [ ] Dust reachable fan blades
* [ ] Dust shades, covers, and fixture exteriors
* [ ] Wipe removable parts only if the manufacturer allows it
* [ ] Put parts back when completely dry

**Minimum version:** Dust one safely reachable fixture.

> Use a stable step stool only on a level floor. Never place it on stairs, and skip fixtures you cannot reach safely.`
    ),
    hallsAndStairsTask("1528fa7f-91c9-4385-8d40-e78701c55c1c", "Dust", 6, 1, FrequencyType.Weekly,
        `Work from high surfaces to low ones:

* [ ] Dust picture frames and wall decor
* [ ] Dust shelves, ledges, and furniture
* [ ] Dust the top and sides of the handrail
* [ ] Dust stair edges and reachable corners

**Minimum version:** Dust the most visible ledge or surface.

Leave fallen dust for the vacuuming task.`
    ),
    hallsAndStairsTask("bc6b88e9-8c8a-48b5-9610-3bd30930ef09", "Wipe handrails, doorknobs, and light switches", 7, 1, FrequencyType.Weekly,
        `* [ ] Spray a material-safe cleaner onto a cloth
* [ ] Wipe handrails and banisters
* [ ] Wipe doorknobs and handles
* [ ] Carefully wipe light switches
* [ ] Dry the handrail before using the stairs

**Minimum version:** Wipe the handrail and the most-used doorknob.

Do not spray liquid directly onto switches or electrical fixtures.`
    ),
    hallsAndStairsTask("35e964b3-9ad7-4c6d-93c4-f1229b2d9a91", "Spot-clean walls, doors, and trim", 8, 1, FrequencyType.Monthly,
        `Choose **one marked or scuffed area**:

* [ ] Dust the area first
* [ ] Test a material-safe cleaner in a hidden spot
* [ ] Wipe fingerprints and scuffs gently
* [ ] Wipe door edges and trim if needed
* [ ] Dry the surface

**Minimum version:** Clean the most noticeable mark.

Avoid hard scrubbing that could remove paint or damage the finish.`
    ),
    hallsAndStairsTask("c6d672b1-bd1b-427e-b5d4-2987b8ea39b5", "Clean baseboards", 9, 3, FrequencyType.Monthly,
        `Choose **one hallway or one flight of stairs**:

* [ ] Vacuum or dust loose debris
* [ ] Wipe the top edge
* [ ] Wipe visible marks on the front
* [ ] Dry the surface

**Minimum version:** Clean one short section or the most visible baseboard.

Sitting on the floor is fine. Reposition instead of stretching or leaning across stairs.`
    ),
    hallsAndStairsTask("2bad939a-1e0a-4e09-8d86-056b043eeb29", "Vacuum", 10, 1, FrequencyType.Weekly,
        `Keep one hand available for balance on stairs:

* [ ] Pick up only the items blocking the floor
* [ ] Vacuum hallway walking paths
* [ ] Use an appropriate attachment on stair treads and edges
* [ ] Keep the cord and vacuum behind you, away from your feet
* [ ] Empty the vacuum bin if needed

**Minimum version:** Vacuum the main hallway path or one flight of stairs.

Do not balance a heavy vacuum on the stairs. Use a handheld tool or ask for help if needed.`
    ),
    hallsAndStairsTask("532e8767-c70f-4ac6-b833-30dc99c6d14c", "Mop hard-surface floors and stairs", 11, 1, FrequencyType.Weekly,
        `* [ ] Sweep or vacuum loose debris first
* [ ] Prepare a floor-safe cleaner
* [ ] Spot-clean sticky areas
* [ ] Mop the hallway toward an exit
* [ ] Clean stair treads one at a time without blocking your safe path
* [ ] Keep people and pets away until the floor is dry
* [ ] Put the supplies away

**Minimum version:** Mop the sticky spots or one small landing.

Skip carpeted areas. Avoid leaving an entire staircase wet at the same time.`
    ),
];

const CLEAN_OUTSIDE_ID = "07ecb1e7-87f3-47d8-a274-3febdb1ac390";

function outsideTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CLEAN_OUTSIDE_ID,
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

export const CLEAN_OUTSIDE_TEMPLATE: ChecklistItem[] = [
    outsideTask(CLEAN_OUTSIDE_ID, "Clean outside", 0, 1, FrequencyType.Weekly,
        `**Good enough counts.** You do not have to complete every subtask in one session.

Check the weather, choose one area that would make the property safer or easier to use, and stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    outsideTask("9dc48d97-dd6b-42aa-a7ab-8cb9328c7fcd", "Gather outdoor supplies", 0, 1, FrequencyType.Weekly,
        `Gather only what you plan to use:

* [ ] work gloves
* [ ] trash and yard-waste bags
* [ ] basket for items that belong elsewhere
* [ ] broom, rake, or leaf blower
* [ ] garden tools
* [ ] sun protection and drinking water
* [ ] closed-toe shoes
* [ ] music, podcast, or other pleasant background sound

**Minimum version:** Put on safe shoes and grab gloves and a trash bag.

Check the weather before starting. Skip outdoor work during unsafe heat, storms, smoke, or poor air quality.`
    ),
    outsideTask("711cb9b3-c52b-4861-9003-b13f55bd74e7", "Check walkways, steps, and railings for hazards", 1, 1, FrequencyType.Monthly,
        `Walk the areas people use most:

* [ ] Check for loose steps, boards, pavers, or railings
* [ ] Look for slippery growth, standing water, or ice
* [ ] Move cords, hoses, and objects out of walking paths
* [ ] Check that gates and outdoor lights work
* [ ] Create a separate repair task for anything unsafe

**Minimum version:** Check the main entrance and its walking path.

Block access to anything dangerous until it can be repaired.`
    ),
    outsideTask("f4f3354a-6e58-41ef-bd40-ea4076dd5e79", "Pick up trash, branches, and debris", 2, 1, FrequencyType.Weekly,
        `Choose **one outdoor area**:

* [ ] Pick up obvious trash
* [ ] Collect fallen branches and loose debris
* [ ] Put misplaced items into one basket
* [ ] Sort trash, recycling, and yard waste
* [ ] Move full bags to the appropriate bins

**Minimum version:** Fill your hands once or clear the main entrance.

Wear gloves and do not handle sharp, hazardous, or unknown items with bare hands.`
    ),
    outsideTask("1c412e45-9fad-49d2-af7f-12099e5b3984", "Sweep the porch, patio, and driveway", 3, 3, FrequencyType.Weekly,
        `Choose **one surface**—you do not need to sweep all three:

* [ ] Move only lightweight items that block the area
* [ ] Sweep debris away from the house and doors
* [ ] Focus on walking paths, corners, and steps
* [ ] Collect debris instead of sweeping it into the street or drains
* [ ] Return moved items

**Minimum version:** Sweep the main entrance or the messiest section.

Stay aware of vehicles when working near the driveway or street.`
    ),
    outsideTask("e700bbf3-b8fd-4c33-bc1d-12841c80d23d", "Mow the lawn", 4, 2, FrequencyType.Weekly,
        `* [ ] Check the weather and lawn conditions
* [ ] Clear rocks, toys, branches, and pet waste
* [ ] Check the mower according to its manual
* [ ] Wear closed-toe shoes, eye protection, and hearing protection if needed
* [ ] Mow one section at a time
* [ ] Put the mower away safely

**Minimum version:** Mow the most visible or frequently used section.

> Keep people and pets away. Turn the mower off completely before clearing a blockage, adjusting it, or crossing gravel.`
    ),
    outsideTask("de84991c-c693-47f9-9b1d-ff2ff30e1166", "Pull weeds", 5, 1, FrequencyType.Weekly,
        `Choose **one small patch, bed, or plant type**:

* [ ] Put on gloves
* [ ] Confirm which plants are weeds
* [ ] Loosen dry soil if needed
* [ ] Pull from the base and remove as much root as possible
* [ ] Collect weeds in the appropriate waste bag
* [ ] Stop after one patch

**Minimum version:** Pull five weeds or work for five comfortable minutes.

Avoid unknown, irritating, or poisonous plants until they can be identified safely.`
    ),
    outsideTask("8137ce5c-0bd9-468a-815b-91a90d0ec064", "Trim shrubs and overgrown plants", 6, 1, FrequencyType.Monthly,
        `During the growing season, choose **one plant or small area**:

* [ ] Check the plant's pruning needs and timing
* [ ] Look for nests, wildlife, and hidden wires
* [ ] Remove dead or damaged growth first
* [ ] Trim growth blocking paths, doors, or windows
* [ ] Collect the clippings
* [ ] Clean and put away tools

**Minimum version:** Trim one branch that blocks a walkway.

Skip this task outside the growing season or when pruning could harm the plant. Do not work near utility lines.`
    ),
    outsideTask("bb3ee407-b6a6-4b4e-a318-aa6bd86cc5e6", "Clean outdoor furniture", 7, 3, FrequencyType.Monthly,
        `Choose **one piece or furniture set**:

* [ ] Check the material and care instructions
* [ ] Remove cushions and loose items
* [ ] Brush or vacuum loose debris
* [ ] Wipe or wash with a material-safe cleaner
* [ ] Rinse only if appropriate
* [ ] Let everything dry completely
* [ ] Return cushions and items

**Minimum version:** Wipe the seat and arms of the chair you use most.`
    ),
    outsideTask("34d547fd-27fb-4134-be3c-ec812ecb580b", "Clean outdoor trash and recycling bins", 8, 3, FrequencyType.Monthly,
        `Clean the bins after collection day when they are mostly empty:

* [ ] Remove loose debris while wearing gloves
* [ ] Apply a bin-safe cleaner
* [ ] Scrub the lid, handles, and visibly dirty areas
* [ ] Rinse without sending waste into storm drains
* [ ] Let the bins dry with the lids open
* [ ] Return them to their storage area

**Minimum version:** Wipe the handles and lid.

Never mix cleaning products. Follow local rules for wastewater and storm drains.`
    ),
    outsideTask("472dc5c9-6ac2-40f9-b0da-29d79accd650", "Clean out the cars", 9, 6, FrequencyType.Monthly,
        `Choose **one car or one section**:

* [ ] Remove trash and recycling
* [ ] Take dishes and household items inside
* [ ] Put important papers in one safe place
* [ ] Remove clothes, bags, and items that do not belong
* [ ] Check under seats and in door pockets
* [ ] Vacuum the most-used area if you have capacity

**Minimum version:** Remove the trash from the driver's area.

Keep registration and emergency supplies in the car, and dispose of batteries or hazardous items appropriately.`
    ),
    outsideTask("3fb0f681-e9b3-4255-bcaf-1054d567f7e2", "Clean and organize the garage", 10, 6, FrequencyType.Monthly,
        `Work on **one zone, shelf, or category**:

* [ ] Open the garage for light and ventilation
* [ ] Prepare areas for trash, donations, and items to relocate
* [ ] Clear one safe walking path
* [ ] Group similar items together
* [ ] Keep frequently used items within easy reach
* [ ] Sweep the cleared section
* [ ] Put donation items near the exit

**Minimum version:** Clear one square of floor or one shelf.

Do not lift heavy items alone. Follow local rules for paint, chemicals, batteries, fuel, and other hazardous waste.`
    ),
    outsideTask("21bef4cc-99e1-4ae3-94b2-e45f0638b3c5", "Check exterior lights and replace bulbs", 11, 3, FrequencyType.Monthly,
        `* [ ] Turn on exterior lights and note any that are out
* [ ] Turn the fixture off
* [ ] Let the bulb cool completely
* [ ] Check the fixture instructions and bulb type
* [ ] Replace safely reachable bulbs
* [ ] Clean the fixture exterior with a dry cloth
* [ ] Test the light

**Minimum version:** Test the lights and add needed bulbs or repairs to your list.

Use a stable step stool only on level ground. Hire help for fixtures that are high, damaged, or near electrical hazards.`
    ),
    outsideTask("025f0603-7a6c-43a7-908b-55c14ba1d48f", "Clean gutters and downspouts", 12, 1, FrequencyType.Annually,
        `**Choose the safe option first:** schedule a professional if the gutters are not reachable from the ground.

For safely reachable areas:

* [ ] Check the weather and make sure the ground is dry
* [ ] Put on gloves and eye protection
* [ ] Remove visible debris using a ground-level gutter tool
* [ ] Check downspout openings for blockages
* [ ] Confirm that water drains away from the foundation
* [ ] Create repair tasks for loose or leaking sections

**Minimum version:** Inspect gutters and downspouts from the ground and schedule help if needed.

Do not work from the roof or overreach from a ladder.`
    ),
    outsideTask("a86b0c98-3de6-49db-9aee-17fedc3a3ce1", "Clean the exterior of the house", 13, 1, FrequencyType.Annually,
        `Choose **one safely reachable section**:

* [ ] Check the siding or surface manufacturer's guidance
* [ ] Cover or move delicate plants and outdoor items
* [ ] Brush away cobwebs and loose debris
* [ ] Wash with a surface-safe method from the ground
* [ ] Spot-clean doors, trim, and reachable marks
* [ ] Rinse only where appropriate
* [ ] Note damage that needs repair

**Minimum version:** Remove cobwebs and clean around the main entrance.

Avoid forcing water into vents, outlets, windows, or siding seams. Hire a professional for high areas or surfaces requiring pressure washing.`
    ),
];
