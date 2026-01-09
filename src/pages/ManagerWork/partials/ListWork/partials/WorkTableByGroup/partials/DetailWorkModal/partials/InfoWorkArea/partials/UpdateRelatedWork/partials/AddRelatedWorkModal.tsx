import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { ISaveSearch } from "model/OtherModel";
import { IAddRelatedWorkModelProps } from "model/workOrder/PropsModel";
import { IWorkOrderFilterRequest, IUpdateRelatedWorkRequestModel } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import "./AddRelatedWorkModal.scss";

export default function AddRelatedWorkModal(props: IAddRelatedWorkModelProps) {
  const { onShow, onHide, idWork, listIdRelatedWork } = props;

  const isMounted = useRef(false);

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listWork, setListWork] = useState<IWorkOrderResponseModel[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [params, setParams] = useState<IWorkOrderFilterRequest>({
    name: "",
    limit: 0,
  });

  //! đoạn này xử lý vấn đề khi mà onShow thay đổi thì set lại params
  useEffect(() => {
    if (onShow) {
      setParams({ ...params, limit: 10 });
    }
  }, [onShow]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách công việc",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công việc",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListWork = async (paramsSearch: IWorkOrderFilterRequest) => {
    setIsLoading(true);

    const response = await WorkOrderService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      const checkDuplicates = [...result.items].filter((item) => {
        return !listIdRelatedWork.some((element) => {
          return element === item.id;
        });
      });

      setListWork(checkDuplicates);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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

    //! đoạn này ép đk call api
    if (isMounted.current === true && onShow && params.limit > 0 && params.page >= 1) {
      getListWork(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params, onShow]);

  const titles = ["STT", "Tên công việc", "Bắt đầu", "Kết thúc", "Dự án tham gia", "Trạng thái công việc"];

  const dataFormat = ["text-center", "", "", "", "", "", "text-center"];

  //! đoạn này xử lý vấn đề call API Update công việc liên quan
  const handleUpdateRelatedWork = async () => {
    const mergeRelatedWork = [...listIdChecked, ...listIdRelatedWork];

    const body: IUpdateRelatedWorkRequestModel = {
      id: idWork,
      otherWorkOrders: JSON.stringify(mergeRelatedWork),
    };

    const response = await WorkOrderService.updateOtherWorkOrder(body);

    if (response.code === 0) {
      showToast("Thêm công việc liên quan thành công", "success");
      setParams({ ...params, limit: 0, page: 0 });
      setListIdChecked([]);
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề lấy hết những người đc chọn
  const checkAll = (isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked &&
        setListIdChecked(
          listWork.map((i) => {
            return i.id;
          })
        );
    } else {
      setListIdChecked && setListIdChecked([]);
    }
  };

  //! đoạn này xử lý vấn đề chọn 1 người
  const checkOne = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
    } else {
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
    }
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-add-related--work">
        <div className="wrapper__option-related--work">
          <ModalHeader
            title="Chọn công việc liên quan"
            toggle={() => {
              setParams({ ...params, limit: 0, page: 0 });
              setListIdChecked([]);
              onHide(false);
            }}
          />
          <ModalBody>
            <div className="search-related--work">
              <SearchBox
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                placeholderSearch="Tìm kiếm tên công việc"
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
            </div>
            <CustomScrollbar width="100%" height="57rem">
              <div className="list__option-related--work">
                {!isLoading && listWork && listWork.length > 0 ? (
                  <div className="table__related--work">
                    <table className="wrapper-table">
                      <thead>
                        <tr>
                          <th className="checkbox">
                            <Checkbox
                              indeterminate={listIdChecked?.length > 0 && listIdChecked?.length < listWork.length}
                              checked={listIdChecked?.length === listWork.length}
                              onChange={(e) => checkAll(e.target.checked)}
                            />
                            {listIdChecked?.length > 0 && (
                              <div className="view__count-click">
                                <ul className="d-flex align-items-center">
                                  <li className="select-count">
                                    Có
                                    <span>{listIdChecked?.length} người tham gia</span>
                                    được chọn
                                  </li>
                                  <li>
                                    <Button className="confirm-action" onClick={() => handleUpdateRelatedWork()}>
                                      Xác nhận
                                    </Button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </th>
                          {titles?.map((title, idx) => (
                            <th key={idx} className={`${dataFormat ? dataFormat[idx] : ""}`}>
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listWork.map((item, index) => {
                          const isChecked = listIdChecked && setListIdChecked && listIdChecked.some((id) => id === item.id) ? true : false;

                          return (
                            <Fragment key={index}>
                              <tr
                                onClick={() => {
                                  checkOne(item.id, !isChecked);
                                }}
                                className={`cursor-pointer ${isChecked ? " has-choose" : ""}`}
                              >
                                {listIdChecked && setListIdChecked && (
                                  <td className="checkbox" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox checked={isChecked} onChange={(e) => checkOne(item.id, e.target.checked)} />
                                  </td>
                                )}
                                <td className="text-center">{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{moment(item.startTime).format("DD/MM/YYYY")}</td>
                                <td>{moment(item.endTime).format("DD/MM/YYYY")}</td>
                                <td>{item.projectName}</td>
                                <td className="text-center">
                                  {item.status == 0 ? (
                                    <span className="status-unfulfilled">Chưa thực hiện</span>
                                  ) : item.status == 1 ? (
                                    <span className="status-success">Đã hoàn thành</span>
                                  ) : item.status == 2 ? (
                                    <span className="status-processing">Đang thực hiện</span>
                                  ) : (
                                    <span className="status-cancelled">Đã hủy</span>
                                  )}
                                </td>
                              </tr>
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                    <Pagination
                      name={pagination.name}
                      displayNumber={pagination.displayNumber}
                      page={pagination.page}
                      setPage={(page) => pagination.setPage(page)}
                      sizeLimit={pagination.sizeLimit}
                      totalItem={pagination.totalItem}
                      totalPage={pagination.totalPage}
                      isChooseSizeLimit={pagination.isChooseSizeLimit}
                      chooseSizeLimit={(limit) => pagination.chooseSizeLimit && pagination.chooseSizeLimit(limit)}
                    />
                  </div>
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <Fragment>
                    {!isNoItem ? (
                      <SystemNotification description={<span>Hiện tại chưa có công việc liên quan nào.</span>} type="no-item" />
                    ) : (
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
            </CustomScrollbar>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}
