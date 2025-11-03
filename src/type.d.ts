declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.avif";
declare module "*.ttf";
declare module "*.wav";
declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}
declare const fetch;
