import { useState } from "react";

const defaultActionSetting = [
  {
    id: "",
    action: null,
    time: null,
    point: "",
  },
];

export default function useActionSettings() {
  const [dataStepAction, setDataStepAction] = useState([]);
  const [listActionEmail, setListActionEmail] = useState([]);
  const [listActionZalo, setListActionZalo] = useState([]);
  const [listActionSms, setListActionSms] = useState([]);
  const [listActionCall, setListActionCall] = useState([]);

  const [settingEmail, setSettingEmail] = useState([...defaultActionSetting]);
  const [settingZalo, setSettingZalo] = useState([...defaultActionSetting]);
  const [settingSms, setSettingSms] = useState([...defaultActionSetting]);
  const [settingCall, setSettingCall] = useState([...defaultActionSetting]);

  return {
    dataStepAction,
    setDataStepAction,
    listActionEmail,
    setListActionEmail,
    listActionZalo,
    setListActionZalo,
    listActionSms,
    setListActionSms,
    listActionCall,
    setListActionCall,
    settingEmail,
    setSettingEmail,
    settingZalo,
    setSettingZalo,
    settingSms,
    setSettingSms,
    settingCall,
    setSettingCall,
  };
}
