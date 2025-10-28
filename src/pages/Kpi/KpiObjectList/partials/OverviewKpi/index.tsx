import React, { Fragment, useState } from "react";
import { Chart } from "react-google-charts";
import { formatCurrency } from "reborn-util";
import Icon from "components/icon";
import "./index.scss";

export default function OverViewKpi() {
  const fakeDataKpi = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối hỗ trợ",
        f: `Khối hỗ trợ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">500,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">500,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng bảo vệ",
        f: `Phòng bảo vệ<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">50,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">50,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
    [
      {
        v: "Phòng chăm sóc khách hàng",
        f: `Phòng chăm sóc khách hàng<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">70,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">70,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
    [
      {
        v: "Phòng công nghệ thông tin",
        f: `Phòng công nghệ thông tin<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">380,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">380,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],

    [
      {
        v: "Khối kinh doanh",
        f: `Khối kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,200,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,200,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng kinh doanh",
        f: `Phòng kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],
    [
      {
        v: "Phòng marketing",
        f: `Phòng marketing<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],

    [
      {
        v: "Khối sản xuất",
        f: `Khối sản xuất<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,300,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,300,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng kỹ thuật - bác sĩ",
        f: `Phòng kỹ thuật - bác sĩ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,300,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,300,000,000</span>
              </div>
            </div>`,
      },
      "Khối sản xuất",
      "",
    ],
  ];

  const dataSupport = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối hỗ trợ",
        f: `Khối hỗ trợ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">500,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">500,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng bảo vệ",
        f: `Phòng bảo vệ<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">50,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">50,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
    [
      {
        v: "Phòng chăm sóc khách hàng",
        f: `Phòng chăm sóc khách hàng<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">70,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">70,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
    [
      {
        v: "Phòng công nghệ thông tin",
        f: `Phòng công nghệ thông tin<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">380,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">380,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
  ];

  const dataBusiness = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối kinh doanh",
        f: `Khối kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,200,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,200,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng kinh doanh",
        f: `Phòng kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],
    [
      {
        v: "Phòng marketing",
        f: `Phòng marketing<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],
  ];

  const dataManufacture = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối sản xuất",
        f: `Khối sản xuất<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,300,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,300,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng kỹ thuật - bác sĩ",
        f: `Phòng kỹ thuật - bác sĩ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,300,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,300,000,000</span>
              </div>
            </div>`,
      },
      "Khối sản xuất",
      "",
    ],
  ];

  const dataProtect = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối hỗ trợ",
        f: `Khối hỗ trợ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">500,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">500,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng bảo vệ",
        f: `Phòng bảo vệ<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">50,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">50,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
  ];

  const dataCareCustomer = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối hỗ trợ",
        f: `Khối hỗ trợ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">500,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">500,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng chăm sóc khách hàng",
        f: `Phòng chăm sóc khách hàng<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">70,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">70,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
  ];

  const dataIT = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối hỗ trợ",
        f: `Khối hỗ trợ<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">500,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">500,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng công nghệ thông tin",
        f: `Phòng công nghệ thông tin<div class='box__money--kpi'>
               <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">380,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">380,000,000</span>
              </div>
            </div>`,
      },
      "Khối hỗ trợ",
      "",
    ],
  ];

  const dataBusinessDepartment = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối kinh doanh",
        f: `Khối kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,200,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,200,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng kinh doanh",
        f: `Phòng kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],
  ];

  const dataMarketting = [
    ["Name", "Manager", "ToolTip"], // Data này hoạt động như sau: đầu tiên là tên, thứ 2 ai là người quản lý, thứ 3 là ghi chú

    [
      {
        v: "Ban lãnh đạo",
        f: `Ban lãnh đạo<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">3,000,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">3,000,000,000</span>
              </div>
            </div>`,
      },
      "",
      "",
    ],

    [
      {
        v: "Khối kinh doanh",
        f: `Khối kinh doanh<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">1,200,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">1,200,000,000</span>
              </div>
            </div>`,
      },
      "Ban lãnh đạo",
      "",
    ],
    [
      {
        v: "Phòng marketing",
        f: `Phòng marketing<div class='box__money--kpi'>
              <div class="money-item">
                <span class="key">
                 Kế hoạch
                </span>
                <span class="value">600,000,000</span>
              </div>

              <div class="money-item">
                <span class="key">
                  Thực hiện
                </span>
                <span class="value">600,000,000</span>
              </div>
            </div>`,
      },
      "Khối kinh doanh",
      "",
    ],
  ];

  const options = {
    allowHtml: true,
    allowCollapse: false, // đoạn này dùng để click 2 lần thì ẩn đi row con
    size: "medium", // kích thức chart ==> 'small' || 'medium' || 'large'
  };

  const [dataKpi, setDataKpi] = useState(null);
  const [dataChidren, setDataChidren] = useState(null);
  const [isCheckChidren, setIsCheckChidren] = useState<boolean>(false);

  const handleSelect = ({ chartWrapper }) => {
    const selection = chartWrapper.getChart().getSelection();

    if (selection.length > 0) {
      const selectedNode: any = fakeDataKpi[selection[0].row + 1];
      selectedNode[0].v !== "Ban lãnh đạo" && setDataKpi(selectedNode);
    }
  };

  const chartEvents = [
    {
      eventName: "select" as const,
      callback: handleSelect as any,
    },
  ];

  const handleSelectChildren = ({ chartWrapper }) => {
    const selection = chartWrapper.getChart().getSelection();

    if (selection.length > 0) {
      const selectedNode: any = fakeDataKpi[selection[0].row + 1];
      console.log("selectedNode : ", selectedNode);

      if (selectedNode[0].v !== "Khối hỗ trợ" && selectedNode[0].v !== "Khối kinh doanh" && selectedNode[0].v !== "Khối sản xuất") {
        setDataChidren(selectedNode);
        setIsCheckChidren(true);
      }
    }
  };

  const chartEventsChildren = [
    {
      eventName: "select" as const,
      callback: handleSelectChildren as any,
    },
  ];

  const viewOptionTable = (name: string, paterName: string) => {
    return (
      <div className="view__option--table">
        <span className="name_level">Chi tiết {name.toLowerCase()}</span>
        <table className="table__option">
          <thead>
            <tr>
              <th>{name}</th>
              <th>Phun xăm mày 3D</th>
              <th>Trẻ hóa da combo</th>
              <th>Gội đầu dưỡng sinh</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="name">Chỉ tiêu nhận</span>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{paterName}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">15,000,000</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{paterName}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">480,000,000</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{paterName}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">5,000,000</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span className="name">Chỉ tiêu giao xuống</span>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{name}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">15,000,000</span>
                  </div>
                  <div className="perform-money">
                    <span className="key">Thực hiện</span>
                    <span className="value">15,000,000</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{name}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">480,000,000</span>
                  </div>
                  <div className="perform-money">
                    <span className="key">Thực hiện</span>
                    <span className="value">480,000,000</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="receiving__target">
                  <div className="delivery__unit">
                    <span className="key">Đơn vị giao</span>
                    <span className="value">{name}</span>
                  </div>
                  <div className="plan-money">
                    <span className="key">Kế hoạch</span>
                    <span className="value">5,000,000</span>
                  </div>
                  <div className="perform-money">
                    <span className="key">Thực hiện</span>
                    <span className="value">5,000,000</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page__over-view-kpi">
      {!dataKpi && <Chart chartType="OrgChart" data={fakeDataKpi} options={options} chartEvents={chartEvents} className="chart__view--kpi" />}

      {dataKpi && !isCheckChidren && (
        <div className="view__detail--department--kpi">
          <span
            className="action_backup"
            onClick={() => {
              setDataKpi(null);
            }}
          >
            <Icon name="ChevronLeft" />
            Quay lại
          </span>

          {dataKpi[0].v === "Khối hỗ trợ" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataSupport} options={options} chartEvents={chartEventsChildren} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Phòng bảo vệ" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataProtect} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Phòng chăm sóc khách hàng" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataCareCustomer} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Phòng công nghệ thông tin" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataIT} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Khối kinh doanh" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataBusiness} options={options} chartEvents={chartEventsChildren} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Phòng kinh doanh" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataBusinessDepartment} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Phòng marketing" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataMarketting} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataKpi[0].v, dataKpi[1])}
            </Fragment>
          )}

          {dataKpi[0].v === "Khối sản xuất" ||
            (dataKpi[0].v === "Phòng kỹ thuật - bác sĩ" && (
              <Fragment>
                <Chart chartType="OrgChart" data={dataManufacture} options={options} chartEvents={chartEventsChildren} className="chart__view--kpi" />
                {viewOptionTable(dataKpi[0].v, dataKpi[1])}
              </Fragment>
            ))}
        </div>
      )}

      {dataChidren && (
        <div className="view__detail--department--kpi">
          <span
            className="action_backup"
            onClick={() => {
              setDataChidren(null);
              setIsCheckChidren(false);
            }}
          >
            <Icon name="ChevronLeft" />
            Quay lại
          </span>

          {dataChidren[0].v === "Phòng bảo vệ" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataProtect} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataChidren[0].v, dataChidren[1])}
            </Fragment>
          )}

          {dataChidren[0].v === "Phòng chăm sóc khách hàng" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataCareCustomer} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataChidren[0].v, dataChidren[1])}
            </Fragment>
          )}

          {dataChidren[0].v === "Phòng công nghệ thông tin" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataIT} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataChidren[0].v, dataChidren[1])}
            </Fragment>
          )}

          {dataChidren[0].v === "Phòng kinh doanh" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataBusinessDepartment} options={options} className="chart__view--kpi" />
              {viewOptionTable(dataChidren[0].v, dataChidren[1])}
            </Fragment>
          )}

          {dataChidren[0].v === "Phòng kỹ thuật - bác sĩ" && (
            <Fragment>
              <Chart chartType="OrgChart" data={dataManufacture} options={options} chartEvents={chartEventsChildren} className="chart__view--kpi" />
              {viewOptionTable(dataChidren[0].v, dataChidren[1])}
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
}
