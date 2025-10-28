import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import Icon from "components/icon";
import "./ListButtonHeader.scss";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import ButtonExportNode from "../ButtonExportNode/ButtonExportNode";

export default function ListButtonHeader(props) {
  const {
    data,
    dataNode,
    processId,
    disable,
    isSubmit,
    setIsModalSetting,
    setIsModalClone,
    setIsModalDebug,
    handleClear,
    disableCopy,
    disableVarSetting,
    disableDebug,
    disableSave,
    disableExport,
  } = props;

  const addNode = async () => {
    const body = {
      name: data?.name,
      typeNode: dataNode.type,
      processId: processId,
      nodeId: dataNode.id,
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
      showToast(`Lưu Node thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <div className="list-button-header">
      {disable || disableCopy ? null : (
        <Tippy content="Sao chép nhiệm vụ khác">
          <div>
            <Button
              onClick={() => {
                setIsModalClone(true);
              }}
              type="button"
              className="btn-setting"
              color="transparent"
              onlyIcon={true}
            >
              <Icon name="Copy" />
            </Button>
          </div>
        </Tippy>
      )}
      {disable || disableVarSetting ? null : (
        <Tippy content="Cài đặt biến">
          <div>
            <Button
              onClick={() => {
                setIsModalSetting(true);
              }}
              type="button"
              className="btn-setting"
              color="transparent"
              onlyIcon={true}
            >
              <Icon name="VarSetting" style={{ width: 20 }} />
            </Button>
          </div>
        </Tippy>
      )}
      {disable || disableDebug ? null : (
        <Tippy content="Debug">
          <div>
            <Button
              onClick={() => {
                setIsModalDebug(true);
              }}
              type="button"
              className="btn-setting"
              color="transparent"
              onlyIcon={true}
            >
              <Icon name="Debug" style={{ width: 20 }} />
            </Button>
          </div>
        </Tippy>
      )}
      {disable || disableSave ? null : (
        <Tippy content="Lưu Node">
          <div>
            <Button
              onClick={() => {
                addNode();
              }}
              type="button"
              className="btn-setting"
              color="transparent"
              onlyIcon={true}
            >
              <Icon name="CheckedCircle" style={{ width: 22 }} />
            </Button>
          </div>
        </Tippy>
      )}
      {disable || disableExport ? null : <ButtonExportNode nodeId={dataNode?.id} />}
      <Button onClick={() => !isSubmit && handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
        <Icon name="Times" />
      </Button>
    </div>
  );
}
