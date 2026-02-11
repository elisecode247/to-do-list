export const ALL_CATEGORIES = "all";
export const categoryArray = [
    "work",
    "housework",
    "self-care",
    "people",
    "pets",
    "leisure"
];

export const categories = {
    "work": "Work",
    "housework": "Housework",
    "self-care": "Self-Care",
    "people": "People",
    "pets": "Pets",
    "leisure": "Leisure",
    "": "No Category"
};

type CategoryType = typeof categoryArray[number] | '' | typeof ALL_CATEGORIES;

export const isCategoryIncluded = (selectedCategory: CategoryType, taskCategory: CategoryType, parentUuid: string | null) => {
    if (parentUuid) return true; // skip subtasks for category filter
    if (selectedCategory === ALL_CATEGORIES) return true;
    if (selectedCategory.includes("") && taskCategory === "") return true;
    if (selectedCategory === taskCategory) return true;
    if (selectedCategory === "" && !categoryArray.includes(taskCategory)) return true;
    return false;
}
