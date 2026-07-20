import {
    FrequencyType,
    INTERVAL_RECURRENCE,
    type ChecklistItem,
    type Mode,
} from "src/app/types";

type PeopleSchedule = "weekly" | "one-time";

function peopleTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null,
    schedule: PeopleSchedule,
): ChecklistItem {
    const mode: Mode = schedule === "weekly" ? "occasional" : "one-time";

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
        category: "people",
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

const COORDINATE_HOUSEHOLD_ID = "4b2326ed-79f6-4a9a-868a-63a16205b510";

function householdCoordinationTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = COORDINATE_HOUSEHOLD_ID,
): ChecklistItem {
    return peopleTask(id, text, sortOrder, note, parentUuid, "weekly");
}

export const COORDINATE_HOUSEHOLD_TEMPLATE: ChecklistItem[] = [
    householdCoordinationTask(COORDINATE_HOUSEHOLD_ID, "Coordinate household or family logistics", 0,
        `**Coordination does not mean doing every task yourself.**

Use this reset to make responsibilities, timing, and missing information visible. Assign an owner whenever possible instead of holding the entire plan in your head.

You can **skip any task** to hide it from Today.`,
        null
    ),
    householdCoordinationTask("84dfc988-dfbd-48b4-bcc7-c992be371b7b", "Review the shared calendar", 0,
        `Look at the next one to two weeks:

* [ ] Check appointments, school, work, care, and social events
* [ ] Look for overlapping commitments
* [ ] Notice travel and transition time
* [ ] Add missing events
* [ ] Confirm which calendar is the source of truth

**Minimum version:** Check the next seven days for conflicts.

You do not need to solve every conflict during the review.`
    ),
    householdCoordinationTask("48780218-b6ff-4f4a-b77f-ee1a3867a309", "Collect household needs and updates", 1,
        `Ask for information instead of guessing:

* [ ] Check recent messages, school notices, and paperwork
* [ ] Ask household members what changed
* [ ] Capture appointments, deadlines, errands, and supply needs
* [ ] Note anything waiting on a decision
* [ ] Put the updates into one shared place

**Minimum version:** Ask, “What do I need to know about this week?”

Other people are responsible for communicating their needs too.`
    ),
    householdCoordinationTask("47f2df10-d68f-4554-b716-74df8fa40419", "Confirm important plans", 2,
        `Focus on plans with consequences if details are wrong:

* [ ] Confirm dates and start times
* [ ] Confirm locations or links
* [ ] Check drop-off, pickup, arrival, or departure expectations
* [ ] Verify tickets, reservations, or registration
* [ ] Ask about anything unclear

**Minimum version:** Confirm the next time-sensitive plan.

A short confirmation message is enough.`
    ),
    householdCoordinationTask("cf642c0e-1d1b-4937-adce-d87dcb2c766e", "Coordinate transportation", 3,
        `* [ ] Identify who needs to go where
* [ ] Choose the driver, transit route, ride, or backup
* [ ] Check travel and parking time
* [ ] Add leave-now reminders
* [ ] Share the transportation plan

**Minimum version:** Decide how the next person gets to the next commitment.

Do not automatically assign yourself as the driver.`
    ),
    householdCoordinationTask("b0aa62df-b626-4718-8745-2540d6a56fe4", "Assign responsibilities and owners", 4,
        `Make invisible work visible:

* [ ] List tasks required for upcoming plans
* [ ] Give each task one clear owner
* [ ] Confirm that the owner accepts it
* [ ] Add a due date when timing matters
* [ ] Record what is delegated

**Minimum version:** Assign one task to someone other than yourself.

“We need to” is not an assignment. Name who will do what.`
    ),
    householdCoordinationTask("d91a71e5-2353-4871-aef4-fbb9f1c91ca7", "Arrange care and coverage", 5,
        `Do only what applies this week:

* [ ] Check childcare, elder care, pet care, or household coverage
* [ ] Confirm dates, times, addresses, and contact details
* [ ] Share routines, access instructions, and emergency information
* [ ] Confirm payment or supplies if relevant
* [ ] Add a backup contact

**Minimum version:** Confirm the next care handoff.

Keep sensitive information in an appropriate secure place.`
    ),
    householdCoordinationTask("ad121b9e-a0b6-4817-96a4-5ca18e157361", "Share the plan", 6,
        `Put the useful information where everyone can see it:

* [ ] Update the shared calendar
* [ ] Send a concise summary
* [ ] Include owners, dates, times, and locations
* [ ] Highlight anything requiring a response
* [ ] Ask people to confirm their part

**Minimum version:** Share the next important plan with the people involved.

You do not need to write a perfect family newsletter.`
    ),
    householdCoordinationTask("c33c6de2-40e9-4d0f-bc5a-94080662e193", "Set reminders and preparation cues", 7,
        `* [ ] Set reminders for deadlines and departures
* [ ] Add preparation time before events
* [ ] Put physical items by the door when appropriate
* [ ] Add visible notes for refrigerator or bag items
* [ ] Let each person manage their own reminders when possible

**Minimum version:** Set the next leave-now or deadline reminder.

One well-timed cue is often more useful than many repeated alarms.`
    ),
    householdCoordinationTask("5498d96f-bd9a-45f0-be92-84f83e5857b4", "Capture follow-ups and unresolved decisions", 8,
        `* [ ] List unanswered questions
* [ ] Record who is responsible for each answer
* [ ] Add follow-up dates
* [ ] Create separate tasks for actions that cannot happen now
* [ ] Remove resolved items from immediate view

**Minimum version:** Capture the one unresolved issue most likely to be forgotten.

You do not need to resolve every open loop during this reset.`
    ),
];

