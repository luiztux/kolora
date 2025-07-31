export interface ColorScale {
  [key: number]: string;
}

export interface Palette {
  id: string;
  name:string;
  primary: ColorScale;
  gray: ColorScale;
  createdAt: string;
}
