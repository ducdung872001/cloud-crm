import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";
import "./ButtonComponent.scss";

const ButtonComponent = (props: any) => {
  const {name, callback, className, disabled } = props;

  const [isLoading, setIsLoading] = useState(false);


  return (
    <div 
        className={className ? className : disabled ? "container-button-component-disabled" : "container-button-component"}
        onClick={() => {
            callback();
        }}
    >
        <span style={{fontSize: 14, fontWeight: '500', color: '#FFFFFF'}}>{name}</span>
    </div>
  );
};

export default memo(ButtonComponent);
