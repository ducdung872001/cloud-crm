import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import { ISaveSearch } from "model/OtherModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import { IAddParticipantModalProps } from "model/workOrder/PropsModel";
import { IUpdateParticipantRequestModel } from "model/workOrder/WorkOrderRequestModel";
import Loading from "components/loading";
import Button from "components/button/button";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, Pagination, PaginationProps } from "components/pagination/pagination";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import "./AddParticipantModal.scss";

export default function AddParticipantModal(props: IAddParticipantModalProps) {
  const { onShow, onHide, idWork, listIdParticipant } = props;

  const isMounted = useRef(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IEmployeeResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);

  const [params, setParams] = useState<IEmployeeFilterRequest>({ name: "", limit: 0 });

  //! đoạn này xử lý vấn đề khi mà onShow thay đổi thì set lại params
  useEffect(() => {
    if (onShow) {
      setParams({ ...params, limit: 10 });
    }
  }, [onShow]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách người liên quan",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Người liên quan",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListEmployee = async (paramsSearch: IEmployeeFilterRequest) => {
    setIsLoading(true);

    const response = await EmployeeService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;

      const checkDuplicates = [...result.items].filter((item) => {
        return !listIdParticipant.some((element) => {
          return element === item.id;
        });
      });

      setListEmployee(checkDuplicates);

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
    if (isMounted.current === true && onShow && params.limit > 0) {
      getListEmployee(params);

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params, onShow]);

  const titles = ["STT", "Ảnh đại diện", "Tên người liên quan", "Số điện thoại"];

  const dataFormat = ["text-center", "", "", ""];

  //! đoạn này xử lý vấn đề call API Update người tham gia
  const handleUpdateParticipant = async () => {
    const mergeParticipant = [...listIdChecked, ...listIdParticipant];

    const body: IUpdateParticipantRequestModel = {
      id: idWork,
      participants: JSON.stringify(mergeParticipant),
    };

    const response = await WorkOrderService.updateParticipant(body);

    if (response.code === 0) {
      showToast("Thêm người tham gia thành công", "success");
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
          listEmployee.map((i) => {
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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-add-participant">
        <div className="wrapper__option-participant">
          <ModalHeader
            title="Chọn người tham gia"
            toggle={() => {
              setListIdChecked([]);
              onHide(false);
            }}
          />
          <ModalBody>
            <div className="search-participant">
              <SearchBox
                params={params}
                isSaveSearch={true}
                listSaveSearch={listSaveSearch}
                placeholderSearch="Tìm kiếm tên người tham gia"
                updateParams={(paramsNew) => setParams(paramsNew)}
              />
            </div>
            <CustomScrollbar width="100%" height="57rem">
              <div className="list__option--participant">
                {!isLoading && listEmployee && listEmployee.length > 0 ? (
                  <div className="table__participant">
                    <table className="wrapper-table">
                      <thead>
                        <tr>
                          <th className="checkbox">
                            <Checkbox
                              indeterminate={listIdChecked?.length > 0 && listIdChecked?.length < listEmployee.length}
                              checked={listIdChecked?.length === listEmployee.length}
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
                                    <Button className="confirm-action" onClick={() => handleUpdateParticipant()}>
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
                        {listEmployee.map((item, index) => {
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
                                <td>
                                  <div key={item.id} className="avatar">
                                    <img src={item.avatar ? item.avatar : ImageThirdGender} alt={item.name} />
                                  </div>
                                </td>
                                <td>{item.name}</td>
                                <td>{item.phone}</td>
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
                      <SystemNotification description={<span>Hiện tại chưa có người tham gia nào.</span>} type="no-item" />
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
