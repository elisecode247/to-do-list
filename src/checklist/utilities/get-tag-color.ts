const colors = {
  daily: " tag-frequency--daily ",
  "one-time": " tag-frequency--one-time ",
  occasional: " tag-frequency--occasional ",
};

type ColorKey = keyof typeof colors;

export const getTagColor = (tag: string) => {
  if (tag in colors) {
    return colors[tag as ColorKey];
  }
  return " tag-button-inactive ";
};
