import type { ChecklistItem } from "src/app/types";

function leisureTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null,
): ChecklistItem {
    return {
        isOwner: true,
        hasMembers: false,
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
        category: "leisure",
        mode: "one-time",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

const HOBBY_SESSION_ID = "b7755e03-3ba5-410b-8a7f-68968ea51a08";

function hobbySessionTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = HOBBY_SESSION_ID,
): ChecklistItem {
    return leisureTask(id, text, sortOrder, note, parentUuid);
}

export const HOBBY_SESSION_TEMPLATE: ChecklistItem[] = [
    hobbySessionTask(HOBBY_SESSION_ID, "Hobby session", 0,
        `**Enjoyment is the goal.**

You do not need to improve, finish, share, sell, or monetize anything. Choose minimum versions, follow your interest, and stop when you have had enough.

You can **skip any task** to hide it from Today.`,
        null
    ),
    hobbySessionTask("f5050641-bb3c-48c7-9517-bafc30116b79", "Start — Choose one activity or project", 0,
        `Choose based on today's interest and capacity:

* [ ] Look at only a few available options
* [ ] Choose one activity or project
* [ ] Decide whether to continue something or begin something small
* [ ] Put the other options out of immediate view

**Minimum version:** Pick the first option that sounds pleasant enough.

Choosing is part of the session, but it does not need to use the entire session.`
    ),
    hobbySessionTask("61dd8a8b-7b6c-44db-8118-a15dcb96f499", "Start — Choose a small session goal", 1,
        `Choose a direction, not a performance target:

* [ ] Name one part you would enjoy exploring
* [ ] Choose a stopping point you can recognize
* [ ] Separate required setup from optional preparation
* [ ] Leave room to change direction

**Minimum version:** Complete: “For this session, I might ___.”

“Spend time with the hobby” is a valid goal.`
    ),
    hobbySessionTask("b7deecb9-ee31-40f8-83d7-a45044114e5f", "Start — Find the project and essential supplies", 2,
        `Gather only what is needed to begin:

* [ ] Find the project or main material
* [ ] Get the essential tools
* [ ] Check for anything unsafe, dried out, or damaged
* [ ] Put missing optional supplies onto a shopping list
* [ ] Stop gathering when the first action is possible

**Minimum version:** Find the project and one essential tool.

Missing optional supplies do not require an immediate shopping trip.`
    ),
    hobbySessionTask("00d02318-3fb9-4742-a3d8-3dd5eb2ba365", "Start — Prepare a usable space", 3,
        `* [ ] Clear only the space the activity needs
* [ ] Protect the surface if the hobby can stain or spill
* [ ] Adjust lighting, seating, sound, or temperature
* [ ] Get water or sensory support if helpful
* [ ] Put a cleanup container nearby

**Minimum version:** Clear one project-sized area.

The whole room does not need to be clean before you are allowed to begin.`
    ),
    hobbySessionTask("fa4e7fc0-4306-4d62-88c9-ddd64cab83e9", "Start — Set an optional timer", 4,
        `* [ ] Check the time of your next commitment
* [ ] Choose a comfortable session length
* [ ] Set a timer if it will help with time blindness
* [ ] Include cleanup or transition time
* [ ] Decide whether the timer means pause, stop, or reassess

**Minimum version:** Check the current time.

The timer is a boundary and reminder—not a demand to be productive.`
    ),
    hobbySessionTask("05743702-a69e-47bb-b146-4b4b53f10668", "During — Begin for two minutes", 5,
        `* [ ] Touch the material, tool, instrument, book, or project
* [ ] Do the smallest visible action
* [ ] Let interest build after starting
* [ ] Continue only while the activity feels worthwhile

**Minimum version:** Spend two minutes interacting with the hobby.

If you stop after two minutes, the hobby session still counts.`
    ),
    hobbySessionTask("5ced14b1-c822-4c8b-b08d-b776633629c1", "During — Capture distractions for later", 6,
        `* [ ] Keep paper or a blank note nearby
* [ ] Write down unrelated tasks and ideas
* [ ] Return to the activity without resolving them
* [ ] Ignore or silence nonessential notifications
* [ ] Review the captured list after the session

**Minimum version:** Write one distracting thought onto a “Later” list.

Capturing a thought is enough; you do not need to act on it now.`
    ),
    hobbySessionTask("31ca98cc-dc56-4b6b-b924-5e0c5dd38168", "During — Check comfort and interest", 7,
        `Pause briefly:

* [ ] Notice pain, thirst, hunger, temperature, and posture
* [ ] Adjust the environment or take a movement break
* [ ] Notice whether you still want this activity
* [ ] Continue, change direction, or stop intentionally

**Minimum version:** Relax your shoulders and ask, “Do I want to keep going?”

Changing activities or stopping is allowed.`
    ),
    hobbySessionTask("87948071-5a5a-4355-87ff-c3398b5b6dbf", "End — Stop at a recognizable point", 8,
        `* [ ] Notice the timer or a natural pause
* [ ] Finish only the small action currently in progress
* [ ] Avoid beginning a large new section
* [ ] Decide what must be made safe before leaving

**Minimum version:** Pause and put down the tool or material.

You do not need to reach a perfect stopping point.`
    ),
    hobbySessionTask("c1f42c98-fc4a-4fa9-abed-de65f050102c", "End — Save or protect the work", 9,
        `Do only what applies:

* [ ] Save and name the digital file
* [ ] Cover wet or delicate work
* [ ] Secure needles, blades, heat, chemicals, or small parts
* [ ] Photograph the current state if useful
* [ ] Put the project where it will not be damaged

**Minimum version:** Make the work safe to leave.

Safety and preservation come before full cleanup.`
    ),
    hobbySessionTask("76c6baa3-cc8f-4770-a85a-af2aeb42dc46", "End — Leave a restart note", 10,
        `Leave a breadcrumb for next time:

* [ ] Write what you completed
* [ ] Record where you stopped
* [ ] Name the smallest next action
* [ ] Note any missing supply
* [ ] Attach the note to or store it with the project

**Minimum version:** Write: “Next time, start with ___.”

One rough sentence can prevent an entire future reorientation session.`
    ),
    hobbySessionTask("4268dcde-c112-436c-9589-073351f1c5ea", "End — Clean anything time-sensitive or unsafe", 11,
        `Prioritize cleanup that cannot wait:

* [ ] Turn off heat, power, or equipment
* [ ] Wash tools that could dry or harden
* [ ] Close containers that could spill or evaporate
* [ ] Dispose of sharp or hazardous waste safely
* [ ] Wipe active spills

**Minimum version:** Address the one thing that could become unsafe or harder to clean later.

Ordinary tidying can wait.`
    ),
    hobbySessionTask("dd38a103-4550-4175-a061-4826309a14f2", "End — Contain the remaining supplies", 12,
        `* [ ] Put loose supplies into one container
* [ ] Keep project-specific parts together
* [ ] Return essential tools when easy
* [ ] Leave the project accessible for next time
* [ ] Clear enough space for the room's next use

**Minimum version:** Put everything into one project box or designated area.

Containment counts even when complete organization has to wait.`
    ),
];

const PLAN_DAY_TRIP_ID = "627b90f3-b5b5-413a-9146-455139f5b2b3";

function planDayTripTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = PLAN_DAY_TRIP_ID,
): ChecklistItem {
    return leisureTask(id, text, sortOrder, note, parentUuid);
}

