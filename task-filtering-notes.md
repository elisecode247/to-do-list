[<- Go Back](./README.md)

# Task Filtering

Tasks can be filtered based on **Tabs**, **Modes**, **Completion Status**, **Category**, and **Hidden Today**, allowing you to focus on exactly what matters.

## Filter Precedence

Filters are applied in the following order: Archived and Hidden Today tasks are removed first, then the selected Tab is applied, and finally results are narrowed by Category, Mode, and Completion State.

1. Exclude archived and hidden tasks (except Hidden Today Tab and Archived Tab)
2. Apply Tab selection
3. Apply Category, Mode, and Completion filters

## Tab Filters

- **Today**: Tasks due today or earlier, including unscheduled tasks, that are not archived or hidden.
- **Scheduled**: All tasks and events marked `scheduled` that are due after today.
- **Hidden Today**: Tasks marked as hidden today, subtasks included.
- **Archived**: Tasks and subtasks that are archived.
- **Priority**: Tasks and subtasks marked `priority`.

## Mode Filters

Each task has one mode, determining how it behaves:

- **One-Time**: Unscheduled task that occurs once. Users can delete it once completed or archive it to defer it or keep a record.
- **Daily**: Unscheduled recurring daily task.
- **Occasional**: Unscheduled recurring task.
- **Scheduled**: Scheduled task that occurs once or recurs.

Rules:

- When filtering, selecting multiple modes uses OR logic (match any).
- Modes combine with other filters using AND logic.
- Example: Selecting "Daily" mode and Category "Work" returns all daily tasks in the Work Category.

## Completion Filter

Completion indicates a task is done for the current day:

- If **Hide Completed** is enabled, tasks completed today are excluded from all Tabs except "Hidden Today".
- Recurring tasks may reappear as incomplete on subsequent days (e.g., tasks marked daily or occasional).
- Tasks completed on previous days remain visible and show a badge indicating when they were last completed.

## Category Filter

Only tasks belonging to the selected Category are included.

## Subtask Exclusion

- Subtasks (`task.parentUuid`) are excluded from Mode and Category filters.
- Subtasks always display when the parent task is expanded, but can be hidden and removed with the **"Hide Completed" Filter**.
- Subtasks can have their own Mode, be hidden today, prioritized, archived, categorized, and marked complete.
- Subtasks cannot have the **Scheduled** mode, as scheduling applies only to parent tasks.
