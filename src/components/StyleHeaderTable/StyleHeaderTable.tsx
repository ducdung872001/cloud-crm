import React from "react";

export const StyleHeaderTable = (props) => {
    return (
      <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        {props.displayName}
      </div>
    )
}