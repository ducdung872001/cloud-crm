import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import "./MembershipClass.scss";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "@/components/icon";
import Button from "@/components/button/button";
import { DataPaginationDefault, PaginationProps } from "@/components/pagination/pagination";
import { IRoyaltyFilterRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltySegmentResposne } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import { formatCurrency, showToast } from "@/utils/common";
import Tippy from "@tippyjs/react";
import AddLoyaltySegmentModal from "./AddLoyaltySegmentModal";
import Dialog, { IContentDialog } from "@/components/dialog/dialog";

export default function MembershipClass(props) {
  document.title = "Hạng thành viên";
  const { onBackProps } = props;
  const isMounted = useRef(false);

  const [listData, setListData] = useState<ILoyaltySegmentResposne[]>([]);
  const [params, setParams] = useState<IRoyaltyFilterRequest>({ name: "", limit: 10 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ILoyaltySegmentResposne>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const getType = (point) => {    
    switch (true) {
        case point <= 300:
            return {
                icon: "🥉",
                rate: '1%',
                member: 1200,
                desList: [
                    "Tích 1% điểm thưởng",
                    "Giảm 5% sinh nhật",
                    "Ưu tiên hỗ trợ"
                ],
                borderColor: "#fed7aa",
                backgroundColor: "linear-gradient(to right, #fb923c, #f59e0b)",
            }
        case  point > 300 && point <= 500:
            return {
              icon: "🥈",
              rate: "1.5%",
              member: 1500,
              desList: [
                "Tích 1.5% điểm",
                "Giảm 10% sinh nhật",
                "Freeship 2 đơn/tháng",
                "Quà tặng hàng tháng"
              ],
              borderColor: "#e2e8f0",
              backgroundColor: "linear-gradient(to right, #94a3b8, #64748b)"
            }
        case point > 500 && point <= 1000:
            return {
                icon: "🥇",
                rate: '3%',
                member: 1400,
                desList: [
                    "Tích 3% điểm",
                    "Giảm 15% sinh nhật",
                    "Freeship không giới hạn",
                    "Quà tặng premium",
                    "Truy cập sale sớm"
                ],
                borderColor: "#fef08a",
                backgroundColor: "linear-gradient(to right, #facc15, #f59e0b)"
            }
        case point > 1000:
            return {
                icon: "💎",
                rate: '10%',
                member: 900,
                desList: [
                    "Tích 3% điểm",
                    "Giảm 20% sinh nhật",
                    "Freeship không giới hạn",
                    "Quà premium",
                    "CSKH riêng 24/7",
                    "Sản phẩm mới sớm"
                ],
                borderColor: "#a5f3fc",
                backgroundColor: "linear-gradient(to right, #22d3ee, #0ea5e9)"
            }
      }
  }

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hạng hội viên",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const fetchList = async (paramsSearch: IRoyaltyFilterRequest) => {
    setIsLoading(true);
    const response = await LoyaltyService.listLoyaltySegment(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      const data = (result?.items || []).map(item => {
        return {
            ...item,
            ...getType(item.point)
        }
      })
      setListData(data ?? []);
      setPagination((prev) => ({
        ...prev,
        page: +result.page,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      if (+result.total === 0 && +result.page === 1) setIsNoItem(true);
    } else if (response.code === 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => { setParams((prev) => ({ ...prev })); }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchList(params);
    return () => { abortController.abort(); };
  }, [params]);


  const onDelete = async (id: number) => {
    const response = await LoyaltyService.deleteLoyaltySegment(id);
    if (response.code === 0) {
      showToast("Xóa hạng hội viên thành công", "success");
      fetchList(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ILoyaltySegmentResposne) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa hạng hội viên</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa hạng <strong>{item.name}</strong> ?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) { onDelete(item.id); return; }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <div className={`page-content page-membership-class`}>
        <HeaderTabMenu
          title="Hạng thành viên"
          titleBack="Khách hàng thành viên"
          onBackProps={onBackProps}
        //   titleActions={titleActions}
        />

        <div className="container-header">
            <div className="title-header">
                <h1>Hạng thành viên</h1>
                <span style={{fontSize: 14, fontWeight: '500', color: 'rgb(100 116 139 / var(--tw-text-opacity, 1))'}}>Cấu hình hạng và quyền lợi thành viên</span>
            </div>

            <div>
                <Button 
                    type="button" 
                    onClick={() => { 
                        setSelectedItem(null); 
                        setShowModalAdd(true); 
                    }}
                >
                    {/* <Icon name="Plus" style={{width: '1.2rem', height: '1.2rem'}}/> */}
                    Thêm mới
                </Button>
            </div>
        </div>

        {listData && listData.length > 0 ? 
            <div className="package-list">
                {listData.map((item, index) => (
                    <div key={index} className="package-item" style={{borderColor: item.borderColor}}>
                        <div className="header-item" style={{background: item.backgroundColor}}>
                            <div style={{fontSize: 35}}>{item.icon}</div>
                            <h3 style={{fontWeight: '700', fontSize: 18, color: '#FFFFFF'}}>{item.name}</h3>
                            <span style={{fontWeight: '500', fontSize: 14, color: '#FFFFFF'}}>{formatCurrency(item.member, ",", "")} thành viên</span>
                        </div>

                        <div className="body-item">
                            <div>
                                <p style={{fontSize: 14, color: '#94a3b8', fontWeight: '500'}}>Chỉ tiêu yêu cầu</p>
                                <p style={{fontSize: 16, fontWeight: '500'}}>{formatCurrency(item.point, ",", "")}</p>
                            </div>
                            <div style={{marginTop: '1rem'}}>
                                <p style={{fontSize: 14, color: '#94a3b8', fontWeight: '500'}}>Tỷ lệ tích điểm</p>
                                <p style={{fontSize: 20, color: '#f97316', fontWeight: '800'}}>{item.rate}</p>
                            </div>

                            {item.desList && item.desList.length > 0 ? 
                                <div style={{marginTop: '1rem'}}>
                                    {item.desList.map((el, idx) => (
                                        <p key={idx} style={{fontSize: 14, fontWeight: '400'}}><span style={{color: "#10b981", fontWeight: '700'}}>✓</span> {el}</p>
                                    ))}                                    
                                </div>
                             : null }
                        </div>

                        <div className="footer-item">
                            <Tippy content="Sửa">
                                <div onClick={() => {
                                    setSelectedItem(item); 
                                    setShowModalAdd(true);
                                }}>
                                    <Icon name="Pencil" style={{width: 17, fill: 'var(--primary-color)'}}/>
                                </div>
                            </Tippy>
                            <Tippy content="Xoá">
                                <div
                                    onClick={() => showDialogConfirmDelete(item)}
                                >
                                    <Icon name="Trash" style={{width: 19, fill: "var(--error-darker-color)"}}/>
                                </div>
                            </Tippy>
                        </div>
                    </div>
                ))}
            </div>
        : null}
      </div>

      <AddLoyaltySegmentModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(reload) => { if (reload) fetchList(params); setShowModalAdd(false); }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
      
    </Fragment>
  );
}
