import React, { useState, Fragment } from "react";
import moment from "moment";
import CustomScrollbar from "components/customScrollbar";
import { IViewInfoWarrantyProps } from "model/warranty/PropsModel";
import AddTransferVotes from "pages/Common/AddTransferVotes";

import "./ViewInfoWarranty.scss";

export default function ViewInfoWarranty(props: IViewInfoWarrantyProps) {
  const { data, takeBlockRight, infoApproved, onReload } = props;

  const detailReceptionDepartment = [
    {
      className: "reception-department",
      title: "Bộ phận xử lý",
      name: data.departmentName ? data.departmentName : "",
    },
    {
      className: "employee-department",
      title: "Người tiếp nhận",
      name: data.employeeName ? data.employeeName : "",
    },
    {
      className: "treatment",
      title: "Cách xử lý",
      name: data.solution,
    },
    {
      className: "completion-time",
      title: "Ngày hoàn thành",
      name: moment(data.endDate).format("DD/MM/YYYY"),
    },
    {
      className: "note",
      title: "Ghi chú",
      name: data.note,
    },
    {
      className: `${
        !data.status
          ? "status-just"
          : data.status === 1
          ? "status-initial"
          : data.status === 2
          ? "status-success"
          : data.status === 4
          ? "status-pending"
          : "status-falid"
      }`,
      title: "Trạng thái",
      name: !data.status
        ? "Chưa thực hiện"
        : data.status === 1
        ? data.statusName
          ? data.statusName
          : "Đang thực hiện"
        : data.status === 2
        ? "Đã hoàn thành"
        : data.status === 4
        ? "Tạm dừng"
        : "Đã hủy",
    },
  ];

  const [showModalTransferVotes, setShowModalTransferVotes] = useState<boolean>(false);

  return (
    <Fragment>
      <CustomScrollbar width="36rem" height="68rem">
        <div className="view-info-warranty">
          <div className="basic-infor">
            <div className="title-info">Thông tin bộ phận tiếp nhận</div>

            <div className="detail-reception-department">
              {detailReceptionDepartment.map((item, idx) => (
                <div key={idx} className={`item ${item.className}`}>
                  <h4 className="title">{item.title}</h4>
                  <h4 className="name">{item.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {!infoApproved && (
            <div className="action__item" onClick={() => setShowModalTransferVotes(true)}>
              <span className="name--action">Thông tin bảo hành</span>
            </div>
          )}

          <div className="action__item" onClick={() => takeBlockRight(0)}>
            <span className="name--action">Thông tin trao đổi</span>
          </div>

          {infoApproved && (
            <Fragment>
              <div className="action__item" onClick={() => takeBlockRight(1)}>
                <span className="name--action">Lịch sử bảo hành</span>
              </div>

              <div className="action__item" onClick={() => takeBlockRight(2)}>
                <span className="name--action">Quy trình bảo hành</span>
              </div>
            </Fragment>
          )}
        </div>
      </CustomScrollbar>

      <AddTransferVotes
        onShow={showModalTransferVotes}
        onHide={(reload) => {
          if (reload) {
            onReload(true);
          }

          setShowModalTransferVotes(false);
        }}
        dataProps={{
          objectId: data?.id,
          objectType: 2,
        }}
        type="warranty"
      />
    </Fragment>
  );
}
