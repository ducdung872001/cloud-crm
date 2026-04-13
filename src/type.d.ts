declare module "*.svg" {
  import React from "react";
  const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}
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
