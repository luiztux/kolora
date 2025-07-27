declare module 'color-blind' {
  interface ColorBlindnessSimulator {
    protanopia: (rgb: string) => string;
    deuteranopia: (rgb: string) => string;
    tritanopia: (rgb: string) => string;
    achromatopsia: (rgb: string) => string;
    achromatomaly: (rgb: string) => string;
    deuteranomaly: (rgb: string) => string;
    protanomaly: (rgb: string) => string;
    tritanomaly: (rgb: string) => string;
  }

  const colorBlind: ColorBlindnessSimulator;
  export default colorBlind;
}
