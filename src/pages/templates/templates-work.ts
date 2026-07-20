import {
    FrequencyType,
    INTERVAL_RECURRENCE,
    type ChecklistItem,
    type Mode,
} from "src/app/types";

type WorkSchedule = "daily" | "weekly" | "one-time";

function workTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null,
    schedule: WorkSchedule,
): ChecklistItem {
    const mode: Mode = schedule === "weekly"
        ? "occasional"
        : schedule;

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
        category: "work",
        mode,
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: schedule === "weekly" ? {
            type: INTERVAL_RECURRENCE,
            numberOfRepetitions: 1,
            frequency: FrequencyType.Weekly,
            startDate: "",
        } : null,
        nextDue: null,
    };
}

const START_WORKDAY_ID = "83963dc5-27e9-4776-878b-dff554e9f6c8";

function startWorkdayTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = START_WORKDAY_ID,
): ChecklistItem {
    return workTask(id, text, sortOrder, note, parentUuid, "daily");
}

export const START_WORKDAY_TEMPLATE: ChecklistItem[] = [
    startWorkdayTask(START_WORKDAY_ID, "Start the workday", 0,
        `**You do not need to understand or plan the entire day before beginning.**

Use this routine to find one useful starting point. Choose minimum versions, change the order, or stop planning once you know what to do next.

You can **skip any task** to hide it from Today.`,
        null
    ),
    startWorkdayTask("b9425c76-bd50-4d1c-acbe-bcefb0cb5e39", "Check today's calendar", 0,
        `Look only at **today**:

* [ ] Check meetings, appointments, and start times
* [ ] Notice anything requiring travel or preparation
* [ ] Look for overlapping commitments
* [ ] Set an alarm for the next transition

**Minimum version:** Check the time of your next commitment.

You do not need to plan the entire day yet.`
    ),
    startWorkdayTask("02a84ac4-528f-4e9f-a72f-34ce19d12428", "Check deadlines and scheduled commitments", 1,
        `* [ ] Look for work due today
* [ ] Check anything due before the next workday
* [ ] Notice promised responses or handoffs
* [ ] Confirm which deadlines are fixed
* [ ] Add missing deadlines to the calendar or task list

**Minimum version:** Identify the next fixed deadline.

Seeing a deadline does not mean you must solve it immediately.`
    ),
    startWorkdayTask("9f54fd55-765f-4a80-ab76-d350366f8baa", "Review captured tasks", 2,
        `Review your trusted capture places without organizing everything:

* [ ] Check your main task list
* [ ] Check notes from yesterday
* [ ] Look for tasks captured in messages or on paper
* [ ] Move only today's relevant tasks into view
* [ ] Leave the rest where they are

**Minimum version:** Check your main task list and yesterday's final note.

This is a scan, not an inbox-cleaning session.`
    ),
    startWorkdayTask("da06a6fc-d27c-410a-84e9-78fc28f5ffde", "Choose one must-do task", 3,
        `Choose the task with the most meaningful consequence or value:

* [ ] Consider deadlines and people waiting
* [ ] Consider what would unblock other work
* [ ] Pick **one** must-do task
* [ ] Write it somewhere visible
* [ ] Define what “enough for today” means

**Minimum version:** Circle or star the task that matters most.

“Must-do” is a focus aid, not a judgment about your worth or effort.`
    ),
    startWorkdayTask("fc5c2a29-bbfa-43fe-b849-7e192fb6aac5", "Choose up to two secondary tasks", 4,
        `* [ ] Choose tasks that fit around today's commitments
* [ ] Prefer tasks that are small, useful, or time-sensitive
* [ ] Limit the list to two
* [ ] Put everything else out of immediate view

**Minimum version:** Choose no secondary tasks today.

One meaningful task is a valid workday plan.`
    ),
    startWorkdayTask("ed7db92c-c3ec-48c4-8503-568f15619341", "Define the first visible action", 5,
        `Turn the must-do task into something you can physically begin:

* [ ] Name the file, person, tool, or place involved
* [ ] Choose an action that takes only a few minutes to start
* [ ] Begin with a verb: open, find, draft, ask, compare, or review
* [ ] Write the action beside the task

**Minimum version:** Complete this sentence: “First, I will ___.”

If the action still feels vague, make it smaller.`
    ),
    startWorkdayTask("40c9f653-4acb-4da1-a9b4-e508287d4400", "Gather files and materials", 6,
        `Gather only what the first action requires:

* [ ] Open the correct file or workspace
* [ ] Find relevant notes or requirements
* [ ] Get any physical materials
* [ ] Request missing access or information
* [ ] Close duplicate or outdated versions

**Minimum version:** Open the one file, message, or tool needed to start.

Do not research everything that might eventually be useful.`
    ),
    startWorkdayTask("d846f046-b386-45cd-808d-779e678bf4df", "Set a focus window", 7,
        `* [ ] Choose a realistic amount of time
* [ ] Set a visible timer
* [ ] Include transition time before the next commitment
* [ ] Decide what you will do when the timer ends

**Minimum version:** Set a five-minute timer.

The timer creates a container; it is not a demand to finish the task.`
    ),
    startWorkdayTask("8586e7d9-229e-4946-a6dc-5e5ed2f04733", "Silence unrelated notifications", 8,
        `Protect only the current focus window:

* [ ] Turn on a work focus or Do Not Disturb mode
* [ ] Keep emergency contacts or required channels available
* [ ] Close unrelated chat and email windows
* [ ] Put the phone outside your immediate sight if helpful

**Minimum version:** Silence one distracting app.

You do not need to become unreachable to create a little quiet.`
    ),
    startWorkdayTask("d9e36b40-1d1c-40f3-9dd4-5feef5e68af5", "Begin the first action", 9,
        `Stop preparing and touch the work:

* [ ] Open the starting place
* [ ] Do the first visible action
* [ ] Continue until the timer ends or you reach a natural pause
* [ ] Put unrelated thoughts onto a parking-lot list

**Minimum version:** Work on the task for two minutes.

Starting is the completion condition for this routine.`
    ),
];