const SCHEDULE_APPOINTMENT_ID = "08fb4a46-56a1-43e0-b59d-58ec6bfe47c3";

function scheduleAppointmentTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = SCHEDULE_APPOINTMENT_ID,
): ChecklistItem {
    return peopleTask(id, text, sortOrder, note, parentUuid, "one-time");
}

export const SCHEDULE_APPOINTMENT_TEMPLATE: ChecklistItem[] = [
    scheduleAppointmentTask(SCHEDULE_APPOINTMENT_ID, "Schedule an appointment", 0,
        `**The completion goal is a booked appointment or a clear next follow-up.**

You do not need to solve every form, referral, insurance, or transportation detail before making first contact.

You can **skip any task** to hide it from Today.`,
        null
    ),
    scheduleAppointmentTask("de62eb47-5538-434a-9d24-98db7e16f37f", "Define the appointment needed", 0,
        `* [ ] Name the person, service, or type of appointment
* [ ] Write the reason in one sentence
* [ ] Note any deadline or urgency
* [ ] Identify whether it must be in person, remote, or either

**Minimum version:** Write: “I need an appointment for ___.”

You do not need the perfect explanation before contacting the office.`
    ),
    scheduleAppointmentTask("75ebed56-f2d2-4b62-92b1-e6465fc715fb", "Gather contact and account information", 1,
        `Gather only what booking may require:

* [ ] Phone number, website, or scheduling portal
* [ ] Account, patient, member, or customer number
* [ ] Referral, order, or authorization if applicable
* [ ] Insurance or payment information if applicable
* [ ] Preferred provider or location

**Minimum version:** Find the phone number or booking page.

Missing information can become a follow-up task instead of blocking first contact.`
    ),
    scheduleAppointmentTask("1a830b4c-1072-4995-b7f7-50dc97cfa804", "Choose possible dates and constraints", 2,
        `* [ ] Check your calendar
* [ ] Identify two or three possible windows
* [ ] Note work, school, care, or transportation constraints
* [ ] Decide how far you can travel
* [ ] Write the earliest and latest acceptable dates

**Minimum version:** Identify one time window that could work.

You can ask what is available before comparing every option.`
    ),
    scheduleAppointmentTask("d0f81514-ce37-43ad-bbbd-c381767451f0", "Make the call or submit the request", 3,
        `Use a short script:

* [ ] Say or write what appointment you need
* [ ] Share required identifying information
* [ ] Ask for available dates
* [ ] Ask about cost, referrals, forms, or preparation when relevant
* [ ] Request accommodations or an interpreter if needed
* [ ] Ask for a waitlist when useful

**Minimum version:** Open the portal, send the first message, or dial the number.

Reading from a script is allowed.`
    ),
    scheduleAppointmentTask("d9f9e5f1-b650-4410-bfd7-91c24fc80642", "Record the appointment details", 4,
        `Before ending the call or closing the page:

* [ ] Record the date and time
* [ ] Record the location, link, or phone number
* [ ] Record the provider or contact name
* [ ] Save the confirmation number
* [ ] Note arrival time and preparation instructions

**Minimum version:** Write down the date, time, and location.

Take a screenshot of the confirmation if that is easier.`
    ),
    scheduleAppointmentTask("298197f8-e7c7-4817-b902-b4bed3403d3e", "Add the appointment to the calendar", 5,
        `* [ ] Create the calendar event
* [ ] Include the address, link, and phone number
* [ ] Add travel and arrival time
* [ ] Attach or link the confirmation
* [ ] Invite anyone else who needs to attend

**Minimum version:** Add the correct date and start time.

Details can be added later if the appointment is safely captured now.`
    ),
    scheduleAppointmentTask("b0d39de6-030e-4f23-83de-bd82b8417fcb", "Create preparation and reminder tasks", 6,
        `* [ ] Add a reminder to prepare forms or documents
* [ ] Add a leave-now or join-now reminder
* [ ] Arrange transportation, care, or time away from work
* [ ] Note any fasting, medication, clothing, or equipment instructions
* [ ] Create a separate appointment-preparation task

**Minimum version:** Set one reminder before the appointment.

Follow professional instructions rather than relying on a generic checklist.`
    ),
    scheduleAppointmentTask("327bb73e-fde9-4926-9010-a2c4c4f00335", "Set a follow-up if it is not booked", 7,
        `If booking is still incomplete:

* [ ] Record what happened
* [ ] Note what information or action is missing
* [ ] Record who is expected to respond
* [ ] Choose a reasonable follow-up date
* [ ] Save any voicemail, message, or request confirmation

**Minimum version:** Add a dated reminder to try again.

Waiting for a response is a real task state, not a failure to schedule.`
    ),
];

