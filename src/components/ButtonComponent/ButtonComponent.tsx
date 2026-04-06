import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";
import "./ButtonComponent.scss";


const style_fontSize_fontWeight_color: React.CSSProperties = { fontSize: 14, fontWeight: '500', color: '#FFFFFF' };
const ButtonComponent = (props: { name: string; callback: () => void; className?: string; disabled?: boolean }) => {
  const {name, callback, className, disabled } = props;

  const [isLoading, setIsLoading] = useState(false);


  return (
    <div 
        className={className ? className : disabled ? "container-button-component-disabled" : "container-button-component"}
        onClick={() => {
            callback();
        }}
    >
        <span style={style_fontSize_fontWeight_color}>{name}</span>
    </div>
  );
};

export default memo(ButtonComponent);
