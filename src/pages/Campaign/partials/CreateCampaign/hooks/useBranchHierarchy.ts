import { useEffect, useState } from "react";

export default function useBranchHierarchy() {
  const [checkFieldBranch, setcheckFieldBranch] = useState<boolean>(false);

  const [listBranchId, setListBranchId] = useState({
    level0: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  });

  const [listBranchValue, setListBranchValue] = useState([
    {
      id: "level_0",
      value: [],
    },
  ]);

  const [listBranchDeleted0, setListBranchDelete0] = useState([]);
  const [listBranchDeleted1, setListBranchDelete1] = useState([]);
  const [listBranchDeleted2, setListBranchDelete2] = useState([]);
  const [listBranchDeleted3, setListBranchDelete3] = useState([]);

  useEffect(() => {
    if (listBranchValue && listBranchValue.length > 0) {
      let idArray_0 = [];
      let idArray_1 = [];
      let idArray_2 = [];
      let idArray_3 = [];
      let idArray_4 = [];

      listBranchValue.map((item) => {
        if (item.id === "level_0") {
          idArray_0 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_1") {
          idArray_1 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_2") {
          idArray_2 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_3") {
          idArray_3 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_4") {
          idArray_4 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }

        setListBranchId({
          level0: idArray_0,
          level1: idArray_1,
          level2: idArray_2,
          level3: idArray_3,
          level4: idArray_4,
        });
      });
    }
  }, [listBranchValue]);

  return {
    checkFieldBranch,
    setcheckFieldBranch,
    listBranchId,
    setListBranchId,
    listBranchValue,
    setListBranchValue,
    listBranchDeleted0,
    setListBranchDelete0,
    listBranchDeleted1,
    setListBranchDelete1,
    listBranchDeleted2,
    setListBranchDelete2,
    listBranchDeleted3,
    setListBranchDelete3,
  };
}