export const PLAN_DAY_TRIP_TEMPLATE: ChecklistItem[] = [
    planDayTripTask(PLAN_DAY_TRIP_ID, "Plan a day trip", 0,
        `**A day trip needs one good anchor—not a minute-by-minute itinerary.**

Plan enough to travel safely, access the activity, and return home. Optional stops can remain optional.

You can **skip any task** to hide it from Today.`,
        null
    ),
    planDayTripTask("db59445c-dc63-45d2-9a38-dfcb1833b4b5", "Choose the destination and main activity", 0,
        `* [ ] Choose one destination
* [ ] Identify the main reason you want to go
* [ ] Pick one anchor activity
* [ ] Check that the travel time fits a same-day trip
* [ ] Save optional ideas separately

**Minimum version:** Choose the destination and one thing to do there.

The trip does not need multiple attractions to be worthwhile.`
    ),
    planDayTripTask("762b786c-2e67-4142-afc4-5aec21e4198d", "Choose a date and check capacity", 1,
        `* [ ] Check your calendar
* [ ] Consider travel, activity, and recovery time
* [ ] Check the schedules of anyone joining
* [ ] Notice work, care, health, and sensory constraints
* [ ] Choose a date with enough margin

**Minimum version:** Choose one possible date.

A free day on the calendar is not automatically an unlimited-energy day.`
    ),
    planDayTripTask("aeaf7429-ac98-405a-94cc-e546b814572f", "Check hours, weather, and accessibility", 2,
        `* [ ] Check opening hours and seasonal closures
* [ ] Check the weather and daylight
* [ ] Review accessibility, walking, seating, bathrooms, and food options
* [ ] Check event or construction notices
* [ ] Save the destination's contact information

**Minimum version:** Confirm that the main activity will be open.

Create a weather backup only when it reduces stress.`
    ),
    planDayTripTask("7055274b-014a-430b-a858-820045f96a46", "Estimate the trip budget", 3,
        `Include only relevant costs:

* [ ] Transportation, fuel, charging, tolls, or parking
* [ ] Admission or reservations
* [ ] Food and drinks
* [ ] Care arrangements
* [ ] A small buffer
* [ ] Decide what you are comfortable spending

**Minimum version:** Check the transportation and admission cost.

Free, low-cost, and bring-your-own-food trips count.`
    ),
    planDayTripTask("651788ed-e83a-4754-b23e-c6202f39d5aa", "Plan transportation and the return trip", 4,
        `* [ ] Choose driving, transit, a ride, or another option
* [ ] Check the full travel time
* [ ] Check parking, tolls, fuel, charging, or transit schedules
* [ ] Save the route and destination
* [ ] Choose the latest comfortable departure for home
* [ ] Add a backup option when necessary

**Minimum version:** Decide how you will get there and back.

Plan the return before adding optional stops.`
    ),
    planDayTripTask("a7b0f0ee-f7d0-4497-9dc2-6ce067a124e7", "Invite people or confirm going alone", 5,
        `* [ ] Decide whether you want company
* [ ] Invite specific people with the date and destination
* [ ] Set a response deadline when booking depends on it
* [ ] Confirm who is attending
* [ ] Share cost, transportation, and accessibility information

**Minimum version:** Decide that you are going alone or send one invitation.

A solo day trip is a complete plan.`
    ),
    planDayTripTask("9f53e79e-2cf2-4fc8-b90c-3d694b522068", "Book tickets or reservations", 6,
        `Do only what the trip requires:

* [ ] Reserve admission or a timed entry
* [ ] Book transportation or parking
* [ ] Reserve a meal or activity if necessary
* [ ] Check cancellation policies
* [ ] Save confirmations in one place

**Minimum version:** Book the one item that could sell out.

Do not reserve every optional part of the day.`
    ),
    planDayTripTask("2572ccaa-3cf9-4d67-a45c-a21a0b53bd7a", "Create a light itinerary", 7,
        `* [ ] Choose an approximate departure time
* [ ] Add the anchor activity
* [ ] Include meals, breaks, and bathroom access
* [ ] Add no more than one or two optional stops
* [ ] Choose an approximate return time
* [ ] Share the plan with anyone attending

**Minimum version:** Write: leave, anchor activity, return.

Leave open space for delays, interest, and rest.`
    ),
    planDayTripTask("aafdfbc2-e477-4f74-b8db-7fe916a2bc9d", "Arrange home and care responsibilities", 8,
        `Do only what applies:

* [ ] Arrange pet, child, elder, plant, or household care
* [ ] Confirm medications, meals, keys, and contact details
* [ ] Pause deliveries when necessary
* [ ] Share your destination and return estimate with a trusted person
* [ ] Add a backup contact

**Minimum version:** Confirm the one responsibility that cannot wait until you return.`
    ),
    planDayTripTask("a6bf3b7d-9166-4bab-a688-f3822bbf0579", "Pack day-trip essentials", 9,
        `Pack for the actual plan and conditions:

* [ ] Phone, wallet, keys, and identification
* [ ] Tickets and confirmations
* [ ] Medication and personal-care items
* [ ] Water and food
* [ ] Charger or battery pack
* [ ] Weather layers and sun protection
* [ ] Accessibility and sensory supports

**Minimum version:** Pack phone, wallet, keys, medication, water, and entry confirmation.

Put everything into one bag.`
    ),
    planDayTripTask("f6d44093-7a57-4413-88cb-129f8b098b40", "Add the trip and reminders to the calendar", 10,
        `* [ ] Add the trip date and destination
* [ ] Include departure and return estimates
* [ ] Link tickets, route, and itinerary
* [ ] Set a packing reminder
* [ ] Set getting-ready and leave-now reminders
* [ ] Share the calendar event when helpful

**Minimum version:** Add the date, departure time, and destination.

Use realistic transition time rather than the fastest possible estimate.`
    ),
    planDayTripTask("deec3af0-9c21-41d8-8cd1-f7246b55deed", "Confirm the plan before leaving", 11,
        `The day before or morning of the trip:

* [ ] Recheck hours, weather, traffic, and transit
* [ ] Confirm tickets and reservations
* [ ] Confirm people and care arrangements
* [ ] Charge devices
* [ ] Finish packing last-minute items
* [ ] Shorten or change the plan if conditions changed

**Minimum version:** Confirm the destination is open and transportation still works.

Changing or canceling for safety, health, or capacity is allowed.`
    ),
];

