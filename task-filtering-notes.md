[<- Go Back](./README.md)


# Task Filtering

Tasks can be filtered based on **tabs**, **tags**, **completion status**, **category**, and **hidden**, allowing you to focus on exactly what matters.

Tasks exist in one mode (set by exclusive tags), one place (set by tabs), and one time (set by completion).

## Filter precedence

Filters first remove archived and hidden tasks, then apply the selected tab, and finally narrow results using category, tags, and completion state.
1. Archived / Hidden rules
   - Tasks hidden today are excluded from all tabs except Hidden Today
2. Tab selection
3. Category, Tags, and Completion state

## Priority Highlighting
Tasks tagged priority are visually highlighted in all tabs.

## Tab Filters

- **Today**: Today's tasks that need attention. Tasks that are **not archived**, **not hidden**, and **due today or earlier**, or unscheduled tasks.
- **Scheduled**: All tasks and events tagged `scheduled` that **are due after today**.
- **Hidden Today**: Tasks marked as hidden today, subtasks included.
- **Archived**: Tasks that are archived.
- **Priority**: Tasks and subtasks tagged `priority`.

## Tag Filters
Choose one per group. These tags set how a task behaves. Examples:
    - Frequency: daily, occasional, one-time
    - Scheduling mode: scheduled by date and/or time
Rules:
    - A task can have at most one exclusive tag from the same group.
    - When filtering, selecting multiple exclusive tags uses OR logic (match any).
    - Exclusive tags combine with other filters using AND logic

## Completion Filter
Completion indicates a task is done for the current day.
- If **Hide Completed** is enabled, tasks completed today are excluded from the Today tab.
- Recurring tasks may reappear as incomplete on subsequent days (e.g. tasks tagged daily or occasional).
- Tasks completed on previous days remain visible and show a badge indicating when they were last completed.

## Category Filter

- Only tasks belonging to the selected category are included.

## Subtask Exclusion

- Subtasks (`task.parentUuid`) are excluded from filters to reduce clutter and keep focus on primary tasks. Subtasks all display when the main task is expanded. Subtasks can be hidden, prioritized, archived, categorized, marked complete, and tags added.

