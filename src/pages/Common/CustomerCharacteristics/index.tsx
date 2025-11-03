import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import ObjectFeatureService from "services/ObjectFeatureService";
import { IAction, IActionModal, ISaveSearch } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import "./index.scss";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import SearchBox from "components/searchBox/searchBox";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import Button from "components/button/button";
import AddCustomerCharacteristics from "./partials/AddCustomerCharacteristics";

interface ICustomerCharacteristicsProps {
  onShow: boolean;
  onHide: (reload) => void;
  data?: any;
  typeProps: "product" | "service";
}

export default function CustomerCharacteristics(props: ICustomerCharacteristicsProps) {
  const { onShow, onHide, data, typeProps } = props;

  const isMounted = useRef(false);

  const [listCustomerCharacteristics, setListCustomerCharacteristics] = useState([]);
  const [dataCustomerCharacteristics, setDataCustomerCharacteristics] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
    objectType: typeProps == "product" ? 1 : 2,
  });

  useEffect(() => {
    if (data) {
      setParams({ ...params, objectId: data } as any);
    }
  }, [data]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách đặc trưng khách hàng",
      is_active: true,
    },
  ]);

  // const [pagination, setPagination] = useState<PaginationProps>({
  //   ...DataPaginationDefault,
  //   name: "Đặc trưng khách hàng",
  //   isChooseSizeLimit: true,
  //   setPage: (page) => {
  //     setParams((prevParams) => ({ ...prevParams, page: page }));
  //   },
  //   chooseSizeLimit: (limit) => {
  //     setParams((prevParams) => ({ ...prevParams, limit: limit }));
  //   },
  // });

  const getListCustomerCharacteristics = async (paramsSearch) => {
    setIsLoading(true);

    const response = await ObjectFeatureService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerCharacteristics(result);

      // setPagination({
      //   ...pagination,
      //   page: +result.page,
      //   sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
      //   totalItem: +result.total,
      //   totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      // });

      if (+result.total === 0 || +result.length === 0) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListCustomerCharacteristics(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [params]);

  const titles = ["STT", "Tên tiêu chí", "Trọng số"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item, index: number) => [index + 1, item.name, item.weight];

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCustomerCharacteristics(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await ObjectFeatureService.delete(id);

    if (response.code === 0) {
      showToast("Xóa đặc trưng khách hàng thành công", "success");
      getListCustomerCharacteristics(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "đặc trưng khách hàng " : `${listIdChecked.length} đơn vị sản phẩm đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa đặc trưng khách hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [hasSubmitForm, setHasSubmitForm] = useState<boolean>(false);
  const [hasBackup, setHasBackup] = useState<boolean>(false);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: showModalAdd ? "Quay lại" : "Đóng",
            color: "primary",
            variant: "outline",
            disabled: hasSubmitForm,
            callback: () => {
              if (showModalAdd) {
                setShowModalAdd(false);
                setDataCustomerCharacteristics(null);
              } else {
                onHide(false);
              }
            },
          },

          ...(showModalAdd
            ? ([
                {
                  title: dataCustomerCharacteristics ? "Chỉnh sửa" : "Thêm mới",
                  color: "primary",
                  callback: () => setHasSubmitForm(true),
                  is_loading: hasSubmitForm,
                  disabled: hasSubmitForm || hasBackup,
                },
              ] as any)
            : []),
        ],
      },
    }),
    [showModalAdd, dataCustomerCharacteristics, hasSubmitForm, hasBackup]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        size={showModalAdd ? "xl" : "lg"}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        className="modal-add-object-feature"
      >
        <div className="box__object-feature">
          <ModalHeader title={`${true ? "Đặc trưng khách hàng" : "Thêm mới"}`} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="box__condition">
              {!showModalAdd ? (
                <div className="box__view--feature d-flex flex-column">
                  <div className="action__body--feature">
                    <SearchBox
                      params={params}
                      isSaveSearch={true}
                      listSaveSearch={listSaveSearch}
                      updateParams={(paramsNew) => setParams(paramsNew)}
                    />
                    <Tippy content="Thêm mới khách hàng đặc trưng">
                      <div
                        className="action__add"
                        onClick={() => {
                          setShowModalAdd(true);
                          setDataCustomerCharacteristics(null);
                        }}
                      >
                        <Button color="success">
                          <Icon name="PlusCircleFill" />
                        </Button>
                      </div>
                    </Tippy>
                  </div>
                  <div className="wrapper__content--feature">
                    {!isLoading && listCustomerCharacteristics && listCustomerCharacteristics.length > 0 ? (
                      <BoxTable
                        name="Đặc trưng khách hàng"
                        titles={titles}
                        items={listCustomerCharacteristics}
                        isPagination={false}
                        // dataPagination={pagination}
                        dataMappingArray={(item, index) => dataMappingArray(item, index)}
                        dataFormat={dataFormat}
                        isBulkAction={true}
                        listIdChecked={listIdChecked}
                        bulkActionItems={bulkActionList}
                        striped={true}
                        setListIdChecked={(listId) => setListIdChecked(listId)}
                        actions={actionsTable}
                        actionType="inline"
                      />
                    ) : isLoading ? (
                      <Loading />
                    ) : (
                      <Fragment>
                        {isPermissions ? (
                          <SystemNotification type="no-permission" />
                        ) : isNoItem ? (
                          <SystemNotification
                            description={
                              <span>
                                Hiện tại chưa có khách hàng đặc trưng nào. <br />
                                Hãy thêm mới khách hàng đặc trưng đầu tiên nhé!
                              </span>
                            }
                            type="no-item"
                          />
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
                </div>
              ) : (
                <AddCustomerCharacteristics
                  idProduct={data}
                  data={dataCustomerCharacteristics}
                  onShow={showModalAdd}
                  onReload={(reload) => {
                    if (reload) {
                      setShowModalAdd(false);
                    }
                    setHasSubmitForm(false);
                  }}
                  objectType={typeProps === "product" ? 1 : 2}
                  hasSubmitForm={hasSubmitForm}
                  disableFieldCommom={false}
                  handBackup={(backup) => {
                    if (backup) {
                      setHasBackup(backup);
                    } else {
                      setHasBackup(false);
                    }
                  }}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
