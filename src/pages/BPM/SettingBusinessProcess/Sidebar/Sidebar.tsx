import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import Icon from "components/icon";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.scss";
export default (props) => {
  const { onSubmit, statusMA } = props;

  const navigate = useNavigate();
  const onDragStart = (event, nodeType, label, code, type) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("label", label);
    event.dataTransfer.setData("code", code);
    event.dataTransfer.setData("type", type);
    event.dataTransfer.effectAllowed = "move";
  };

  // const conditionData = [
  //   {
  //     title:'Điều kiện cho Email',
  //     actionList: [
  //       {
  //         label: 'Gửi Email cho khách hàng'
  //       },
  //     ]
  //   },
  //   {
  //     title:'Điều kiện cho SMS',
  //     actionList: [
  //       {
  //         label: 'Gửi SMS cho khách hàng'
  //       },
  //     ]
  //   },
  //   {
  //     title:'Điều kiện cho Zalo',
  //     actionList: [
  //       {
  //         label: 'Gửi Zalo cho khách hàng'
  //       },
  //     ]
  //   },
  //   {
  //     title:'Điều kiện cho Call',
  //     actionList: [
  //       {
  //         label: 'Gọi điện cho khách hàng'
  //       },
  //     ]
  //   },
  //   // {
  //   //   title:'Theo hành động',
  //   //   actionList: [
  //   //     {
  //   //       label: 'Gửi Email cho khách hàng'
  //   //     },
  //   //   ]
  //   // },

  //   {
  //     title:'Điều kiện về Thời gian',
  //     actionList: [
  //       {
  //         label: 'Sinh nhật khách hàng'
  //       },
  //       {
  //         label: 'Sinh nhật nhân viên'
  //       },
  //     ]
  //   },

  // ]

  const conditionData = [
    {
      label: "Bắt đầu",
      code: "start",
      type: "condition",
    },
    {
      label: "Thực hiện",
      code: "do",
      type: "condition",
    },
    {
      label: "Điều kiện",
      code: "condition",
      type: "condition",
    },
    {
      label: "Kết thúc",
      code: "done",
      type: "condition",
    },
  ];

  const actionData = [
    {
      label: "Gửi Email",
      code: "send_email",
      type: "action",
    },
    {
      label: "Gửi SMS",
      code: "send_sms",
      type: "action",
    },
    {
      label: "Gửi Zalo",
      code: "send_zalo",
      type: "action",
    },
    {
      label: "Gọi tự động",
      code: "call_auto",
      type: "action",
    },
    {
      label: "Đẩy vào CDBH",
      code: "campaign_sale",
      type: "action",
    },
    {
      label: "Gọi API",
      code: "call_api",
      type: "action",
    },
  ];

  const [isShowCondition, setIsShowCondition] = useState(false);
  const [isShowAction, setIsShowAction] = useState(false);

  return (
    <aside>
      <div className="condtion-sidebar">
        {/* <div
          className="title-click"
          onClick={() => {
            setIsShowCondition(!isShowCondition);
            setIsShowAction(false);
          }}
        >
          <span className="name">Điều kiện</span>
        </div> */}

        {/* {isShowCondition && ( */}
        <div className="list-condition">
          {/* {conditionData.map((item, idx) => (
              <div key={idx} >
                <div style={{marginBottom: 5}}>
                  <span className='condition-title'>{item.title}</span>
                </div>
                {item.actionList?.map((el, index) => (
                  <div className='conditon-child' key={index} onDragStart={(event) => onDragStart(event, 'input', el.label)} draggable>
                    <span className='condition-label'>{el.label}</span>
                  </div>
                ))}
              </div>
            ))} */}
          {conditionData.map((el, index) => (
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {el.code === "start" ? (
                <div
                  className={"action_start"}
                  key={index}
                  onDragStart={(event) => onDragStart(event, "default", el.label, el.code, el.type)}
                  draggable={statusMA === 1 ? false : true}
                >
                  <span className="condition-label">{el.label}</span>
                </div>
              ) : null}

              {el.code === "do" ? (
                <div
                  className={"action-do"}
                  key={index}
                  onDragStart={(event) => onDragStart(event, "default", el.label, el.code, el.type)}
                  draggable={statusMA === 1 ? false : true}
                >
                  <span className="condition-label">{el.label}</span>
                </div>
              ) : null}

              {el.code === "condition" ? (
                <div
                  className={"action-condition"}
                  key={index}
                  onDragStart={(event) => onDragStart(event, "default", el.label, el.code, el.type)}
                  draggable={statusMA === 1 ? false : true}
                >
                  <span className="condition-label">{el.label}</span>
                </div>
              ) : null}

              {el.code === "done" ? (
                <div
                  className={"action-done"}
                  key={index}
                  onDragStart={(event) => onDragStart(event, "default", el.label, el.code, el.type)}
                  draggable={statusMA === 1 ? false : true}
                >
                  <span className="condition-label">{el.label}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {/* )} */}
      </div>
      {/* 
      <div className="condtion-sidebar">
        <div
          className="title-click"
          onClick={() => {
            setIsShowAction(!isShowAction);
            setIsShowCondition(false);
          }}
        >
          <span className="name">Hành động</span>
        </div>

        <div className="list-condition">
          {actionData.map((item, idx) => (
            item.code === 'campaign_sale' ? 
            <Tippy content="Đẩy vào chiến dịch bán hàng">
              <div 
                className={statusMA === 1 ? "action-child-disable" : "action-child" }
                key={idx} 
                onDragStart={(event) => onDragStart(event, "default", item.label, item.code, item.type)} 
                draggable={statusMA === 1 ? false : true}
              >
                <span className="action-label">{item.label}</span>
              </div>
            </Tippy>
            :
            <div 
              className={statusMA === 1 ? "action-child-disable" : "action-child" }
              key={idx} 
              onDragStart={(event) => onDragStart(event, "default", item.label, item.code, item.type)} 
              draggable={statusMA === 1 ? false : true}
            >
              <span className="action-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div> */}

      <div style={{ display: "flex", alignItems: "center", gap: "0 1rem", justifyContent: "flex-end" }}>
        <Button
          color="primary"
          variant="outline"
          onClick={(e) => {
            navigate(`/manage_processes`);
          }}
        >
          Quay lại
        </Button>
        {/* <Button
          color="primary"
          onClick={(e) => {
            onSubmit();
          }}
        >
          Lưu
        </Button> */}
      </div>

      {/* <div className="description">You can drag these nodes to the pane on the right.</div> */}
      {/* <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'dd')} draggable>
        Gửi Email cho khách hàng
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Khách hàng đọc Email
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Người đọc click link trong Email
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Khách hàng lần đầu vào CRM
      </div> */}
    </aside>
  );
};
