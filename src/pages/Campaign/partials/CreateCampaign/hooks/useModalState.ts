import { useState } from "react";
import { IContentDialog } from "components/dialog/dialog";

export default function useModalState() {
  const [modalSettingAction, setModalSettingAction] = useState(false);
  const [approachData, setApproachData] = useState(null);
  const [modalSettingSLA, setModalSettingSLA] = useState(false);
  const [dataApproach, setDataApproach] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [dataRule, setDataRule] = useState(null);
  const [indexRule, setIndexRule] = useState(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  return {
    modalSettingAction,
    setModalSettingAction,
    approachData,
    setApproachData,
    modalSettingSLA,
    setModalSettingSLA,
    dataApproach,
    setDataApproach,
    isFilter,
    setIsFilter,
    dataRule,
    setDataRule,
    indexRule,
    setIndexRule,
    showDialog,
    setShowDialog,
    contentDialog,
    setContentDialog,
  };
}
