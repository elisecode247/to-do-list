# Task Filtering

Tasks can be filtered based on **tabs**, **tags**, **completion status**, **category**, and **hidden**, allowing you to focus on exactly what matters.

## Tab Filters

- **Active**: Tasks that are **not archived**, have the `scheduled` tag, and are **due today or earlier**.
- **Scheduled**: All tasks tagged `scheduled`.
- **Hidden**: Tasks marked as hidden.
- **Archived**: Tasks that are archived.
- **Priority**: Tasks tagged `priority`.

## Tag Filters

- **Exclusive tags** (e.g., frequency tags like `daily`, `one-time`, `occasional`) use **OR logic** — tasks only need **one** of the selected exclusive tags.
- **Non-exclusive tags** use **AND logic** — tasks must include **all** selected non-exclusive tags.

## Completion Filter

- If **hide completed** is enabled, tasks marked as done are excluded.

## Category Filter

- Only tasks belonging to the selected category are included.

## Subtask Exclusion

- Subtasks (`task.parentUuid`) are automatically excluded from the filtered results to focus on main tasks.

## Hidden Today Exclusion
- Tasks hidden today will be excluded from all tabs besides the Hidden Today tab.

