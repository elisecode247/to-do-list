import {
    FrequencyType,
    INTERVAL_RECURRENCE,
    type ChecklistItem,
} from "src/app/types";

const DOG_CARE_ID = "0f85d97c-87a5-48c9-afd7-8422e180b4b7";

function dogCareTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = DOG_CARE_ID,
): ChecklistItem {
    const isDaily = numberOfRepetitions === 1 && frequency === FrequencyType.Daily;

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
        category: "pets",
        mode: isDaily ? "daily" : "occasional",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: isDaily ? null : {
            type: INTERVAL_RECURRENCE,
            numberOfRepetitions,
            frequency,
            startDate: "",
        },
        nextDue: null,
    };
}

export const DOG_CARE_TEMPLATE: ChecklistItem[] = [
    dogCareTask(DOG_CARE_ID, "Dog care", 0, 1, FrequencyType.Daily,
        `**Good enough counts.** Meet your dogs' immediate needs first. Grooming and exercise can be shortened, adapted, combined, or rescheduled when needed.

Each dog may need a different routine based on age, breed, coat, health, weather, and veterinary guidance.

You can **skip any task** to hide it from Today.`,
        null
    ),
    dogCareTask("71cc2885-aeee-41f3-a35e-78cdfc0c5940", "Clean food and water bowls", 0, 1, FrequencyType.Daily,
        `* [ ] Pick up the bowls
* [ ] Discard old food and water
* [ ] Wash with hot water and dish soap, or use the dishwasher if safe
* [ ] Rinse away all soap
* [ ] Dry or place the bowls back
* [ ] Refill fresh water

**Minimum version:** Wash and refill the water bowl.

Use a separate sponge or brush if that makes your household routine safer and easier.`
    ),
    dogCareTask("8ef763ed-6b42-4532-a76f-e7856da1d36e", "Clean the feeding area", 1, 1, FrequencyType.Daily,
        `* [ ] Pick up dropped food
* [ ] Wipe spills and sticky spots
* [ ] Shake out or wipe the feeding mat
* [ ] Check for ants or other pests
* [ ] Put supplies back in their usual place

**Minimum version:** Wipe the wet or sticky area around the bowls.`
    ),
    dogCareTask("9577d750-ce53-4503-abee-ae61e1157b5f", "Feed the dogs", 2, 1, FrequencyType.Daily,
        `Use the same order every time:

* [ ] Check which dogs have already been fed
* [ ] Measure each dog's planned portion
* [ ] Add prescribed food or medication only as directed
* [ ] Put down the bowls
* [ ] Make sure every dog can eat safely
* [ ] Mark the meal complete so it is not repeated accidentally

**Minimum version:** Give each dog the correct planned meal and mark it done.

Follow the feeding plan recommended for each dog's age, health, and activity level.`
    ),
    dogCareTask("67bd7d46-9246-4830-91ec-6d7d9bff4a19", "Refill poop bags", 3, 1, FrequencyType.Daily,
        `* [ ] Check the leash dispenser
* [ ] Add a new roll if it is low
* [ ] Put backup bags in the walking bag or by the door
* [ ] Return the bags and leash to their home

**Minimum version:** Put two bags beside the leash.`
    ),
    dogCareTask("561f0672-c660-46e5-a56b-84f8241647fc", "Go for a sniff walk", 4, 1, FrequencyType.Daily,
        `Let this be a slower, dog-led walk:

* [ ] Check the weather and ground conditions
* [ ] Put on the collar or harness and leash
* [ ] Bring poop bags, keys, and any needed water
* [ ] Choose a comfortable, familiar route
* [ ] Let the dog pause and sniff safely
* [ ] Return before either of you is overtired

**Minimum version:** Go outside for a bathroom break and allow a few minutes of sniffing.

Adjust distance and pace for the dog's age, health, and comfort.`
    ),
    dogCareTask("0233d498-f2a2-43f3-b4ab-31ea6cb17d17", "Go for an exercise walk", 5, 1, FrequencyType.Daily,
        `Choose movement appropriate for the individual dog:

* [ ] Check the weather, temperature, and pavement
* [ ] Put on the collar or harness and leash
* [ ] Bring poop bags, keys, and water when needed
* [ ] Walk at a comfortable, purposeful pace
* [ ] Watch for limping, slowing, heavy panting, or distress
* [ ] Cool down before returning home

**Minimum version:** Take one short loop or combine movement with the sniff walk.

Puppies, seniors, flat-faced breeds, and dogs with health conditions may need different limits. Follow veterinary guidance and skip unsafe heat, cold, smoke, or ground conditions.`
    ),
    dogCareTask("fa65bf4b-1056-4da4-a452-c88f696a2c56", "Clean paws after walks", 6, 1, FrequencyType.Daily,
        `* [ ] Check each paw for debris, cuts, tenderness, or irritation
* [ ] Wipe away dirt and mud
* [ ] Rinse off salt, chemicals, or allergens when needed
* [ ] Dry between the toes
* [ ] Check that paw pads are comfortable

**Minimum version:** Wipe the dirtiest paws and check for anything sharp.

Contact a veterinarian for persistent limping, bleeding, swelling, burns, or significant pain.`
    ),
    dogCareTask("e96224d2-a1ea-4b91-8016-9602069946aa", "Check ears; clean only when needed", 7, 1, FrequencyType.Daily,
        `* [ ] Look at the outer ear and opening
* [ ] Notice redness, swelling, debris, discharge, odor, or sensitivity
* [ ] Clean only when needed and according to the dog's veterinary care plan
* [ ] Use a dog-specific, veterinarian-approved ear cleaner
* [ ] Stop if the dog shows pain

**Minimum version:** Look at and smell each ear without cleaning it.

Over-cleaning can cause irritation. Never put cotton swabs into the ear canal. Contact a veterinarian for pain, strong odor, redness, swelling, discharge, or repeated head shaking.`
    ),
    dogCareTask("08f7e5a3-2b48-46bd-bba5-cd4c67dd9de4", "Brush fur", 8, 1, FrequencyType.Daily,
        `Choose one area or a short session:

* [ ] Get the coat-appropriate brush
* [ ] Let the dog see and sniff the tool
* [ ] Brush gently in the direction of hair growth
* [ ] Focus on areas that mat or shed
* [ ] Check the skin for irritation, lumps, fleas, or ticks
* [ ] Stop before the dog becomes overwhelmed

**Minimum version:** Brush one comfortable area for one minute.

Do not pull or cut tight mats close to the skin. Ask a groomer or veterinarian for help.`
    ),
    dogCareTask("b0ceaa89-d7f1-42d6-be64-b0ac6294e2fb", "Brush teeth", 9, 1, FrequencyType.Daily,
        `Keep the experience short and positive:

* [ ] Use a dog toothbrush or soft pet dental tool
* [ ] Use dog-specific toothpaste
* [ ] Lift the lip gently
* [ ] Brush the outer tooth surfaces and gum-line
* [ ] Praise or reward the dog
* [ ] Rinse and put away the toothbrush

**Minimum version:** Brush a few teeth or practice calmly touching the muzzle.

Never use human toothpaste. Contact a veterinarian for bleeding, swelling, broken teeth, pain, difficulty eating, or persistent bad breath.`
    ),
    dogCareTask("72820cc7-20cb-4028-86ee-20aeb5648486", "Check and trim nails", 10, 2, FrequencyType.Weekly,
        `Check first; trim only what is needed:

* [ ] Gather clippers or a grinder and treats
* [ ] Check nail length, including dewclaws
* [ ] Trim one small amount at a time
* [ ] Pause between paws
* [ ] Stop before the dog becomes distressed
* [ ] Reward the dog and put supplies away

**Minimum version:** Inspect every paw or trim one nail.

The quick can bleed and may be difficult to see in dark nails. Ask a groomer or veterinarian to demonstrate, or schedule professional trimming when needed.`
    ),
    dogCareTask("d9d28b1a-3a71-4ef8-8566-10fcf4d92b4e", "Give the dog a bath", 11, 1, FrequencyType.Monthly,
        `Bathe only as often as appropriate for the dog's coat, skin, and veterinary plan:

* [ ] Gather dog shampoo, towels, and a nonslip mat
* [ ] Brush out loose fur and manageable tangles
* [ ] Use comfortably warm water
* [ ] Keep water and shampoo out of eyes and ears
* [ ] Wash and rinse thoroughly
* [ ] Towel-dry and keep the dog comfortable until dry

**Minimum version:** Wipe dirty areas or rinse muddy paws.

Use dog-specific products. Bathe more or less often if recommended for the dog's skin or coat.`
    ),
    dogCareTask("333860bc-08a1-4f89-a6cc-688e1046b777", "Schedule a haircut or grooming appointment", 12, 10, FrequencyType.Weekly,
        `Do only what applies to the dog's coat:

* [ ] Check coat length, mats, nails, ears, and grooming needs
* [ ] Contact the groomer
* [ ] Book a date and time
* [ ] Add the appointment to the calendar
* [ ] Note any skin, coat, behavior, or handling concerns
* [ ] Set a reminder for transportation and records

**Minimum version:** Send the booking message or add “call groomer” to tomorrow's list.

Some coat types need a different schedule or no haircut at all. Follow breed-appropriate professional guidance.`
    ),
    dogCareTask("908973f1-c624-42b5-92b4-43992b82488d", "Launder toys, beds, and blankets", 13, 1, FrequencyType.Monthly,
        `Choose **one washable load**:

* [ ] Check care labels and toy condition
* [ ] Discard toys with unsafe damage
* [ ] Remove bed covers if applicable
* [ ] Start the washer using pet-safe products
* [ ] Set a reminder to move the load
* [ ] Dry everything completely
* [ ] Return clean items to the dogs

**Minimum version:** Wash one blanket or bed cover.

Keep a familiar dry bed or blanket available while the load is running.`
    ),
    dogCareTask("f8da5536-8761-4583-b5e3-79fa3582770f", "Schedule a wellness exam", 14, 1, FrequencyType.Annually,
        `* [ ] Check when each dog was last examined
* [ ] Contact the veterinary clinic
* [ ] Book the appointment
* [ ] Add it to the calendar
* [ ] Gather vaccination, medication, and health records
* [ ] Write down behavior, diet, dental, mobility, or health questions
* [ ] Set reminders for transportation and any requested samples

**Minimum version:** Check the last exam date and contact the clinic.

Some dogs—including puppies, seniors, and dogs with health conditions—may need more frequent visits. Follow the veterinarian's recommended schedule.`
    ),
];

