import React, { Fragment, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ITimekeepingFilterRequest } from "model/timekeeping/TimekeepingRequestModel";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function TimeKeepingList() {
  document.title = "Danh sách lịch chấm công";

  const isMounted = useRef(false);

  const [listTimeKeeping, setListTimeKeeping] = useState<ICustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<ITimekeepingFilterRequest>({ month: 1 });
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Tất cả lịch chấm công",
      is_active: true,
    },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_keeping",
        name: "Thời gian",
        type: "date-two",
        is_featured: true,
        value: searchParams.get("from_date") ?? "",
        value_extra: searchParams.get("to_date") ?? "",
      },
    ],
    [searchParams]
  );

  const titleAction: ITitleActions = {
    actions: [
      {
        title: "Xác nhận công",
      },
    ],
  };

  const titles = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="page-content">
      <TitleAction title="Thông tin chấm công" titleActions={titleAction} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Lịch chấm công"
          placeholderSearch="Tìm kiếm theo tên"
          params={params}
          isSaveSearch={true}
          isFilter={true}
          listSaveSearch={listSaveSearch}
          listFilterItem={customerFilterList}
          updateParams={() => console.log()}
        />

        {!isLoading && listTimeKeeping && listTimeKeeping.length > 0 ? (
          <BoxTable name="Lịch chấm công" titles={titles} items={listTimeKeeping} isPagination={false} striped={false} actionType="inline" />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem || (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp.
                    <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}
