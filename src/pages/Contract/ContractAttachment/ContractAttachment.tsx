import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertToId, formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./ContractAttachment.scss";
import Button from "components/button/button";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import moment from "moment";
import { IAction } from "model/OtherModel";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import SearchBox from "components/searchBox/searchBox";
import ContractPaymentService from "services/ContractPaymentService";
import ContractAttachmentService from "services/ContractAttachmentService";
import ModalAddAttachment from "./partials/ModalAddAttachment";
import { getPermissions } from "utils/common";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";

export default function ContractAttachment(props: any) {
  const { contractId, detailContract } = props;
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState([]);
  const [dataAttachment, setDataAttachment] = useState(null);

  const [isAddAttachment, setIsAddAttachment] = useState(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [permissions, setPermissions] = useState(getPermissions());
  
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (contractId) {
      setParams((preState) => ({ ...preState, contractId: contractId }));
    }
  }, [contractId]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "tài liệu",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListAttachment = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractAttachmentService.contractAttachmentList(paramsSearch);

    if (response.code == 0) {
      const result = response.result;
      setAttachmentList(result.items);

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
    getListAttachment(params);
  }, [params]);

  const titles = ["STT", "Tên tài liệu", "Loại tài liệu"];
  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.name, item.attachmentName];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Tải xuống",
        icon: <Icon name="Download" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          let fieldName = convertToId(item.name) || "";
          fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

          const type = item.link.includes(".docx")
            ? "docx"
            : item.link.includes(".xlsx")
            ? "xlsx"
            : item.link.includes(".pdf") || item.link.includes(".PDF")
            ? "pdf"
            : item.link.includes(".pptx")
            ? "pptx"
            : item.link.includes(".zip")
            ? "zip"
            : "rar";
          const name = `${fieldName}.${type}`;

          handDownloadFileOrigin(item.link, name);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataAttachment(item);
          setIsAddAttachment(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const onDeleteAll = () => {
          const selectedIds = listIdChecked || [];
          if (!selectedIds.length) return;
      
          const arrPromises = selectedIds.map((selectedId) => {
            const found = attachmentList.find((item) => item.id === selectedId);
            if (found?.id) {
              return ContractAttachmentService.contractAttachmentDelete(found.id);
            } else {
              return Promise.resolve(null);
            }
          });
          Promise.all(arrPromises)
          .then((results) => {
            const checkbox = results.filter (Boolean)?.length ||0;
            if (checkbox > 0) {
              showToast(`Xóa thành công ${checkbox} tài liệu`, "success");
              getListAttachment(params);
              setListIdChecked([]);
            } else {
              showToast("Không có tài liệu nào được xóa", "error");
            }
         })
          .finally(() => {
            setShowDialog(false);
            setContentDialog(null);
          });
        }

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa tài liệu đã chọn
          {item ? <strong> {item.name} </strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {

        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }

        const response = await ContractAttachmentService.contractAttachmentDelete(item.id);
        if (response.code === 0) {
          showToast("Xóa tài liệu thành công", "success");
          getListAttachment(params);
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
          permissions["CONTRACT_DELETE"] == 1 && {
            title: "Xóa tài liệu",
            callback: () => showDialogConfirmDelete(),
          },
        ];

  return (
    <div className="card-box wrapper__info--attachment">
      <div className="action-header-attachment">
        <div className="title__actions">
          <ul className="menu-list">
            <li className={"active"} onClick={(e) => {}}>
              {"Danh sách tài liệu"}
            </li>
          </ul>
          <div style={{ marginRight: "2rem" }}>
            <Button
              // type="submit"
              color="primary"
              // disabled={}
              onClick={() => {
                setIsAddAttachment(true);
                setDataAttachment(null);
              }}
            >
              Thêm tài liệu
            </Button>
          </div>
        </div>
        <SearchBox
          name="Tên tài liệu"
          params={params}
          // isSaveSearch={true}
          // listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
      </div>
      <div style={{ padding: "2rem" }}>
        {!isLoading && attachmentList && attachmentList.length > 0 ? (
          <BoxTable
            name="Danh sách tài liệu"
            titles={titles}
            items={attachmentList}
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
          <SystemNotification description={<span>Hiện tại chưa có tài liệu nào.</span>} type="no-item" />
        )}
      </div>
      {detailContract ? null : (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 1.6rem 1.6rem 0" }}>
          <Button
            color="primary"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/contract");
            }}
          >
            Danh sách hợp đồng
          </Button>
        </div>
      )}
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalAddAttachment
        onShow={isAddAttachment}
        data={dataAttachment}
        contractId={contractId}
        onHide={(reload) => {
          if (reload) {
            getListAttachment(params);
          }
          setIsAddAttachment(false);
          setDataAttachment(null);
        }}
      />
    </div>
  );
}