const PLAN_LEISURE_OUTING_ID = "c9c4b103-baa2-4837-8fdb-6bc834c38461";

function planLeisureOutingTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = PLAN_LEISURE_OUTING_ID,
): ChecklistItem {
    return leisureTask(id, text, sortOrder, note, parentUuid);
}

export const PLAN_LEISURE_OUTING_TEMPLATE: ChecklistItem[] = [
    planLeisureOutingTask(PLAN_LEISURE_OUTING_ID, "Plan a leisure outing", 0,
        `**The outing can be short, local, inexpensive, and still count.**

Choose enough structure to make leaving easier without turning leisure into a complicated project.

You can **skip any task** to hide it from Today.`,
        null
    ),
    planLeisureOutingTask("25bc830c-a595-4bcc-8eb9-2396c389d187", "Choose an activity", 0,
        `Choose from a small set of options:

* [ ] Decide what kind of experience sounds good
* [ ] Choose one activity
* [ ] Match it to current energy, budget, and sensory needs
* [ ] Save other ideas for later

**Minimum version:** Choose the first option that sounds pleasant enough.

A walk, bookstore visit, café, park, movie, or museum can all be complete outings.`
    ),
    planLeisureOutingTask("62f86fa1-2527-4dbc-b546-9c5f45036184", "Check the practical details", 1,
        `* [ ] Check the date and opening hours
* [ ] Check cost, tickets, or reservation requirements
* [ ] Check weather when relevant
* [ ] Review accessibility, bathrooms, food, seating, and sensory conditions
* [ ] Save the address and contact information

**Minimum version:** Confirm that the activity is open and affordable.

Do not research every review before deciding.`
    ),
    planLeisureOutingTask("1605dc24-0170-4262-bff8-659e2625c016", "Invite someone or decide to go alone", 2,
        `* [ ] Decide whether company would improve the outing
* [ ] Invite one or more specific people
* [ ] Include the activity, date, and approximate time
* [ ] Set a response deadline if booking depends on it
* [ ] Confirm who is attending

**Minimum version:** Decide to go alone or send one invitation.

Going alone is not a backup version of the outing.`
    ),
    planLeisureOutingTask("62da767a-39c5-4292-a5ea-b145204a81d7", "Add the outing to the calendar", 3,
        `* [ ] Add the date and start time
* [ ] Add the address or link
* [ ] Include travel and arrival time
* [ ] Link tickets or the event page
* [ ] Invite anyone attending

**Minimum version:** Add the date, time, and location.

Scheduling enjoyment makes it easier to protect—not less spontaneous.`
    ),
    planLeisureOutingTask("f4f20051-94e3-431a-b090-dfb057fa63d2", "Get tickets or make a reservation", 4,
        `Do only what the activity requires:

* [ ] Choose the date or time slot
* [ ] Purchase tickets or make the reservation
* [ ] Check cancellation terms
* [ ] Save the confirmation
* [ ] Share details with anyone attending

**Minimum version:** Reserve the one thing needed for entry.

Skip this task when the outing does not require booking.`
    ),
    planLeisureOutingTask("1f3d4945-d9b0-4fe1-80a3-f7c70450be8d", "Plan transportation", 5,
        `* [ ] Choose driving, transit, walking, a ride, or another option
* [ ] Check travel and parking time
* [ ] Save the route
* [ ] Decide when to leave
* [ ] Make a comfortable return or exit plan

**Minimum version:** Decide how you will get there and home.

The exit plan can include leaving early.`
    ),
    planLeisureOutingTask("7300e358-b1db-43af-b207-ae8034caf89a", "Choose clothing and pack essentials", 6,
        `* [ ] Check weather and activity needs
* [ ] Choose comfortable clothing and shoes
* [ ] Pack phone, wallet, keys, and entry confirmation
* [ ] Add medication and personal-care items
* [ ] Add water, layers, charger, or sensory supports when helpful

**Minimum version:** Gather phone, wallet, keys, and anything required for entry.

Put everything together in one bag or place by the door.`
    ),
    planLeisureOutingTask("fac00c9e-4aee-42db-b2fe-f5f51f2b192e", "Set getting-ready and leave-now reminders", 7,
        `* [ ] Calculate realistic travel time
* [ ] Include dressing, parking, and transition time
* [ ] Set a begin-getting-ready reminder
* [ ] Set a leave-now reminder
* [ ] Share timing with anyone attending

**Minimum version:** Set one leave-now alarm.

Use the time you actually need, not the best-case estimate.`
    ),
    planLeisureOutingTask("d8e71111-34d1-49a2-a574-17917bd2d9f6", "Plan a comfortable ending", 8,
        `* [ ] Decide how long you might want to stay
* [ ] Identify a quiet place or break option
* [ ] Choose a signal or script for leaving
* [ ] Protect travel and recovery time afterward
* [ ] Keep the rest of the day lighter when helpful

**Minimum version:** Give yourself permission to leave when you have had enough.

Enjoyment does not require staying until the official end.`
    ),
];