const END_WORKDAY_ID = "66076ced-e71a-497f-bbfe-09564eaa9ca8";

function endWorkdayTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = END_WORKDAY_ID,
): ChecklistItem {
    return workTask(id, text, sortOrder, note, parentUuid, "daily");
}

export const END_WORKDAY_TEMPLATE: ChecklistItem[] = [
    endWorkdayTask(END_WORKDAY_ID, "End the workday", 0,
        `**The goal is a clean handoff to tomorrow—not finishing everything.**

Capture enough context that tomorrow-you can restart without reconstructing the entire day. Then give yourself permission to stop.

You can **skip any task** to hide it from Today.`,
        null
    ),
    endWorkdayTask("49b4eaeb-c627-4d8f-96e1-babf840a0081", "Capture unfinished thoughts and tasks", 0,
        `* [ ] Write down anything you are trying to remember
* [ ] Capture new requests and ideas
* [ ] Add unfinished work to the task list
* [ ] Record names of people you need to contact
* [ ] Stop when your brain feels quieter

**Minimum version:** Write down the one thought most likely to follow you after work.

This is a brain dump, not an evening work plan.`
    ),
    endWorkdayTask("cfb68375-b379-485d-9df9-c62c321d3ee1", "Record where you stopped", 1,
        `For each important active task, leave a breadcrumb:

* [ ] Note the file, screen, or section you were using
* [ ] Record what was completed
* [ ] Record what is still unresolved
* [ ] Save or sync the current version

**Minimum version:** Write one sentence: “I stopped after ___.”

A rough note is more useful than trusting tomorrow's memory.`
    ),
    endWorkdayTask("5655ca3e-07b2-4757-b95b-b34fb4093725", "Write the next action", 2,
        `* [ ] Choose the task you are most likely to resume
* [ ] Identify the smallest physical next step
* [ ] Begin with a verb
* [ ] Put the instruction where you will see it

**Minimum version:** Complete: “Next, open ___ and ___.”

The next action does not need to solve the whole task.`
    ),
    endWorkdayTask("c33ea4ca-2b03-4dca-a38c-901d88b313d9", "Send promised updates", 3,
        `Check only commitments that would affect someone else's work:

* [ ] Send completed deliverables
* [ ] Share progress when an update was promised
* [ ] Flag delays or blockers early
* [ ] Ask the question needed to move forward

**Minimum version:** Send one short status message to the person waiting.

A clear two-sentence update is enough.`
    ),
    endWorkdayTask("8895d3d2-2f3b-47f1-9a55-9f0bbba79cf8", "Check tomorrow's first commitment", 4,
        `* [ ] Check the time of tomorrow's first meeting or deadline
* [ ] Confirm the location or link
* [ ] Notice any preparation or travel needed
* [ ] Set a transition or leave-now alarm

**Minimum version:** Check what time you need to begin tomorrow.

Do not review the entire week unless it helps.`
    ),
    endWorkdayTask("f16d0e4c-24c5-4ad8-ad79-2530525f0321", "Choose tomorrow's starting task", 5,
        `* [ ] Consider the next deadline or blocked person
* [ ] Choose one task to open first
* [ ] Put it at the top of tomorrow's list
* [ ] Pair it with the next action you already wrote

**Minimum version:** Star tomorrow's first task.

Tomorrow can change. This choice only removes one morning decision.`
    ),
    endWorkdayTask("f2ccf1e5-0d6f-4c96-a8c5-c26287162822", "Close work tabs and applications", 6,
        `* [ ] Save active work
* [ ] Bookmark or capture anything needed later
* [ ] Close unrelated tabs
* [ ] Quit work applications when appropriate
* [ ] Leave only tomorrow's useful starting place

**Minimum version:** Save your work and close one noisy window.

You do not need to sort every tab before closing it.`
    ),
    endWorkdayTask("6e9abaf6-8370-45fc-9991-b7f359e67938", "Put away work materials", 7,
        `* [ ] Put papers into one tray or folder
* [ ] Return tools and supplies
* [ ] Clear enough space for the next activity
* [ ] Plug in devices that need charging
* [ ] Put confidential materials somewhere appropriate

**Minimum version:** Put all loose work materials into one designated container.

Containment counts even when organization has to wait.`
    ),
    endWorkdayTask("419b001f-c4bb-4f27-9cec-48dc9f177e89", "Turn off work notifications", 8,
        `* [ ] Set your work status if needed
* [ ] Turn off work email and chat notifications
* [ ] Keep true emergency channels available if required
* [ ] Move work apps off the current screen
* [ ] Say or write a clear stopping cue

**Minimum version:** Turn off the noisiest work notification.

Stopping is part of the work process, not a reward for finishing everything.`
    ),
];

