const colors = {
  daily: " mode-frequency--daily ",
  "one-time": " mode-frequency--one-time ",
  occasional: " mode-frequency--occasional ",
  priority: " mode-priority"
};

type ColorKey = keyof typeof colors;

export const getModeColor = (mode: string) => {
  if (mode in colors) {
    return colors[mode as ColorKey];
  }
  return " mode-button-inactive ";
};
