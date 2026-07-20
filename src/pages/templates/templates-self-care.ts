import type { ChecklistItem } from "src/app/types";

const MORNING_RESET_ID = "e813c003-ae5f-4ba1-afba-bd6fb37b530b";

function morningResetTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = MORNING_RESET_ID,
): ChecklistItem {
    return {
        isOwner: true,
        accessRole: 'owner',
        itemType: "checklist-item",
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: "",
        note,
        sortOrder,
        tabSortOrder: { today: 0 },
        category: "self-care",
        mode: "daily",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

export const MORNING_RESET_TEMPLATE: ChecklistItem[] = [
    morningResetTask(MORNING_RESET_ID, "Morning reset", 0,
        `**Good enough counts.** This routine is support, not a test you have to pass.

Start with what your body needs most. You can do the steps in a different order, choose a minimum version, or stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    morningResetTask("0c06186a-756e-42e4-a2e3-53e75bfed217", "Use the bathroom", 0,
        `* [ ] Go to the bathroom
* [ ] Wash and dry your hands
* [ ] Notice whether you need any period or personal-care supplies

**Minimum version:** Meet the immediate need. Everything else can wait.`
    ),
    morningResetTask("2de0c8ec-568f-4259-b28e-f6fe95b22520", "Drink water", 1,
        `* [ ] Find a cup or bottle
* [ ] Fill it with water
* [ ] Take a few comfortable sips
* [ ] Leave it somewhere visible if you want more later

**Minimum version:** Take one sip. Starting counts.`
    ),
    morningResetTask("f1b9c74b-a01e-4697-94bc-a05d408c8f99", "Take medication", 2,
        `* [ ] Check the label or medication organizer
* [ ] Confirm the correct medication and dose
* [ ] Take it exactly as prescribed
* [ ] Mark it taken using your usual system
* [ ] Notice whether a refill is running low

**Minimum version:** Get the medication and water in front of you.

If you are unsure whether you already took a dose, follow your prescriber's or pharmacist's instructions—do not guess or double the dose.`
    ),
    morningResetTask("d6a3268f-c1b0-4f28-ac25-02d11fb57ae6", "Check today's calendar", 3,
        `Look only at **today**:

* [ ] Check appointments and start times
* [ ] Notice anything requiring travel or preparation
* [ ] Choose one thing that matters most
* [ ] Set an alarm for anything easy to lose track of

**Minimum version:** Check the time of your next commitment.

You do not need to plan the entire day right now.`
    ),
    morningResetTask("23d51a8c-7a6d-41c3-a362-a44e93110f09", "Check the weather", 4,
        `* [ ] Check the temperature
* [ ] Look for rain, heat, cold, smoke, or other conditions
* [ ] Choose clothing or outerwear that works well enough
* [ ] Put any needed umbrella, jacket, or sun protection by the door

**Minimum version:** Check the current temperature before getting dressed.`
    ),
    morningResetTask("b44cfe67-ae35-4689-83bf-7a3e14117e55", "Wash your face", 5,
        `Choose what feels manageable:

* [ ] Wet your face or use a gentle face cloth
* [ ] Use cleanser if wanted
* [ ] Rinse or wipe
* [ ] Pat dry

**Minimum version:** Splash with water or wipe the areas that need attention.

If you are showering, you can wash your face there or skip this separate step.`
    ),
    morningResetTask("8f14b9a0-c38e-4783-a9ad-6a653f8c2737", "Take a shower", 6,
        `Choose the version your body and time allow:

* [ ] Put a towel and clean clothes within reach
* [ ] Start the water
* [ ] Wash the areas that need attention most
* [ ] Rinse
* [ ] Dry off
* [ ] Put used towels and clothes where they belong

**Minimum version:** Take a short body rinse or use a washcloth at the sink.

Hair washing is optional and can be a separate task.`
    ),
    morningResetTask("556bd61a-f2d2-436a-95b5-0eeff299441f", "Apply deodorant and basic skincare", 7,
        `Choose only what helps today:

* [ ] Apply deodorant
* [ ] Apply moisturizer if wanted
* [ ] Apply sunscreen when appropriate
* [ ] Put the products back where you can find them

**Minimum version:** Apply deodorant or the one product your skin needs most.

Your routine does not need multiple products to count.`
    ),
    morningResetTask("713bb409-f631-4fa2-bac3-c880b2514869", "Get dressed", 8,
        `* [ ] Check the weather and today's activities
* [ ] Choose comfortable clothes that work well enough
* [ ] Put dirty clothes in the hamper
* [ ] Get dressed
* [ ] Add any needed layers

**Minimum version:** Put on clean underwear and the clothes needed for your next activity.

Repeating a comfortable outfit is allowed.`
    ),
    morningResetTask("d56d0621-4043-434d-b7ed-03928f4e835f", "Eat a pre-planned breakfast with protein and fat", 9,
        `Use your pre-planned option so you do not have to decide from scratch:

* [ ] Get the food and any utensils
* [ ] Include a protein you tolerate and enjoy
* [ ] Include a source of fat
* [ ] Add another food if you want it
* [ ] Sit or pause long enough to eat
* [ ] Put dishes near the sink when finished

**Minimum version:** Eat something accessible. A snack-sized or packaged option still counts.

Fed is better than perfect. Follow any dietary guidance specific to your health needs.`
    ),
    morningResetTask("3af554a7-aa5c-468f-9518-df0c82c70a56", "Brush your teeth", 10,
        `* [ ] Find your toothbrush and toothpaste
* [ ] Add toothpaste
* [ ] Brush the reachable surfaces
* [ ] Spit and rinse as preferred
* [ ] Put the toothbrush where it can dry

**Minimum version:** Brush for as long as you can manage. A partial brush is better than skipping it entirely.`
    ),
    morningResetTask("7fd78b44-d2ef-4412-9dbb-a01735254cad", "Fill a water bottle", 11,
        `* [ ] Find a clean bottle
* [ ] Fill it with water
* [ ] Close the lid
* [ ] Put it beside your bag or keys

**Minimum version:** Fill any portable cup or place an empty bottle by the door as a reminder.`
    ),
    morningResetTask("23203188-b4cd-4bc9-bc13-732ab26dd02f", "Gather wallet, keys, phone, bag, and lunch", 12,
        `Use the same order each time:

* [ ] wallet
* [ ] keys
* [ ] phone
* [ ] bag
* [ ] lunch or snack
* [ ] medication or personal-care items needed away from home
* [ ] anything required for today's appointments

**Minimum version:** Find your keys, wallet, and phone.

Put everything together by the door instead of relying on yourself to remember it later.`
    ),
    morningResetTask("9c1d2d20-4135-4ee7-8379-a733d2f169d2", "Put on shoes and leaving-the-house essentials", 13,
        `* [ ] Put on comfortable shoes
* [ ] Add a coat, hat, or other weather layer if needed
* [ ] Take anything waiting by the door
* [ ] Check that you can lock the door

**Minimum version:** Put your shoes beside your feet or by the door.

If you are staying home, choose the footwear or essentials that help you start your next activity.`
    ),
    morningResetTask("461ff153-f8c4-471c-a2d8-2a7eedeb6bbb", "Take a short wake-up walk", 14,
        `Choose an option that fits your body, weather, and surroundings:

* [ ] Walk outside for a few minutes
* [ ] Walk one indoor loop
* [ ] Walk to the mailbox, corner, or end of the hall
* [ ] Notice light, air, or movement around you
* [ ] Return or continue into your next activity

**Minimum version:** Walk for one or two minutes, march in place, or stand near daylight.

This is for activation, not exercise performance. Skip or adapt it when walking is not safe or accessible.`
    ),
];

const BEDTIME_ROUTINE_ID = "1029ffd9-12f9-46d1-a450-14ce99e60da0";

function bedtimeRoutineTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = BEDTIME_ROUTINE_ID,
): ChecklistItem {
    return {
        isOwner: true,
        accessRole: 'owner',
        itemType: "checklist-item",
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: "",
        note,
        sortOrder,
        tabSortOrder: { today: 0 },
        category: "self-care",
        mode: "daily",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

export const BEDTIME_ROUTINE_TEMPLATE: ChecklistItem[] = [
    bedtimeRoutineTask(BEDTIME_ROUTINE_ID, "Bedtime routine", 0,
        `**Good enough counts.** This routine is support, not a test you have to pass.

Start with the step that will make tomorrow or bedtime easier. You can do the tasks in a different order, choose a minimum version, or stop when you have done enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    bedtimeRoutineTask("75631906-e6bc-4506-a09e-7c5595dfa196", "Lock doors and do a brief home-safety check", 0,
        `Use the same short route each night:

* [ ] Lock exterior doors
* [ ] Close or secure accessible windows as appropriate
* [ ] Turn off the stove, oven, and unnecessary appliances
* [ ] Check that candles and other flames are out
* [ ] Turn off unneeded lights

**Minimum version:** Lock the main door and check the kitchen.

Once you complete the route, mark the task done so you do not have to rely on memory.`
    ),
    bedtimeRoutineTask("1e4f7946-3381-4fea-bcac-9335b4207c0b", "Capture tomorrow's goals and tasks", 1,
        `Get unfinished thoughts out of your head without planning the entire day:

* [ ] Write down anything you are afraid you will forget
* [ ] Note tomorrow's appointments or deadlines
* [ ] Choose up to three priorities
* [ ] Put the list somewhere you will see it
* [ ] Stop adding details once your brain feels quieter

**Minimum version:** Write down the one thing you most need to remember.

This is a brain dump, not a promise to finish everything tomorrow.`
    ),
    bedtimeRoutineTask("10bfa072-58df-45b5-971e-6ce9e41fdf15", "Pick out tomorrow's clothes", 2,
        `* [ ] Check tomorrow's weather and activities
* [ ] Choose comfortable clothes that work well enough
* [ ] Include underwear and any needed layers
* [ ] Put the outfit together in one visible place
* [ ] Choose a backup option only if it reduces stress

**Minimum version:** Choose the first item you will put on.

The outfit does not need to be new, coordinated, or perfect.`
    ),
    bedtimeRoutineTask("d9210554-8da3-4c09-b6dd-acdfbf95e9e3", "Prepare tomorrow's bag", 3,
        `Use tomorrow's calendar as a prompt:

* [ ] Empty obvious trash from the bag
* [ ] Add your wallet and anything needed for appointments
* [ ] Pack work, school, or personal items
* [ ] Add lunch, snacks, or medication reminders if needed
* [ ] Put the bag beside your keys or by the door

**Minimum version:** Put one essential item in the bag and place the bag by the door.

Perishable food can stay in the refrigerator with a visible reminder on the bag or door.`
    ),
    bedtimeRoutineTask("6944a4c7-5b00-4c53-b8fe-41546dce09f0", "Set tomorrow's alarm", 4,
        `* [ ] Check what time you need to be ready or leave
* [ ] Set the main wake-up alarm
* [ ] Add one backup alarm only if it genuinely helps
* [ ] Check the alarm volume and sound
* [ ] Place the device where you intend to keep it overnight

**Minimum version:** Set one alarm and confirm that it is turned on.

Too many alarms can become background noise. Use the smallest number that reliably supports you.`
    ),
    bedtimeRoutineTask("e04d3d4a-fe49-4d22-815f-819cfbed6d11", "Charge your phone", 5,
        `* [ ] Find the phone and charger
* [ ] Plug in the charger
* [ ] Confirm that the phone is actually charging
* [ ] Put it in its planned overnight spot

**Minimum version:** Connect the charger and check for the charging symbol.

If it helps reduce scrolling, charge the phone out of arm's reach while keeping alarms audible.`
    ),
    bedtimeRoutineTask("9033fdd8-da0f-4937-b171-f82af22603f0", "Make the bed area ready for sleep", 6,
        `* [ ] Clear items from the place where you sleep
* [ ] Straighten enough bedding to get comfortable
* [ ] Adjust the room temperature if needed
* [ ] Put needed sleep supports within reach
* [ ] Reduce obvious noise or light distractions

**Minimum version:** Clear enough space to lie down comfortably.

The room does not need to be clean before you are allowed to sleep.`
    ),
    bedtimeRoutineTask("c01b4ff3-8cea-4b14-9048-ce80725861fd", "Remove makeup and contact lenses", 7,
        `Do only the parts that apply:

* [ ] Wash your hands
* [ ] Remove contact lenses and store or discard them correctly
* [ ] Remove eye and face makeup gently
* [ ] Put supplies back where you can find them

**Minimum version:** Remove contact lenses and the makeup most likely to irritate your eyes or skin.

Never sleep in contacts unless they were specifically prescribed for overnight wear.`
    ),
    bedtimeRoutineTask("737d11a8-d09c-40df-babf-d2d8466bd84d", "Take a shower", 8,
        `Choose the version your body and energy allow:

* [ ] Put a towel and sleepwear within reach
* [ ] Start the water
* [ ] Wash the areas that need attention most
* [ ] Rinse
* [ ] Dry off
* [ ] Put used towels and clothes where they belong

**Minimum version:** Take a short body rinse or use a washcloth at the sink.

Hair washing is optional and can be a separate task.`
    ),
    bedtimeRoutineTask("a0b71634-dc6f-424d-952d-ddfadd98bb83", "Change into sleepwear", 9,
        `* [ ] Choose sleepwear that feels comfortable
* [ ] Put daytime clothes in the hamper or one designated spot
* [ ] Change into sleepwear
* [ ] Add socks or another layer if needed

**Minimum version:** Change the clothing that would make sleep more comfortable.

Comfort matters more than having designated pajamas.`
    ),
    bedtimeRoutineTask("2a570d64-0e70-4cda-a301-28bf60141d48", "Wash your face and moisturize", 10,
        `* [ ] Wet your face or use a gentle face cloth
* [ ] Use cleanser if wanted
* [ ] Rinse or wipe
* [ ] Pat dry
* [ ] Apply moisturizer or the one product your skin needs

**Minimum version:** Wipe your face and apply moisturizer where your skin feels dry.

If you washed your face in the shower, you can complete or skip the washing steps here.`
    ),
    bedtimeRoutineTask("8c58ea64-4322-460e-825a-e12636c9de61", "Brush, floss, and rinse", 11,
        `Choose the fullest version you can manage:

* [ ] Brush your teeth
* [ ] Floss or use an interdental cleaner
* [ ] Use mouthwash if it is part of your routine
* [ ] Put supplies where they can dry or be found tomorrow

**Minimum version:** Brush for as long as you can manage.

Partial care still counts. Follow your dental professional's guidance about products and timing.`
    ),
    bedtimeRoutineTask("45128c99-95c1-4f06-a46a-eb18376fcf6c", "Take planned evening supplements", 12,
        `Only take supplements that are already part of a plan you know is appropriate for you:

* [ ] Check the label or organizer
* [ ] Confirm the supplement and dose
* [ ] Take it at the planned time and as directed
* [ ] Mark it taken using your usual system
* [ ] Notice whether the supply is running low

**Minimum version:** Check your plan and put the approved supplement where you will take it.

Ask a clinician or pharmacist before starting magnesium, melatonin, or another supplement, especially if you take medication, are pregnant or breastfeeding, or have a health condition. Do not double a dose when you are unsure whether you took it.`
    ),
    bedtimeRoutineTask("bc172fd1-90b7-4d79-9487-3fbdcc362a7b", "Take prescribed evening medication", 13,
        `Do only what applies to your prescribed routine:

* [ ] Check the label or medication organizer
* [ ] Confirm the correct medication and dose
* [ ] Take it exactly as prescribed
* [ ] Mark it taken using your usual system
* [ ] Notice whether a refill is running low

**Minimum version:** Get the medication and anything needed to take it in front of you.

If you are unsure whether you already took a dose, follow your prescriber's or pharmacist's instructions—do not guess or double the dose.`
    ),
    bedtimeRoutineTask("0c4c9107-d8a5-4594-800d-21dbbc9dc90f", "Use the bathroom", 14,
        `* [ ] Go to the bathroom
* [ ] Wash and dry your hands
* [ ] Notice whether you need any period or personal-care supplies overnight

**Minimum version:** Meet the immediate need. Everything else can wait.`
    ),
    bedtimeRoutineTask("70fdc155-2bf9-45d0-b3a0-64a1a6f78ef7", "Turn on Do Not Disturb and dim lights", 15,
        `* [ ] Turn on Do Not Disturb or your chosen sleep focus
* [ ] Allow calls from emergency contacts if needed
* [ ] Lower screen brightness or stop using bright screens
* [ ] Dim the room lights
* [ ] Close apps that tend to keep you scrolling

**Minimum version:** Turn on Do Not Disturb and dim one light or screen.

The goal is fewer interruptions, not a perfectly screen-free evening.`
    ),
    bedtimeRoutineTask("537fb8dc-1036-450d-b196-61a53d544bbb", "Read or listen to an audiobook", 16,
        `Choose something calming rather than something you feel obligated to finish:

* [ ] Get comfortable
* [ ] Read one chapter or a few pages, **or**
* [ ] Start an audiobook
* [ ] Set a sleep timer for the audiobook
* [ ] Stop when you notice sleepiness

**Minimum version:** Read one page or listen for five minutes.

Finishing the chapter is optional. Sleep is the stopping cue.`
    ),
    bedtimeRoutineTask("0d25ed96-da12-4dd5-a3ec-2010a60e2cc4", "Get into bed at your planned time", 17,
        `* [ ] Notice your planned bedtime cue or alarm
* [ ] Turn on the fan or preferred white noise
* [ ] Put down anything that is keeping you awake
* [ ] Get into bed
* [ ] Turn off the remaining light

**Minimum version:** Get into bed and turn on your usual sleep sound.

If the routine ran late, you do not have to finish every remaining task before going to sleep.`
    ),
];

const GO_FOR_A_WALK_ID = "4517bc2f-7d16-47b7-9673-f63f6863e5fe";

function walkingRoutineTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = GO_FOR_A_WALK_ID,
): ChecklistItem {
    return {
        isOwner: true,
        accessRole: 'owner',
        itemType: "checklist-item",
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: "",
        note,
        sortOrder,
        tabSortOrder: { today: 0 },
        category: "self-care",
        mode: "daily",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

export const GO_FOR_A_WALK_TEMPLATE: ChecklistItem[] = [
    walkingRoutineTask(GO_FOR_A_WALK_ID, "Go for a walk", 0,
        `**The goal is to begin, not to reach a distance or pace.**

Choose a route that feels comfortable and safe. You can shorten the walk, walk indoors, use a mobility aid, or stop at any time.

You can **skip any task** to hide it from Today.`,
        null
    ),
    walkingRoutineTask("4a66aca8-a5ae-4d5b-8116-e0cc16f9b67d", "Check your body and the weather", 0,
        `* [ ] Notice your energy, pain, dizziness, and sensory needs
* [ ] Check the temperature and chance of rain
* [ ] Check air quality, heat, smoke, or ice when relevant
* [ ] Notice how much daylight is available
* [ ] Choose an outdoor, indoor, shorter, or adapted option

**Minimum version:** Check how your body feels and look outside.

Changing the plan is a successful response to new information—not a failure to walk.`
    ),
    walkingRoutineTask("747b4225-5382-47ea-a051-420612597b04", "Choose a route or time", 1,
        `Keep the decision small:

* [ ] Choose a familiar route, destination, or indoor loop
* [ ] Decide whether you are walking for time or to a place
* [ ] Set a turnaround timer if time blindness may be an issue
* [ ] Tell someone your plan or share your location if that helps you feel safer

**Minimum version:** Choose the end of the block, hallway, or one indoor loop.

A walk around the block is a complete plan.`
    ),
    walkingRoutineTask("5cbb931a-e360-4a09-b507-77d21b75a169", "Use the bathroom", 2,
        `* [ ] Go to the bathroom
* [ ] Wash and dry your hands
* [ ] Notice whether you need any period or personal-care supplies

**Minimum version:** Meet the immediate need. Everything else can wait.`
    ),
    walkingRoutineTask("cfaf98de-5c68-4faf-870b-bf1e1eb6aff9", "Get dressed for the walk", 3,
        `Choose clothing for comfort rather than appearance:

* [ ] Put on comfortable clothes
* [ ] Add a jacket or weather layer if needed
* [ ] Add sunscreen, a hat, or sunglasses when appropriate
* [ ] Add reflective or visible gear in low light
* [ ] Bring any needed mobility or sensory support

**Minimum version:** Add the one layer or item needed to walk safely.

The clothes you are already wearing may be good enough.`
    ),
    walkingRoutineTask("ea905b1a-7b78-445e-9563-a80a13c95be1", "Put on comfortable shoes", 4,
        `* [ ] Find shoes that feel supportive enough
* [ ] Put on socks if wanted
* [ ] Put on both shoes
* [ ] Fasten them securely

**Minimum version:** Put the shoes beside your feet.

If shoes or walking cause pain, choose a comfortable indoor or mobility-adapted option instead.`
    ),
    walkingRoutineTask("b8b03ad0-bac8-48e9-b745-40508bdfe022", "Gather your walking essentials", 5,
        `Take only what helps:

* [ ] phone
* [ ] keys
* [ ] identification
* [ ] water when needed
* [ ] medication or personal-care items when applicable
* [ ] mobility, medical, or sensory support

**Minimum version:** Find your phone and keys.

Put everything into one pocket or bag so you do not have to keep track of separate items.`
    ),
    walkingRoutineTask("2e50a5b0-4bfb-40d5-a46f-b087e0ea4ca2", "Choose something to listen to", 6,
        `This step is optional:

* [ ] Choose music, a podcast, an audiobook, or silence
* [ ] Download it before leaving if needed
* [ ] Connect and check your headphones
* [ ] Choose a volume that preserves environmental awareness

**Minimum version:** Pick one familiar option without searching for the perfect thing.

Use transparency mode, one earbud, or no headphones when you need to hear traffic, people, or your surroundings.`
    ),
    walkingRoutineTask("9e6b2aca-a5c9-4f33-b3ff-f57a5947f54b", "Take the walk", 7,
        `* [ ] Step outside, into the hallway, or onto your indoor route
* [ ] Start at a comfortable pace
* [ ] Continue toward your chosen time or destination
* [ ] Turn around when your timer, body, or surroundings say it is time
* [ ] Stop whenever continuing no longer feels helpful or safe

**Minimum version:** Walk for one or two minutes, march in place, or move to a window or doorway.

If you return after the minimum version, the walk still counts. Indoor walking and mobility-adapted movement count too.`
    ),
    walkingRoutineTask("3b05ecf6-38ac-4e19-8c22-024b4aa32fb8", "Return and reset", 8,
        `* [ ] Put keys and your bag in their homes
* [ ] Take off or put away outdoor layers
* [ ] Put shoes where you can find them
* [ ] Drink water if you are thirsty
* [ ] Notice whether anything hurts or needs care
* [ ] Charge headphones or your phone if needed

**Minimum version:** Put down your keys in their usual place and sit somewhere comfortable.

You do not need to track distance, steps, calories, or pace for the walk to count.`
    ),
];