const WEEKLY_WORK_RESET_ID = "66e296b9-48ec-41f0-86ec-2410883d30ca";

function weeklyWorkResetTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = WEEKLY_WORK_RESET_ID,
): ChecklistItem {
    return workTask(id, text, sortOrder, note, parentUuid, "weekly");
}

export const WEEKLY_WORK_RESET_TEMPLATE: ChecklistItem[] = [
    weeklyWorkResetTask(WEEKLY_WORK_RESET_ID, "Weekly work reset", 0,
        `**The goal is to make next week easier—not to create a perfect plan.**

Work from deadlines and real capacity. Postponing, renegotiating, and removing tasks are valid planning actions.

You can **skip any task** to hide it from Today.`,
        null
    ),
    weeklyWorkResetTask("3adf5c37-c4a2-46b9-9e2b-f17941d2ef49", "Review completed work", 0,
        `Look for evidence of progress:

* [ ] Review completed tasks and calendar events
* [ ] Note deliverables, decisions, and problems solved
* [ ] Save accomplishments needed for status reports or reviews
* [ ] Acknowledge invisible coordination and support work

**Minimum version:** Write down three things you completed or moved forward.

Progress includes clarification, communication, and recovery from problems.`
    ),
    weeklyWorkResetTask("7ca54881-f61a-466f-ae29-18efc07cd709", "Collect loose notes and tasks", 1,
        `Check only your usual capture places:

* [ ] Paper notes
* [ ] Digital notes
* [ ] Flagged messages
* [ ] Downloads or screenshots
* [ ] Tasks still held in your head
* [ ] Move actionable items into one trusted list

**Minimum version:** Process one capture place.

Do not organize every file or message while collecting tasks.`
    ),
    weeklyWorkResetTask("f9c3d916-cdea-410e-a660-b2d38a0a1c9c", "Review active projects", 2,
        `Take one project at a time:

* [ ] Confirm the desired outcome
* [ ] Note current status
* [ ] Identify the next action
* [ ] Check whether someone is waiting
* [ ] Pause projects that are no longer active

**Minimum version:** Review the most urgent or confusing project.

If a project has no next action, write the question that must be answered.`
    ),
    weeklyWorkResetTask("f854a423-a238-4d76-9e75-1da63ed5b2c9", "Check upcoming deadlines", 3,
        `* [ ] Check the next two weeks
* [ ] Confirm fixed delivery dates
* [ ] Look for approvals or dependencies due earlier
* [ ] Add missing dates to the calendar
* [ ] Flag deadlines that no longer look realistic

**Minimum version:** Identify the next fixed deadline and its preparation date.

Raise timing concerns before solving them alone.`
    ),
    weeklyWorkResetTask("2a922d39-75a8-4c2b-b359-51cd932a6b53", "Review next week's calendar", 4,
        `* [ ] Check meetings and appointments
* [ ] Notice heavy or meeting-free days
* [ ] Add travel and transition time
* [ ] Identify preparation needed
* [ ] Protect breaks and non-work commitments

**Minimum version:** Check Monday and the busiest day.

Calendar space is not automatically available energy.`
    ),
    weeklyWorkResetTask("a8e455bb-dc9a-49fc-839e-b399ac0f6a53", "Identify blocked work", 5,
        `* [ ] Look for tasks waiting on information, access, or decisions
* [ ] Name the blocker clearly
* [ ] Identify who can help
* [ ] Write the smallest request
* [ ] Decide whether to wait, escalate, or change direction

**Minimum version:** Name one blocker and the person who can address it.

Being blocked is project information, not a personal failure.`
    ),
    weeklyWorkResetTask("4fa25f67-4453-40d5-a01a-d0150076e83f", "Send needed follow-ups", 6,
        `* [ ] Follow up on time-sensitive requests
* [ ] Confirm promised decisions or deliverables
* [ ] Send short status updates
* [ ] Add a future follow-up date when needed
* [ ] Record what you are waiting for

**Minimum version:** Send the one message that would unblock the most work.

A polite, direct follow-up does not need a long apology.`
    ),
    weeklyWorkResetTask("cdf21c8d-85c2-4ae2-b997-1614fbb768fd", "Choose next week's priorities", 7,
        `Use deadlines, impact, and capacity:

* [ ] Choose one primary outcome
* [ ] Choose up to two secondary outcomes
* [ ] Distinguish required work from optional improvement
* [ ] Put lower-priority work out of immediate view

**Minimum version:** Choose the one outcome that matters most.

Priorities are choices. A list where everything is important has not been prioritized.`
    ),
    weeklyWorkResetTask("4c4450a6-7592-4448-a25b-f58720fafc69", "Schedule focus time", 8,
        `* [ ] Find realistic openings around meetings
* [ ] Match demanding work to your better-energy periods when possible
* [ ] Add one or more bounded focus blocks
* [ ] Include setup and transition time
* [ ] Leave unscheduled capacity for surprises

**Minimum version:** Schedule one protected focus block.

Do not fill every open hour.`
    ),
    weeklyWorkResetTask("f2f0d38d-a784-4a4d-9c67-3bc2379971e0", "Remove, postpone, or renegotiate work", 9,
        `Review what does not fit:

* [ ] Delete tasks that no longer matter
* [ ] Postpone work that is not truly due
* [ ] Reduce scope where appropriate
* [ ] Renegotiate unrealistic deadlines
* [ ] Ask for help or reassign work when possible

**Minimum version:** Remove or postpone one task.

A realistic plan is more useful than an aspirational list you cannot complete.`
    ),
];

