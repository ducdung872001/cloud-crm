import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IKpiSetupModalProps } from "model/kpiSetup/PropsModel";
import { IAction, IActionModal } from "model/OtherModel";
import { IKpiSetupResponse } from "model/kpiSetup/KpiSetupResponseModel";
import Icon from "components/icon";
import Button from "components/button/button";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import KpiSetupService from "services/KpiSetupService";
// import TableKpiSetup from "./partials/TableKpiSetup";
import "./ModalListUploadFile.scss"; 
import { formatCurrency, getPageOffset } from "reborn-util";
import OrganizationService from "services/OrganizationService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import _ from "lodash";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import SearchBox from "components/searchBox/searchBox";

export default function ModalListUploadFile(props: any) {
  const { onShow, onHide, data } = props;

  const isMounted = useRef(false);

  const [listUploadFile, setListUploadFile] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataFile, setDataFile] = useState(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  
  const [params, setParams] = useState({
    name: '',
    limit: 10,
    bsnId: null,
    page: 1
  });

  useEffect(() => {
    if(data?.id){
        setParams((preState) => ({...preState, bsnId: data.id}))
    }
  }, [data, onShow])

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "file",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListFileUpload = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await OrganizationService.customerUploadList(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = result.items.map(item => {
        return {
          fileName: item.fileName,
          id: item.uploadId
        }
      })  || [];
      setListUploadFile(newData);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
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
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      if(params?.bsnId){
        getListFileUpload(params);
      }
      
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

  const titles = ["STT", "Tên file",];

  const dataFormat = ["text-center", "", "text-right", "text-right"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.fileName,
  ];

  const actionsTable = (item: IKpiSetupResponse): IAction[] => {
    
    return [
    //   {
    //     title: "Sửa",
    //     icon: <Icon name="Pencil" />,
    //     callback: () => {
    //         setDataFile(item);          
    //     },
    //   },
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
    const response = await OrganizationService.customerUploadDelete(id);

    if (response.code === 0) {
      showToast("Xóa file upload thành công", "success");
      getListFileUpload(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onDeleteAll = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        OrganizationService.customerUploadDelete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa file upload thành công", "success");
        getListFileUpload(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
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
          Bạn có chắc chắn muốn xóa {item ? "file upload " : `${listIdChecked.length} file upload đã chọn`}
          {item ? <strong>{item.fileName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        setShowDialog(false);
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: 
         [
            {
              title: "Đóng",
              color: "primary",
              variant: "outline",
              callback: () => {
                onHide(false);
                setDataFile(null);
              },
            },
          ],
      },
    }),
    []
  );

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: `Xóa file upload`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <Fragment>
      <Modal 
        isFade={true} 
        isOpen={onShow} 
        isCentered={true} 
        staticBackdrop={true} 
        toggle={() => onHide(false)} 
        className="modal-list-upload-file"
        size="lg"
      >
        <ModalHeader title={`Danh sách file upload`} toggle={() => onHide(false)} />
        <ModalBody>
          <SearchBox name={`Tên file`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />

            <div className="wrapper__list-file-upload">

              {!isLoading && listUploadFile && listUploadFile.length > 0 ? (
                  <BoxTable
                      name="Danh sách tổ chức"
                      titles={titles}
                      items={listUploadFile}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormat}
                      listIdChecked={listIdChecked}
                      isBulkAction={true}
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
                              Hiện tại chưa có file upload nào. <br />
                          </span>
                          }
                          type="no-item"
                          titleButton=''
                          action={() => {
                          // setDataOrganization(null);
                          //   setShowModalAdd(true);
                          }}
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
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
