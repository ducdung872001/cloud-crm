import React from "react";
import ImageError from "assets/images/error.png";
import "./index.scss";

interface ImageProps {
  src: string;
  imageError?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
  onClick?: any;
}

export default function Image(props: ImageProps) {
  const { src, alt, width = "64rem", height, className, imageError, onClick } = props;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`wrapper__image ${className}`}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.src = imageError || ImageError;
      }}
      onClick={onClick}
    />
  );
}
