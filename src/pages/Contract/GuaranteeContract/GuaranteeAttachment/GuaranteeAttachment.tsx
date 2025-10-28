import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertToId, formatCurrency, getPageOffset, getSearchParameters, isDifferenceObj } from "reborn-util";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./GuaranteeAttachment.scss";
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
import ModalAddAttachment from "./partials/ModalAddAttachment";
import GuaranteeAttachmentService from "services/GuaranteeAttachmentService";

export default function GuaranteeAttachment(props: any) {
  const { guaranteeId } = props;
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState([]);
  const [dataAttachment, setDataAttachment] = useState(null);

  const [isAddAttachment, setIsAddAttachment] = useState(false);

  const [params, setParams] = useState({
    keyword: "",
    limit: 10,
  });

  useEffect(() => {
    if (guaranteeId) {
      setParams((preState) => ({ ...preState, guaranteeId: guaranteeId }));
    }
  }, [guaranteeId]);

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

    const response = await GuaranteeAttachmentService.guaranteeAttachmentList(paramsSearch);

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
    return [
      {
        title: "Tải xuống",
        icon: <Icon name="Download" />,
        callback: () => {
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
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataAttachment(item);
          setIsAddAttachment(true);
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
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await GuaranteeAttachmentService.guaranteeAttachmentDelete(item.id);
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
            // listIdChecked={listIdChecked}
            isBulkAction={true}
            // bulkActionItems={bulkActionList}
            striped={true}
            // setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <SystemNotification description={<span>Hiện tại chưa có tài liệu nào.</span>} type="no-item" />
        )}
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />

      <ModalAddAttachment
        onShow={isAddAttachment}
        data={dataAttachment}
        guaranteeId={guaranteeId}
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
