import { useEffect, useState } from "react";

export default function useScoringSystem() {
  const [scoreSetting, setScoreSetting] = useState([]);
  const [scoreEmployee, setScoreEmployee] = useState(0);
  const [timeExpireContact, setTimeExpireContact] = useState(0);
  const [timeExpireFinish, setTimeExpireFinish] = useState(0);

  const [minusPoints, setMinusPoints] = useState({
    getLead: 0,
    leadFail: 0,
    leadTakeBack: {
      point: 0,
      expireContact: {
        day: 0,
        hour: 0,
        minute: 0,
      },
      expireFinish: {
        day: 0,
        hour: 0,
        minute: 0,
      },
    },
    sla: 0,
  });

  const [plusPoints, setPlusPoints] = useState({
    getContact: 0,
    leadSuccess: 0,
  });

  const defaultAnnotateValues = [
    {
      name: "Lạnh",
      color: "var(--primary-color-70)",
      during: "0 - 25",
      code: "cold",
    },
    {
      name: "Mát",
      color: "var(--primary-color)",
      during: "26 - 50",
      code: "cool",
    },
    {
      name: "Ấm",
      color: "var(--warning-color)",
      during: "51 - 75",
      code: "warn",
    },
    {
      name: "Nóng",
      color: "var(--error-darker-color)",
      during: "76 - 100",
      code: "hot",
    },
  ];

  const [lstAnnotate, setLstAnnotate] = useState(defaultAnnotateValues);
  const [valueAnnotate, setValueAnnotate] = useState([25, 50, 75]);

  useEffect(() => {
    const day = minusPoints.leadTakeBack.expireContact.day;
    const hour = minusPoints.leadTakeBack.expireContact.hour;
    const minute = minusPoints.leadTakeBack.expireContact.minute;

    const seconds = day * 24 * 60 * 60 + hour * 60 * 60 + minute * 60;
    setTimeExpireContact(seconds);
  }, [minusPoints.leadTakeBack.expireContact]);

  useEffect(() => {
    const day = minusPoints.leadTakeBack.expireFinish.day;
    const hour = minusPoints.leadTakeBack.expireFinish.hour;
    const minute = minusPoints.leadTakeBack.expireFinish.minute;

    const seconds = day * 24 * 60 * 60 + hour * 60 * 60 + minute * 60;
    setTimeExpireFinish(seconds);
  }, [minusPoints.leadTakeBack.expireFinish]);

  return {
    scoreSetting,
    setScoreSetting,
    scoreEmployee,
    setScoreEmployee,
    timeExpireContact,
    setTimeExpireContact,
    timeExpireFinish,
    setTimeExpireFinish,
    minusPoints,
    setMinusPoints,
    plusPoints,
    setPlusPoints,
    lstAnnotate,
    setLstAnnotate,
    valueAnnotate,
    setValueAnnotate,
  };
}
