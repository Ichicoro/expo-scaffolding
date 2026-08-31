// tailwind spacing scale
export const spacing = (multiplier: number) => multiplier * 4;

// tailwind font-size utils
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
export const fontSize = (size: FontSize) => {
  switch (size) {
    case 'xs':
      return 12;
    case 'sm':
      return 14;
    case 'base':
      return 16;
    case 'lg':
      return 18;
    case 'xl':
      return 20;
    case '2xl':
      return 24;
    case '3xl':
      return 30;
    case '4xl':
      return 36;
    case '5xl':
      return 48;
    case '6xl':
      return 60;
    case '7xl':
      return 72;
    case '8xl':
      return 96;
    case '9xl':
      return 128;
    default:
      throw new Error(`Unknown font size: ${size}`);
  }
}

export const uppercaseFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}