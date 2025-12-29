import React, { Fragment, useState, useMemo, useContext, useEffect, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import TeamEmployeeService from "services/TeamEmployeeService";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { getPageOffset } from "reborn-util";
import _ from "lodash";

export default function TableTeamEmployee(props: any) {
  const { groupId } = props;
  const isMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tableEmployee, setTableEmployee] = useState([]);
  const [listIdCheckedEmployee, setListIdCheckedEmployee] = useState<number[]>([]);
  console.log('tableEmployee1223', tableEmployee);
  
  
  const [params, setParams] = useState<any>({
    name: "",
    limit: 30,
    page: 1
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });

  const abortController = new AbortController();

  const getListTableEmployee = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await TeamEmployeeService.listEmployee(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setTableEmployee(result?.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
        getListTableEmployee(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titles = ["STT", "Tên nhân viên",  "Phòng ban"];
  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.employee?.name,
    item?.employee?.departmentName
  ];

  const actionsTable = (item: any): IAction[] => {
    return [];
  };

  useEffect(() => {
    if(groupId){
        setParams((preState) => ({ ...preState, groupId: groupId }));
    }
  }, [groupId]);


  return (
    <Fragment>
        <div>
            <span style={{fontSize: 14, fontWeight: '700'}}>Danh sách nhân viên</span>
            <div className="container-table-employee">
                {!isLoading && tableEmployee && tableEmployee.length > 0 ? (
                    <BoxTable
                        name="Nhân viên"
                        titles={titles}
                        items={tableEmployee}
                        isPagination={true}
                        dataPagination={pagination}
                        dataMappingArray={(item, index) => dataMappingArray(item, index)}
                        dataFormat={dataFormat}
                        striped={true}
                        isBulkAction={true}
                        listIdChecked={listIdCheckedEmployee}
                        // bulkActionItems={bulkActionList}
                        setListIdChecked={(listId) => setListIdCheckedEmployee(listId)}
                        actions={actionsTable}
                        actionType="inline"
                    />
                    ) : isLoading ? (
                        <Loading />
                    ) : (
                    <Fragment>
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
                    </Fragment>
                )}
            </div>
        </div>
    </Fragment>
  );
}
