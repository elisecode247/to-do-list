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
    "housework": "Home",
    "self-care": "Self-Care",
    "people": "People",
    "pets": "Pets",
    "leisure": "Leisure",
    "": "No Category"
};

type CategoryType = typeof categoryArray[number] | '' | typeof ALL_CATEGORIES;

export const isCategoryIncluded = (selectedCategory: CategoryType, taskCategory: CategoryType) => {
    if (selectedCategory === ALL_CATEGORIES) return true;
    if (selectedCategory.includes("") && taskCategory === "") return true;
    if (selectedCategory === taskCategory) return true;
    if (selectedCategory === "" && !categoryArray.includes(taskCategory)) return true;
    return false;
}