const FOCUS_SESSION_ID = "9de9091b-2d21-48c5-b442-0479e02c17f5";

function focusSessionTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = FOCUS_SESSION_ID,
): ChecklistItem {
    return workTask(id, text, sortOrder, note, parentUuid, "one-time");
}

export const FOCUS_SESSION_TEMPLATE: ChecklistItem[] = [
    focusSessionTask(FOCUS_SESSION_ID, "Focus session", 0,
        `**A focus session needs a stopping point—not a promise to finish the project.**

Choose one bounded outcome and a realistic amount of time. Starting, learning what is blocked, or leaving a clear next action can all make the session successful.

You can **skip any task** to hide it from Today.`,
        null
    ),
    focusSessionTask("1712f9ca-e257-4aa1-a55b-dd2d7c6a8d32", "Define done for this session", 0,
        `Choose an outcome small enough for one session:

* [ ] Name the task or project
* [ ] Choose one section, decision, or deliverable
* [ ] Write what will exist when the timer ends
* [ ] Separate required work from optional polish

**Minimum version:** Complete: “For this session, done means ___.”

“Make progress” is too vague; name something you can see or verify.`
    ),
    focusSessionTask("0575b3ee-2a91-457e-9817-ab5a8088ee41", "Choose the smallest starting action", 1,
        `* [ ] Identify the file, tool, person, or material involved
* [ ] Choose an action that takes only a few minutes to begin
* [ ] Start with a verb
* [ ] Make the action smaller if you still feel stuck

**Minimum version:** Write: “First, I will open ___.”

You are choosing an entry point, not planning every later step.`
    ),
    focusSessionTask("695448f4-776d-46d7-9610-e62227f2cc76", "Gather required materials", 2,
        `Gather only what this session requires:

* [ ] Open the correct file or workspace
* [ ] Find the requirements or source material
* [ ] Get any physical tools
* [ ] Request missing access
* [ ] Close duplicate versions

**Minimum version:** Open the one file, message, or tool needed to begin.

Stop gathering when you can perform the first action.`
    ),
    focusSessionTask("79e79695-8aa5-476f-b072-2538d3d94a07", "Meet immediate body and sensory needs", 3,
        `Take a brief setup check:

* [ ] Use the bathroom if needed
* [ ] Get water or an accessible snack
* [ ] Take scheduled medication
* [ ] Adjust lighting, sound, temperature, or seating
* [ ] Get a fidget, headphones, or other support

**Minimum version:** Address the need most likely to interrupt you.

This is preparation for focus, not procrastination through a perfect setup.`
    ),
    focusSessionTask("76e7e2f6-e3f0-4600-817d-f3142f36bd55", "Close unrelated tabs and apps", 4,
        `* [ ] Save anything important
* [ ] Close or minimize unrelated windows
* [ ] Open only the tools needed for this session
* [ ] Put your phone out of sight if helpful

**Minimum version:** Close the noisiest tab or app.

Leave required communication channels available when your work depends on them.`
    ),
    focusSessionTask("bb29a49a-233d-48f6-903c-b797632b54d9", "Create a distraction parking lot", 5,
        `* [ ] Open a blank note or use a piece of paper
* [ ] Title it “Later”
* [ ] Write unrelated thoughts there as they appear
* [ ] Return to the current action without resolving them
* [ ] Review the list after the session

**Minimum version:** Put paper and a pen beside you.

Capturing a thought is enough; you do not need to act on it now.`
    ),
    focusSessionTask("0106d0c7-8bd3-4e18-99ff-3e5fa3dfba52", "Set a timer", 6,
        `* [ ] Choose a realistic focus length
* [ ] Set a visible timer
* [ ] Check the time of your next commitment
* [ ] Include a transition buffer
* [ ] Decide what the timer means: pause, stop, or reassess

**Minimum version:** Set a five-minute timer.

The timer is permission to stop and reassess—not a demand to work without moving.`
    ),
    focusSessionTask("fb176c9d-8fae-43c1-94eb-5877575fcb3d", "Work until the stopping cue", 7,
        `* [ ] Begin the smallest starting action
* [ ] Keep the session outcome visible
* [ ] Put distractions onto the parking-lot list
* [ ] Take brief movement or sensory pauses when needed
* [ ] Stop or reassess when the timer ends

**Minimum version:** Work for two minutes.

Discovering a blocker is useful progress when you record it clearly.`
    ),
    focusSessionTask("27b94292-4378-464c-8845-b89295b07b01", "Record where you stopped", 8,
        `* [ ] Save the current version
* [ ] Note what you completed
* [ ] Record the file, section, or screen
* [ ] Write down blockers or unresolved questions
* [ ] Capture the smallest next action

**Minimum version:** Write: “I stopped after ___; next, ___.”

Leave a breadcrumb while the context is still fresh.`
    ),
    focusSessionTask("387d90ae-42a7-4b39-945b-59fb990560ed", "Choose to continue or take a break", 9,
        `Pause before automatically extending the session:

* [ ] Notice energy, focus, pain, hunger, and time
* [ ] Check the next commitment
* [ ] Decide to continue, switch, stop, or take a break
* [ ] Set a new timer if continuing
* [ ] Leave the workspace ready if stopping

**Minimum version:** Stand up, breathe, and make an intentional choice.

Stopping at the planned time is successful completion.`
    ),
];