const PREPARE_APPOINTMENT_ID = "ef5903ca-49de-4acc-b967-f570fb5dc9b9";

function prepareAppointmentTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = PREPARE_APPOINTMENT_ID,
): ChecklistItem {
    return peopleTask(id, text, sortOrder, note, parentUuid, "one-time");
}

export const PREPARE_APPOINTMENT_TEMPLATE: ChecklistItem[] = [
    prepareAppointmentTask(PREPARE_APPOINTMENT_ID, "Prepare for an appointment", 0,
        `**Prepare enough to arrive and communicate what matters.**

You do not need a perfect history, binder, or list of questions. Bring the information most likely to affect the appointment.

You can **skip any task** to hide it from Today.`,
        null
    ),
    prepareAppointmentTask("c7003d77-d7c6-41b9-8453-ab40bc9b2f9f", "Confirm the appointment details", 0,
        `* [ ] Confirm the date and time
* [ ] Confirm the location, link, or phone number
* [ ] Check the requested arrival time
* [ ] Confirm the person or provider
* [ ] Check cancellation or rescheduling instructions

**Minimum version:** Confirm the correct date, time, and location.

Use the original confirmation rather than memory.`
    ),
    prepareAppointmentTask("907f0b54-4148-4e87-a559-0d4a3eca08aa", "Review instructions and complete forms", 1,
        `* [ ] Read preparation instructions
* [ ] Complete required forms
* [ ] Check identification, payment, referral, or insurance requirements
* [ ] Follow any professional instructions about food, medication, clothing, or equipment
* [ ] Save or print completed documents

**Minimum version:** Read the instructions and identify the first required item.

Contact the office when instructions are unclear or conflict with your needs.`
    ),
    prepareAppointmentTask("457f9473-1258-460b-b45d-dc27270f586d", "Gather documents and records", 2,
        `Bring only what applies:

* [ ] Identification
* [ ] Insurance, membership, referral, or payment information
* [ ] Relevant records, results, photos, receipts, or correspondence
* [ ] Medication or product list when relevant
* [ ] Confirmation number

**Minimum version:** Put identification and the appointment confirmation together.

Use a single folder, envelope, or digital note to contain everything.`
    ),
    prepareAppointmentTask("7d3734ca-7ad8-4c01-b254-4d548617926d", "Write the appointment goal", 3,
        `* [ ] Write why you made the appointment
* [ ] Identify the main decision, answer, or outcome needed
* [ ] Note what has already been tried
* [ ] Put the most important issue first

**Minimum version:** Complete: “I want help with ___.”

You can read this sentence aloud at the beginning of the appointment.`
    ),
    prepareAppointmentTask("f7764b76-5cc5-4725-b026-0e552b89ab45", "Prepare questions and relevant details", 4,
        `* [ ] Write up to three important questions
* [ ] Add dates, examples, symptoms, measurements, or prior conversations when relevant
* [ ] Note anything difficult to remember under pressure
* [ ] Mark the question that must be answered
* [ ] Leave space for notes

**Minimum version:** Write one question.

Handing over or reading from a written note is allowed.`
    ),
    prepareAppointmentTask("ec704933-db03-4454-8398-da776fc62894", "Arrange access, transportation, and support", 5,
        `Do only what applies:

* [ ] Plan the route, parking, ride, or transit
* [ ] Arrange childcare, elder care, or pet care
* [ ] Request accessibility support or an interpreter
* [ ] Ask a trusted person to attend when helpful
* [ ] Plan how to join and test technology for a remote appointment

**Minimum version:** Decide how you will get there or connect.

Requesting support is part of preparation, not an inconvenience.`
    ),
    prepareAppointmentTask("8046cbab-9fb7-49e1-b9dd-77413097cc82", "Pack appointment essentials", 6,
        `* [ ] Put documents into one folder or bag
* [ ] Add phone, wallet, keys, and needed devices
* [ ] Add water, food, medication, or sensory support when appropriate
* [ ] Put the bag by the door
* [ ] Keep refrigerated or last-minute items on a visible reminder

**Minimum version:** Put the confirmation and required documents by your keys.

You do not need to prepare for every possible scenario.`
    ),
    prepareAppointmentTask("7bb050f8-19df-4187-b078-82d93e916d8f", "Set arrival and transition reminders", 7,
        `* [ ] Calculate travel or setup time
* [ ] Add a buffer for parking, check-in, or technology
* [ ] Set a begin-getting-ready reminder
* [ ] Set a leave-now or join-now reminder
* [ ] Protect recovery or follow-up time when possible

**Minimum version:** Set one leave-now or join-now alarm.

Use realistic transition time rather than the fastest possible estimate.`
    ),
];

