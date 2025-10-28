import React, { useEffect, useState } from "react";
import { IFilterItem, ISaveSearch, ISaveSearchParam } from "model/OtherModel";
import "./saveSearch.scss";

interface SaveSearchProps {
  params: any;
  listSaveSearch?: ISaveSearch[];
  listFilterItem?: IFilterItem[];
  setDisabledSaveSearch: (e: boolean) => void;
  callback: (saveSearch: ISaveSearch) => void;
  setTabActive?: any;
}

export default function SaveSearch(props: SaveSearchProps) {
  const { params, listSaveSearch, listFilterItem, setDisabledSaveSearch, callback, setTabActive } = props;
  const [saveSearchItems, setSaveSearchItems] = useState<ISaveSearch[]>(listSaveSearch);

  useEffect(() => {
    setSaveSearchItems(listSaveSearch);
  }, [listSaveSearch]);

  const changeSaveSearch = (key: string | number) => {
    const saveSearchListTemp = saveSearchItems.map((saveSearch) => {
      if (saveSearch.key === key) {
        return {
          ...saveSearch,
          is_active: true,
        };
      }
      return { ...saveSearch, is_active: false };
    });
    setSaveSearchItems(saveSearchListTemp);
    setDisabledSaveSearch(true);
  };

  const buildSaveSearch = () => {
    const searchCurrent: ISaveSearchParam[] = [];
    const saveSearchItemsNew = [
      ...saveSearchItems.map((saveSearch) => {
        return { ...saveSearch, is_active: false };
      }),
    ];

    if (params.query) {
      searchCurrent.push({ key: "query", value: params.query });
    }

    listFilterItem?.map((filter) => {
      if (filter.value) {
        searchCurrent.push({
          key: filter.key,
          value: filter.value,
          ...(filter.type === "date-two" ? { value_extra: filter.value_extra } : {}),
        });
      }
    });
    let disableSaveSearchTemp = false;
    if (searchCurrent.length > 0) {
      if (saveSearchItems.length > 0 && searchCurrent.length === saveSearchItems.length) {
        for (let i = 0; i < saveSearchItems.length; i++) {
          if (saveSearchItems[i].params) {
            const searchCurrentTemp = searchCurrent.filter(
              (param) =>
                !saveSearchItems[i].params?.find(
                  (paramSSItem) =>
                    paramSSItem.key === param.key &&
                    paramSSItem.value === param.value &&
                    ((paramSSItem.value_extra && param.value_extra && paramSSItem.value_extra === param.value_extra) ||
                      (!paramSSItem.value_extra && !param.value_extra))
                )
            );
            const saveSearchParamTemp = saveSearchItems[i].params?.filter(
              (paramSS) =>
                !searchCurrent?.find(
                  (paramItem) =>
                    paramItem.key === paramSS.key &&
                    paramItem.value === paramSS.value &&
                    ((paramItem.value_extra && paramSS.value_extra && paramItem.value_extra === paramSS.value_extra) ||
                      (!paramItem.value_extra && !paramSS.value_extra))
                )
            );
            if (searchCurrentTemp.length === 0 && saveSearchParamTemp.length === 0) {
              saveSearchItemsNew[i].is_active = true;
              disableSaveSearchTemp = true;
              break;
            }
          }
        }
        setDisabledSaveSearch(disableSaveSearchTemp);
      } else {
        setDisabledSaveSearch(disableSaveSearchTemp);
      }
    } else {
      setDisabledSaveSearch(true);
    }

    if (!saveSearchItemsNew.find((saveSearch) => saveSearch.is_active === true) && searchCurrent.length === 0) {
      const indexAll = saveSearchItemsNew.findIndex((saveSearch) => saveSearch.key === "all");
      saveSearchItemsNew[indexAll].is_active = true;
    }
    setSaveSearchItems(saveSearchItemsNew);
  };

  useEffect(() => {
    buildSaveSearch();
  }, [params]);

  return (
    <ul className="save-search d-flex align-items-center">
      {saveSearchItems.map((item, idx) => {
        return (
          <li
            key={idx}
            className={item.is_active ? "active" : ""}
            onClick={() => {
              changeSaveSearch(item.key);
              callback(item);
              if (setTabActive) {
                setTabActive(item.key);
              }
            }}
          >
            {item.name}
          </li>
        );
      })}
      {!saveSearchItems.find((saveSearch) => saveSearch.is_active === true) && <li className="active">Tìm kiếm ...</li>}
    </ul>
  );
}
