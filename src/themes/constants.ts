export const SYSTEM_MODE = 'system';
export const LIGHT_MODE = 'light';
export const DARK_MODE = 'dark';
export const MODES = [SYSTEM_MODE, LIGHT_MODE, DARK_MODE] as const;

export const CALM_STYLE = 'calm';
export const SPACE_STYLE = 'space';
export const NATURE_STYLE = 'nature';
export const OCEAN_STYLE = 'ocean';
export const WINTER_STYLE = 'winter';
export const CUSTOM_STYLE = 'custom';
export const STYLES = [CALM_STYLE, SPACE_STYLE, NATURE_STYLE, OCEAN_STYLE, WINTER_STYLE, CUSTOM_STYLE] as const;

export const COMFORTABLE_DENSITY = 'comfortable';
export const COMPACT_DENSITY = 'compact';
export const DENSITIES = [COMFORTABLE_DENSITY, COMPACT_DENSITY] as const;

export const GRAPHICS_TRUE = 'true';
export const GRAPHICS_FALSE = 'false';
export const GRAPHICS = [GRAPHICS_TRUE, GRAPHICS_FALSE] as const;