const PREPARE_EVENT_ID = "d01e89a4-a4d9-4690-b022-f70e82916b91";

function prepareEventTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = PREPARE_EVENT_ID,
): ChecklistItem {
    return peopleTask(id, text, sortOrder, note, parentUuid, "one-time");
}

export const RSVP_AND_PREPARE_EVENT_TEMPLATE: ChecklistItem[] = [
    prepareEventTask(PREPARE_EVENT_ID, "RSVP and prepare for an event", 0,
        `**The goal is a clear yes, no, or maybe—and enough preparation to attend comfortably.**

Your time, energy, access needs, and budget are valid parts of the decision. An invitation is not an obligation.

You can **skip any task** to hide it from Today.`,
        null
    ),
    prepareEventTask("a1bd22dd-41c5-4da1-bf41-70f17b74394d", "Review the invitation", 0,
        `* [ ] Find the date, time, and location
* [ ] Check the RSVP deadline
* [ ] Identify the host and event type
* [ ] Note whether guests are included
* [ ] Check dress, food, gift, or registration information

**Minimum version:** Find the event date and RSVP deadline.

Take a screenshot or keep the invitation linked to the task.`
    ),
    prepareEventTask("22f7db22-e276-4384-b1f3-51a19902a738", "Check capacity and practical constraints", 1,
        `* [ ] Check your calendar
* [ ] Consider travel and recovery time
* [ ] Check the expected cost
* [ ] Consider childcare, pet care, work, health, and sensory needs
* [ ] Decide whether you want and are able to attend

**Minimum version:** Check for a calendar conflict and make a provisional choice.

Declining because the event does not fit your capacity is a complete decision.`
    ),
    prepareEventTask("3c367ca9-de75-4cdd-82d9-bbf140fb6ee3", "Send the RSVP", 2,
        `* [ ] Use the requested RSVP method
* [ ] Give a clear yes, no, or requested response
* [ ] Include your guest when appropriate
* [ ] Share dietary or accessibility information when needed
* [ ] Save the confirmation

**Minimum version:** Send a clear one-sentence response.

You do not need a detailed excuse to decline.`
    ),
    prepareEventTask("1b2018d9-e62b-4155-9f5b-7d53d14e5b04", "Add the event to the calendar", 3,
        `* [ ] Add the date and start time
* [ ] Add the address or link
* [ ] Include travel and arrival time
* [ ] Link the invitation or confirmation
* [ ] Add the host's contact information

**Minimum version:** Add the correct date, time, and location.

Invite anyone attending with you if shared visibility helps.`
    ),
    prepareEventTask("70bd481d-19a1-46a4-9f38-e01736790c89", "Arrange transportation, care, and accommodations", 4,
        `Do only what applies:

* [ ] Plan driving, transit, a ride, parking, or lodging
* [ ] Arrange childcare, elder care, or pet care
* [ ] Request accessibility support
* [ ] Check food and sensory options
* [ ] Decide on an arrival and departure plan

**Minimum version:** Decide how you will arrive and leave.

Having an exit plan can be part of attending—not evidence that you are impolite.`
    ),
    prepareEventTask("177fbec9-f685-4f05-bbfb-2a0524356375", "Choose clothing", 5,
        `* [ ] Check the dress guidance and weather
* [ ] Choose something comfortable enough for the setting
* [ ] Try on uncertain items
* [ ] Include shoes and layers
* [ ] Put everything together in one place

**Minimum version:** Choose the first item or a familiar complete outfit.

Comfort and repeat outfits are allowed.`
    ),
    prepareEventTask("4a7f8dd2-b5e8-48fc-aee8-352df949363d", "Prepare a gift, card, or contribution", 6,
        `Do only what the event calls for:

* [ ] Decide whether a gift, card, food, or other contribution is expected
* [ ] Choose a realistic budget
* [ ] Buy, order, or prepare it
* [ ] Write the card or label
* [ ] Put it by the door or with event supplies

**Minimum version:** Decide that no contribution is needed, or choose one simple option.

Do not turn a thoughtful gesture into a perfection project.`
    ),
    prepareEventTask("7f4e1798-92a5-4402-8518-8ed1059760a9", "Pack event essentials", 7,
        `* [ ] Phone, wallet, and keys
* [ ] Ticket, identification, or confirmation
* [ ] Gift, card, or contribution
* [ ] Medication and personal-care items
* [ ] Water, food, charger, or sensory supports when appropriate
* [ ] Weather items

**Minimum version:** Gather phone, wallet, keys, and entry confirmation.

Put everything into one bag or one place by the door.`
    ),
    prepareEventTask("6c4d5827-93fc-4f0d-a865-4eaa66319eae", "Set getting-ready and leave-now reminders", 8,
        `* [ ] Calculate realistic travel time
* [ ] Include dressing, parking, and transition time
* [ ] Set a begin-getting-ready reminder
* [ ] Set a leave-now reminder
* [ ] Share timing with anyone attending with you

**Minimum version:** Set one leave-now alarm.

Use the time you actually need, not the best-case estimate.`
    ),
];

