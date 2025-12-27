const colors = {
  daily: " tag-daily ",
  "one-time": " tag-one-time ",
  occasional: " tag-occasional ",
};

type ColorKey = keyof typeof colors;

export const getTagColor = (tag: string) => {
  if (tag in colors) {
    return colors[tag as ColorKey];
  }
  return " tag-button-inactive ";
};