const CAT_CARE_ID = "86c3e805-36e9-41dc-a957-d6edcc23128c";

function catCareTask(
    id: string,
    text: string,
    sortOrder: number,
    numberOfRepetitions: number,
    frequency: FrequencyType,
    note: string,
    parentUuid: string | null = CAT_CARE_ID,
): ChecklistItem {
    const isDaily = numberOfRepetitions === 1 && frequency === FrequencyType.Daily;

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
        category: "pets",
        mode: isDaily ? "daily" : "occasional",
        isPriority: false,
        isArchived: false,
        hasSubChores: parentUuid === null,
        parentUuid,
        recurrence: isDaily ? null : {
            type: INTERVAL_RECURRENCE,
            numberOfRepetitions,
            frequency,
            startDate: "",
        },
        nextDue: null,
    };
}

export const CAT_CARE_TEMPLATE: ChecklistItem[] = [
    catCareTask(CAT_CARE_ID, "Cat care", 0, 1, FrequencyType.Daily,
        `**Good enough counts.** Meet your cat's food, water, litter, and health needs first. Play and grooming can be short, adapted, or rescheduled when needed.

Your cat may need a different routine based on age, health, preferences, and veterinary guidance.

You can **skip any task** to hide it from Today.`,
        null
    ),
    catCareTask("0c78638b-b941-425d-82b9-e6ba408f12ec", "Clean the food bowl", 0, 1, FrequencyType.Daily,
        `* [ ] Pick up the bowl
* [ ] Discard old food
* [ ] Wash with hot water and dish soap, or use the dishwasher if safe
* [ ] Rinse away all soap
* [ ] Dry or place the bowl back

**Minimum version:** Wash the bowl needed for the next meal.

Use a separate sponge or brush if that makes your household routine safer and easier.`
    ),
    catCareTask("c274da0a-aeb1-44aa-91d2-e2739b648f3e", "Provide fresh water", 1, 1, FrequencyType.Daily,
        `* [ ] Check the bowl or fountain level
* [ ] Discard stale or visibly dirty water
* [ ] Rinse away loose debris
* [ ] Refill with fresh water
* [ ] Check that the fountain is running, if using one

**Minimum version:** Top up one clean water source.

Notice significant changes in drinking and share them with the veterinarian.`
    ),
    catCareTask("01509237-c0c0-486a-95a5-67a8b57c493e", "Serve the morning wet-food meal and supplements", 2, 1, FrequencyType.Daily,
        `* [ ] Check whether the morning meal was already served
* [ ] Serve one can, or the amount in the veterinary feeding plan
* [ ] Confirm each approved supplement and dose
* [ ] Add supplements only as directed
* [ ] Put down the bowl
* [ ] Mark the meal and supplements given

**Minimum version:** Serve the planned meal and mark it complete.

Use only supplements approved for your cat. If you are unsure whether a supplement was already given, do not repeat it without veterinary guidance.`
    ),
    catCareTask("00d6ff25-e636-42f0-8ff4-ad9b66bad8cd", "Scoop the litter box", 3, 1, FrequencyType.Daily,
        `* [ ] Gather the scoop and waste bag
* [ ] Remove stool and urine clumps
* [ ] Notice unusual stool, urine amount, blood, or repeated box visits
* [ ] Add litter if the level is low
* [ ] Tie the waste bag and put it in the appropriate bin
* [ ] Wash your hands

**Minimum version:** Remove the stool and largest urine clumps from one box.

If you are pregnant or immunocompromised, have someone else scoop when possible. Otherwise, use disposable gloves and wash your hands afterward. Contact a veterinarian about significant elimination changes or straining.`
    ),
    catCareTask("985c8c22-2a1c-40b0-b60b-ebfb423ff774", "Vacuum the litter area", 4, 1, FrequencyType.Daily,
        `* [ ] Make sure the cat can move away from the noise
* [ ] Pick up the litter scoop and loose items
* [ ] Vacuum scattered litter around the box
* [ ] Vacuum the main walking path
* [ ] Empty the vacuum bin if needed

**Minimum version:** Vacuum or sweep the litter directly around the box.

Keep the litter-box entrance accessible and avoid trapping the cat near a loud appliance.`
    ),
    catCareTask("6201a40c-d6dc-458e-b1a0-54de9507e227", "Sit on the floor and play together", 5, 1, FrequencyType.Daily,
        `Let your cat choose whether and how to engage:

* [ ] Sit on the floor nearby
* [ ] Offer a wand, ball, mouse, or favorite toy
* [ ] Move the toy like prey
* [ ] Let the cat stalk, chase, and catch it
* [ ] Slow down and end before either of you becomes frustrated

**Minimum version:** Sit nearby and offer play for one or two minutes.

Quiet company counts when your cat does not want active play.`
    ),
    catCareTask("0d39d147-b5ff-40cf-8528-d8777c61766f", "Offer play or cuddles when requested", 6, 1, FrequencyType.Daily,
        `Follow your cat's cues:

* [ ] Notice approaching, rubbing, vocalizing, or bringing a toy
* [ ] Offer play, petting, brushing, or quiet company
* [ ] Let the cat choose the distance and type of contact
* [ ] Pause when you notice tail flicking, skin twitching, flattened ears, or moving away

**Minimum version:** Offer your hand or sit nearby and let the cat decide.

Consent can change during the interaction. Stopping when asked builds trust.`
    ),
    catCareTask("2916b792-d928-492e-a0f8-a7bcc43d9805", "Brush the coat", 7, 1, FrequencyType.Daily,
        `Choose one area or a short session:

* [ ] Get the coat-appropriate brush
* [ ] Let the cat see and sniff it
* [ ] Brush gently in the direction of hair growth
* [ ] Focus on comfortable areas first
* [ ] Check for mats, skin irritation, lumps, fleas, or ticks
* [ ] Stop before the cat becomes overwhelmed

**Minimum version:** Brush one comfortable area for one minute.

Do not pull or cut tight mats close to the skin. Ask a groomer or veterinarian for help.`
    ),
    catCareTask("73484a7d-5c1b-4070-b66c-38e675401aa8", "Brush teeth", 8, 1, FrequencyType.Daily,
        `Keep the experience short and positive:

* [ ] Use a cat toothbrush or soft pet dental tool
* [ ] Use cat-specific toothpaste
* [ ] Let the cat taste the toothpaste
* [ ] Lift the lip gently
* [ ] Brush the outer tooth surfaces and gum-line
* [ ] Stop before the cat becomes distressed

**Minimum version:** Brush a few teeth or practice calmly touching the muzzle.

Never use human toothpaste. Contact a veterinarian for bleeding, swelling, pain, difficulty eating, drooling, or persistent bad breath.`
    ),
    catCareTask("824f1679-ef22-4f8d-a946-54744c1a801d", "Serve the evening wet-food meal and supplements", 9, 1, FrequencyType.Daily,
        `* [ ] Check whether the evening meal was already served
* [ ] Serve one can, or the amount in the veterinary feeding plan
* [ ] Confirm each approved supplement and dose
* [ ] Add supplements only as directed
* [ ] Put down the bowl
* [ ] Mark the meal and supplements given

**Minimum version:** Serve the planned meal and mark it complete.

Use only supplements approved for your cat. If you are unsure whether a supplement was already given, do not repeat it without veterinary guidance.`
    ),
    catCareTask("86b95f5f-ea11-498e-8668-8af0639bfaae", "Play with the laser pointer before bed", 10, 1, FrequencyType.Daily,
        `Keep the session short and give it a clear ending:

* [ ] Dim distractions without making the room unsafe
* [ ] Point the laser away from eyes, mirrors, and reflective surfaces
* [ ] Move it like prey along safe floor and wall areas
* [ ] Avoid unsafe jumps or slippery landings
* [ ] Slow the movement near the end
* [ ] Finish on a physical toy the cat can catch or a small approved reward
* [ ] Put the laser away

**Minimum version:** Play for one or two minutes and finish with a catchable toy.

Stop when your cat loses interest, becomes frustrated, or shows discomfort.`
    ),
    catCareTask("65a0d226-10e9-48f7-ae11-d6091ebec07f", "Clean the water fountain", 11, 1, FrequencyType.Weekly,
        `Follow the fountain manufacturer's instructions:

* [ ] Unplug the fountain
* [ ] Pour out the old water
* [ ] Disassemble the washable parts
* [ ] Wash the bowl, lid, and pump-safe parts
* [ ] Check the pump and intake for hair or buildup
* [ ] Rinse thoroughly
* [ ] Reassemble, refill, and confirm water is flowing

**Minimum version:** Empty, rinse, refill, and confirm the fountain is running.

Keep another fresh water source available while the fountain is being cleaned.`
    ),
    catCareTask("41907520-c81d-4757-a3f4-9c5bdc26078a", "Change the food mat", 12, 1, FrequencyType.Weekly,
        `* [ ] Pick up the bowls
* [ ] Remove the used mat
* [ ] Shake debris into the trash
* [ ] Put the mat in the wash or clean it as directed
* [ ] Wipe the floor underneath
* [ ] Put down a clean, dry mat
* [ ] Return the bowls

**Minimum version:** Wipe the dirtiest area of the mat and the floor beneath it.`
    ),
    catCareTask("288ef154-ac9b-45ce-90b9-83fb5dad38d3", "Check and trim nails", 13, 2, FrequencyType.Weekly,
        `Check first; trim only what is needed:

* [ ] Gather cat nail clippers and treats
* [ ] Choose a calm moment
* [ ] Check each paw and claw
* [ ] Trim only the sharp tip, avoiding the quick
* [ ] Pause between paws
* [ ] Stop before the cat becomes distressed

**Minimum version:** Inspect every paw or trim one nail.

Ask a veterinarian or groomer to demonstrate if you are unsure. Scratching surfaces are still important even when nails are trimmed.`
    ),
    catCareTask("271a6259-8089-4439-a49a-c05bb3d9a584", "Replace the water fountain filter", 14, 1, FrequencyType.Monthly,
        `* [ ] Check the fountain model and filter instructions
* [ ] Unplug the fountain
* [ ] Remove the used filter
* [ ] Prepare the new filter as directed
* [ ] Install it in the correct orientation
* [ ] Refill and reassemble the fountain
* [ ] Confirm that water is flowing
* [ ] Add replacement filters to the shopping list if needed

**Minimum version:** Check the filter and confirm that a replacement is available.

Follow the manufacturer's replacement schedule if it differs from this reminder.`
    ),
    catCareTask("c1c3ad22-b725-4df6-aa06-76a34f45b01e", "Check and replace the air purifier filter", 15, 1, FrequencyType.Monthly,
        `* [ ] Check the filter light or condition
* [ ] Confirm the correct replacement filter
* [ ] Turn off and unplug the purifier
* [ ] Remove the used filter without shaking dust into the room
* [ ] Clean only the parts allowed by the manual
* [ ] Install the new filter
* [ ] Reset the filter indicator if needed
* [ ] Add replacements to the shopping list

**Minimum version:** Check the indicator and filter condition.

Replace or clean the filter according to the manufacturer's schedule; some filters last longer than one month and some are not washable.`
    ),
    catCareTask("0535c88d-7615-4c45-ad7e-1c30ef8b5d30", "Deep-clean the litter box", 16, 1, FrequencyType.Monthly,
        `Keep another litter box available if possible:

* [ ] Put on gloves
* [ ] Empty the used litter into a waste bag
* [ ] Wash the box with mild, unscented soap and water
* [ ] Rinse thoroughly
* [ ] Dry the box completely
* [ ] Add fresh litter
* [ ] Return the box to its usual accessible location
* [ ] Wash your hands

**Minimum version:** Empty, wipe, dry, and refill one box.

Avoid strongly scented or harsh products unless approved for the box and cat. Never mix cleaning products. If pregnant or immunocompromised, have someone else handle litter when possible.`
    ),
    catCareTask("084cd8a1-8e02-475e-966c-6a6fd43f1fea", "Clean and inspect toys", 17, 1, FrequencyType.Monthly,
        `Choose **one toy group**:

* [ ] Check for loose strings, sharp pieces, stuffing, or other damage
* [ ] Discard toys that cannot be made safe
* [ ] Check care labels
* [ ] Wash hard toys or washable fabric toys as directed
* [ ] Dry everything completely
* [ ] Rotate a few toys back into use

**Minimum version:** Inspect five toys and clean the favorite one.

Store string, ribbon, and wand toys safely when they are not being supervised.`
    ),
    catCareTask("f9968423-9ee4-4f18-b9cd-5143c9dcf831", "Schedule a veterinary wellness visit", 18, 1, FrequencyType.Annually,
        `* [ ] Check when the last exam and vaccinations occurred
* [ ] Contact the veterinary clinic
* [ ] Book the appointment
* [ ] Add it to the calendar
* [ ] Review food, water, litter, supplements, medications, and behavior
* [ ] Write down dental, coat, mobility, or health questions
* [ ] Prepare the carrier using the cat's low-stress plan

**Minimum version:** Check the last visit date and contact the clinic.

Vaccines and testing follow the veterinarian's risk-based schedule. Senior cats and cats with health conditions may need visits more often than annually.`
    ),
];
