import React, { useState, memo, useEffect } from "react";
import "./index.scss";
import { useGridAg } from "../../GridAgContext";
import Icon from "components/icon";
import { showToast } from "utils/common";

const CustomCellCommentLast = (props) => {
  const { setDataModalComment, checkComment } = useGridAg();
  const [haveComment, setHaveComment] = useState(false);

  useEffect(() => {
    if (checkComment && checkComment?.listDataLast) {
      let checkCell = checkComment.listDataLast;
      setHaveComment(checkCell[props.data.rowKey] ? true : false);
    }
  }, [checkComment, props]);

  return (
    <div className="custom-cell-render-comment-last">
      <div className="comment-column">
        <div
          className="index--comment"
          onClick={() => {
            const rowKey = props.data.rowKey;
            if (rowKey) {
              // setShowModalNote(true);
              // setRowKeyComment(rowKey);
              // setColumnKeyComment("cot-lam-ro");
              setDataModalComment({
                show: true,
                rowKey: props.data.rowKey,
                columnKey: props.colDef.field,
              });
            } else {
              showToast("Hãy thêm cột dữ liệu đầu tiên", "error");
            }
          }}
        >
          <div className="icon-comment">
            {haveComment ? <div className="red-dot"></div> : null}
            <Icon name="Comment" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CustomCellCommentLast);