const RETURN_BORROWED_ITEM_ID = "fa548cab-a110-4762-9d0f-b672da5b87bf";

function returnBorrowedItemTask(
    id: string,
    text: string,
    sortOrder: number,
    note: string,
    parentUuid: string | null = RETURN_BORROWED_ITEM_ID,
): ChecklistItem {
    return peopleTask(id, text, sortOrder, note, parentUuid, "one-time");
}

export const RETURN_BORROWED_ITEM_TEMPLATE: ChecklistItem[] = [
    returnBorrowedItemTask(RETURN_BORROWED_ITEM_ID, "Return a borrowed item", 0,
        `**The goal is to get the item back to its owner—not to create a perfect return.**

If the item is damaged, missing, or overdue, communicate directly instead of waiting until you can fix everything alone.

You can **skip any task** to hide it from Today.`,
        null
    ),
    returnBorrowedItemTask("98a5b5a1-b68c-4098-9cba-224fc8362a69", "Identify the item and owner", 0,
        `* [ ] Name the borrowed item
* [ ] Identify who owns it
* [ ] Check whether there was a promised return date
* [ ] Find the owner's contact information

**Minimum version:** Write the item and owner's name.

This small step turns a vague guilty feeling into a concrete task.`
    ),
    returnBorrowedItemTask("36d813ca-fb3c-42ab-a6cf-2e52c677559f", "Locate all parts", 1,
        `* [ ] Check the place where the item is usually stored
* [ ] Look for cases, cords, accessories, or instructions
* [ ] Put all found parts together
* [ ] Note anything missing

**Minimum version:** Find the main item and put it somewhere visible.

Set a short search timer instead of dismantling the entire house.`
    ),
    returnBorrowedItemTask("47c77d59-4e08-4061-a245-5bd6c97f7924", "Inspect and prepare the item", 2,
        `* [ ] Check the item's condition
* [ ] Clean it appropriately if needed
* [ ] Charge, reset, fold, or package it when appropriate
* [ ] Include all accessories
* [ ] Be ready to disclose damage or missing parts

**Minimum version:** Remove obvious dirt and gather the parts you found.

Do not attempt a risky repair to avoid an uncomfortable conversation.`
    ),
    returnBorrowedItemTask("a891de05-7e4b-4c5c-9856-f2c4297053e9", "Contact the owner", 3,
        `Use a direct message:

* [ ] Say you are ready to return the item
* [ ] Acknowledge a delay briefly if needed
* [ ] Mention damage or missing parts honestly
* [ ] Offer two realistic return options
* [ ] Ask for their preferred handoff

**Minimum version:** Send: “I have your ___ and would like to return it. What works for you?”

A concise message is enough; a long apology is not required.`
    ),
    returnBorrowedItemTask("2728924d-a494-44df-aa86-62dcf3590052", "Choose the handoff plan", 4,
        `* [ ] Choose pickup, drop-off, mail, or another agreed method
* [ ] Confirm the date, time, and location
* [ ] Add postage or packaging when mailing
* [ ] Add the plan to the calendar
* [ ] Set a leave-now or shipping reminder

**Minimum version:** Agree on one return method.

Choose the simplest plan that works for both people.`
    ),
    returnBorrowedItemTask("a5c32cba-3e11-4b20-90b4-c3f12538dc99", "Put the item by the exit", 5,
        `* [ ] Place the item and all parts into one bag or container
* [ ] Add the owner's name
* [ ] Put it beside your keys, in the car, or at the agreed pickup location
* [ ] Add a visible reminder if needed

**Minimum version:** Move the item next to the door.

Make the environment remember for you.`
    ),
    returnBorrowedItemTask("cb42d27e-dbf9-41f3-a2bb-b9332ac0e08e", "Return the item and confirm", 6,
        `* [ ] Complete the agreed handoff or shipment
* [ ] Save tracking information if mailed
* [ ] Tell the owner when and where it was returned
* [ ] Confirm receipt when appropriate
* [ ] Remove related reminders

**Minimum version:** Complete the handoff and send one confirmation message.

Once the item has been returned, the task is complete.`
    ),
];
