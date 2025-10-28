import React, { useEffect, useRef, useState } from 'react';
import FormViewerComponent from './FormViewer';
import FormEditorComponent from './FormEditor';

// const defaultSchema = {
//   "components": [
//     {
//       "text": "# Tạo Yêu Cầu Mua Sắm",
//       "label": "Text view",
//       "type": "text",
//       "layout": {
//         "row": "Row_09e8x5i",
//         "columns": null
//       },
//       "id": "Field_08tax9x"
//     },
//     {
//       "text": "1.Thông tin chung",
//       "label": "Text view",
//       "type": "text",
//       "layout": {
//         "row": "Row_155eg9j",
//         "columns": null
//       },
//       "id": "Field_1y1gdn3"
//     },
//     {
//       "label": "Gói Thầu",
//       "type": "textfield",
//       "layout": {
//         "row": "Row_09jr0x5",
//         "columns": null
//       },
//       "id": "Field_0u1tb1w",
//       "key": "biddingPackage",
//       "validate": {
//         "required": true
//       },
//       "disabled": false,
//       "readonly": false
//     },
//     {
//       "values": [
//         {
//           "label": "Gói thầu thi công",
//           "value": "1"
//         },
//         {
//           "label": "Gói thầu thiết kế",
//           "value": "2"
//         }
//       ],
//       "label": "Nhóm gói thầu",
//       "type": "select",
//       "layout": {
//         "row": "Row_028wh1p",
//         "columns": null
//       },
//       "id": "Field_1i9bka1",
//       "key": "biddingPackageGroup",
//       "validate": {
//         "required": true
//       },
//       "disabled": true
//     },
//     {
//       "label": "Dự án",
//       "type": "textfield",
//       "layout": {
//         "row": "Row_1h4oo1y",
//         "columns": null
//       },
//       "id": "Field_012h1gy",
//       "key": "project",
//       "validate": {
//         "required": true
//       }
//     },
//     {
//       "values": [
//         {
//           "label": "Value",
//           "value": "value"
//         }
//       ],
//       "label": "Nhóm Gói Thầu",
//       "type": "select",
//       "layout": {
//         "row": "Row_1q8w5lh",
//         "columns": null
//       },
//       "id": "Field_1nzpgal",
//       "key": "biddingPackageGrou",
//       "disabled": true,
//       "validate": {
//         "required": true
//       }
//     },
//     {
//       "values": [
//         {
//           "label": "Gói Thầu xây lắp",
//           "value": "1"
//         },
//         {
//           "label": "Gói thầu tư vấn",
//           "value": "2"
//         },
//         {
//           "label": "Gói thầu cung cấp thiết bị",
//           "value": "3"
//         },
//         {
//           "label": "Gói thầu thi công",
//           "value": "4"
//         },
//         {
//           "label": "Gói thầu hỗn hộp",
//           "value": "5"
//         },
//         {
//           "label": "Gói thầu duy tu,bảo trì",
//           "value": "6"
//         },
//         {
//           "label": "Gói thầu khảo sát",
//           "value": "7"
//         },
//         {
//           "label": "Gói thầu thiết kê",
//           "value": "8"
//         },
//         {
//           "label": "Gói thầu cung cấp vật liệu ",
//           "value": "9"
//         },
//         {
//           "label": "Gói thầu dịch vụ kĩ thuật",
//           "value": "10"
//         }
//       ],
//       "label": "Loại gói thầu",
//       "type": "select",
//       "layout": {
//         "row": "Row_1q8w5lh",
//         "columns": null
//       },
//       "id": "Field_16jq78v",
//       "key": "bidCategory",
//       "validate": {
//         "required": true
//       },
//       "searchable": false,
//       "disabled": false
//     },
//     {
//       "label": "Phí Dịch Vụ",
//       "type": "textfield",
//       "layout": {
//         "row": "Row_0gm3bxh",
//         "columns": null
//       },
//       "id": "Field_1qn9b68",
//       "key": "transactionFee"
//     },
//     {
//       "label": "Địa điểm",
//       "type": "textfield",
//       "layout": {
//         "row": "Row_0gm3bxh",
//         "columns": null
//       },
//       "id": "Field_1wqgd78",
//       "key": "location"
//     },
//     {
//       "label": "Giá trị gói thầu",
//       "type": "textfield",
//       "layout": {
//         "row": "Row_0e8taez",
//         "columns": null
//       },
//       "id": "Field_1i0kvp5",
//       "key": "bidValue"
//     },
//     {
//       "values": [
//         {
//           "label": "CTCP Xây Dựng Hòa Bình",
//           "value": "1"
//         },
//         {
//           "label": "Công Ty TNHH Xây Dựng Nam Việt",
//           "value": "2"
//         },
//         {
//           "label": "Tập Đoàn Xây Dựng Phương Nam",
//           "value": "3"
//         },
//         {
//           "label": "Công Ty CP Xây Lắp An Khánh",
//           "value": "4"
//         },
//         {
//           "label": "Công Ty TNHH Xây Dựng Thành Đạt",
//           "value": "5"
//         },
//         {
//           "label": "CTCP Xây Dựng Đại Phát",
//           "value": "6"
//         },
//         {
//           "label": "Công Ty TNHH Xây Dựng Phú Gia",
//           "value": "7"
//         },
//         {
//           "label": "Tập Đoàn Xây Dựng Bình An",
//           "value": "8"
//         },
//         {
//           "label": "Công Ty CP Xây Dựng Việt Hưng",
//           "value": "9"
//         },
//         {
//           "label": "Công Ty TNHH Xây Dựng Minh Phát",
//           "value": "10"
//         }
//       ],
//       "label": "Đơn vị chịu phí",
//       "type": "select",
//       "layout": {
//         "row": "Row_0e8taez",
//         "columns": null
//       },
//       "id": "Field_0usi7du",
//       "key": "ayer",
//       "validate": {
//         "required": true
//       },
//       "disabled": false
//     },
//     {
//       "values": [
//         {
//           "label": "CTCP TNTECH",
//           "value": "1"
//         },
//         {
//           "label": "CTCP Đầu tư và Phát triển BĐS TNR Holdings Việt Nam",
//           "value": "2"
//         },
//         {
//           "label": "CTCP Đầu tư và cho thuê tài sản TNL",
//           "value": "3"
//         },
//         {
//           "label": "Công ty TNHH Đầu tư và Quản lý Khách sạn TNH",
//           "value": "4"
//         },
//         {
//           "label": "ông ty CP Thương Mại Dịch Vụ TNS Holdings",
//           "value": "5"
//         }
//       ],
//       "label": "Đơn vị gửi yêu cầu",
//       "type": "select",
//       "layout": {
//         "row": "Row_0ll9vus",
//         "columns": null
//       },
//       "id": "Field_1mddvxw",
//       "key": "requestingUnit",
//       "validate": {
//         "required": true
//       },
//       "disabled": true
//     },
//     {
//       "subtype": "date",
//       "dateLabel": "Ngày Bắt Đầu",
//       "label": "Date time",
//       "type": "datetime",
//       "layout": {
//         "row": "Row_1jbae9a",
//         "columns": null
//       },
//       "id": "Field_0zxhubk",
//       "key": "startDate",
//       "validate": {
//         "required": true
//       }
//     },
//     {
//       "subtype": "date",
//       "dateLabel": "Ngày Hoàn Thành",
//       "label": "Date time",
//       "type": "datetime",
//       "layout": {
//         "row": "Row_1jbae9a",
//         "columns": null
//       },
//       "id": "Field_0pra5od",
//       "key": "finishDate",
//       "validate": {
//         "required": true
//       }
//     },
//     {
//       "label": "Các yêu cầu khác",
//       "type": "textarea",
//       "layout": {
//         "row": "Row_11mc5de",
//         "columns": null
//       },
//       "id": "Field_1pyq8b1",
//       "key": "otherRequest"
//     },
//     {
//       "text": "2.Các giấy tờ khác",
//       "label": "Text view",
//       "type": "text",
//       "layout": {
//         "row": "Row_10q6k0z",
//         "columns": null
//       },
//       "id": "Field_1denyrm"
//     },
//     {
//       "content": "",
//       "label": "HTML view",
//       "type": "html",
//       "layout": {
//         "row": "Row_0nskr8h",
//         "columns": null
//       },
//       "id": "Field_0nn2441"
//     },
//     {
//       "text": "# Phê duyệt",
//       "label": "Text view",
//       "type": "text",
//       "layout": {
//         "row": "Row_15a9kd7",
//         "columns": null
//       },
//       "id": "Field_1ubaq24"
//     },
//     {
//       "label": "",
//       "type": "table",
//       "layout": {
//         "row": "Row_1m1f5jz",
//         "columns": null
//       },
//       // "dataSource": "=Field_0sx4tjh",
//       "dataSource": [
//         {
//           "stt": 1,
//           "approved": "Đã duyệt",
//           "department": "Phòng Kế toán",
//           "approvedBy": "Nguyễn Văn A",
//           "action": "Chỉnh sửa"
//         },
//         {
//           "stt": 2,
//           "approved": "Chưa duyệt",
//           "department": "Phòng Nhân sự",
//           "approvedBy": "Trần Văn B",
//           "action": "Xóa"
//         }
//       ],
//       "rowCount": 10,
//       "id": "Field_0sx4tjh",
//       "columns": [
//         {
//           "key": "stt",
//           "label": "STT"
//         },
//         {
//           "label": "Phê duyệt",
//           "key": "approved"
//         },
//         {
//           "label": "Phòng/Ban",
//           "key": "department"
//         },
//         {
//           "label": "Người phê duyệt",
//           "key": "approvedBy"
//         },
//         {
//           "label": "Thao tác",
//           "key": "action"
//         }
//       ],
//     },
//     {
//       "action": "reset",
//       "label": "Lưu",
//       "type": "button",
//       "layout": {
//         "row": "Row_17jw7bj",
//         "columns": null
//       },
//       "id": "Field_0vr7t16"
//     },
//     {
//       "action": "submit",
//       "label": "Trình Duyệt",
//       "type": "button",
//       "layout": {
//         "row": "Row_17jw7bj",
//         "columns": null
//       },
//       "id": "Field_0owi1f0"
//     }
//   ],
//   "id": "taoYeuCauMuaSam",
//   "type": "default",
//   "schemaVersion": 16
// }

const defaultSchema = {
  "components": [
    {
      "text": "Đánh giá năng lực và kinh nghiệm nhà thầu\n",
      "label": "Text view",
      "type": "text",
      "layout": {
        "row": "Row_0dlgbin",
        "columns": null
      },
      "id": "Field_0j7ysxg"
    },
    {
      "components": [
        {
          "values": [
            {
              "label": "CTCP Xây dựng Coteccons",
              "value": "1"
            },
            {
              "label": "CTCP Tập đoàn Xây dựng Hòa Bình",
              "value": "2"
            },
            {
              "label": "CTCP Xuất nhập khẩu và Xây dựng Việt Nam",
              "value": "3"
            },
            {
              "label": "Tập đoàn Xây dựng Delta",
              "value": "4"
            },
            {
              "label": "CTCP Đầu tư Xây dựng Unicons",
              "value": "5"
            }
          ],
          "label": "Tên nhà thầu",
          "type": "select",
          "layout": {
            "row": "Row_1a2n80w",
            "columns": null
          },
          "id": "Field_1cq0wpk",
          "key": "name1",
          "disabled": false
        },
        {
          "values": [
            {
              "label": "Giấy phép, danh mục phạm vi hoạt động kinh doanh phù hợp",
              "value": "1"
            },
            {
              "label": "Chứng chỉ hoạt động",
              "value": "2"
            },
            {
              "label": "Chứng chỉ hoạt động tư vấn",
              "value": "3"
            }
          ],
          "label": "Năng lực kinh doanh",
          "type": "select",
          "layout": {
            "row": "Row_115oaew",
            "columns": null
          },
          "id": "Field_08gzipd",
          "key": "businessCapibility",
          "searchable": false,
          "disabled": false
        },
        {
          "values": [
            {
              "label": "Mức độ 1",
              "value": "1"
            },
            {
              "label": "Mức độ 2",
              "value": "2"
            },
            {
              "label": "Mức độ 3",
              "value": "3"
            }
          ],
          "label": "Yêu cầu tối thiểu để được đánh giá là đáp ứng (đạt)",
          "type": "select",
          "layout": {
            "row": "Row_115oaew",
            "columns": null
          },
          "id": "Field_1n5ngv1",
          "key": "level",
          "disabled": false
        },
        {
          "values": [
            {
              "label": "Đạt",
              "value": "1"
            },
            {
              "label": "Không Đạt",
              "value": "2"
            }
          ],
          "label": "Đánh giá",
          "type": "select",
          "layout": {
            "row": "Row_115oaew",
            "columns": null
          },
          "id": "Field_0f7iquj",
          "key": "review"
        },
        {
          "label": "Ghi chú",
          "type": "textfield",
          "layout": {
            "row": "Row_115oaew",
            "columns": null
          },
          "id": "Field_1gw15lz",
          "key": "note"
        }
      ],
      "showOutline": true,
      "isRepeating": true,
      "allowAddRemove": true,
      "defaultRepetitions": 1,
      "label": "Năng lực kinh doanh",
      "type": "dynamiclist",
      "layout": {
        "row": "Row_0orv8rt",
        "columns": null
      },
      "id": "Field_0363qnw",
      "path": "dynamiclist1"
    },
    {
      "components": [
        {
          "values": [
            {
              "label": "CTCP Xây dựng Coteccons",
              "value": "1"
            },
            {
              "label": "CTCP Tập đoàn Xây dựng Hòa Bình",
              "value": "2"
            },
            {
              "label": "Tổng CTCP Xuất nhập khẩu và Xây dựng Việt Nam",
              "value": "3"
            },
            {
              "label": "CTCP Tập đoàn Xây dựng Delta",
              "value": "4"
            },
            {
              "label": "CTCP Đầu tư Xây dựng Unicons",
              "value": "5"
            }
          ],
          "label": "Tên nhà thầu",
          "type": "select",
          "layout": {
            "row": "Row_1taszfw",
            "columns": null
          },
          "id": "Field_12jx6a9",
          "key": "name2",
          "disabled": false
        },
        {
          "values": [
            {
              "label": "Mức độ 1",
              "value": "1"
            },
            {
              "label": "Mức độ 2",
              "value": "2"
            },
            {
              "label": "Mức độ 3",
              "value": "3"
            }
          ],
          "label": "Yêu cầu tối thiểu để được đánh giá là đáp ứng (đạt)",
          "type": "select",
          "layout": {
            "row": "Row_1taszfw",
            "columns": null
          },
          "id": "Field_0pl5kx0",
          "key": "level",
          "disabled": false
        },
        {
          "values": [
            {
              "label": "Đạt",
              "value": "0"
            },
            {
              "label": "Không đạt",
              "value": "value2"
            }
          ],
          "label": "Đánh giá",
          "type": "select",
          "layout": {
            "row": "Row_1taszfw",
            "columns": null
          },
          "id": "Field_10ue04e",
          "key": "review",
          "disabled": false
        },
        {
          "label": "Ghi chú",
          "type": "textfield",
          "layout": {
            "row": "Row_1taszfw",
            "columns": null
          },
          "id": "Field_0uqfutb",
          "key": "note"
        }
      ],
      "showOutline": true,
      "isRepeating": true,
      "allowAddRemove": true,
      "defaultRepetitions": 1,
      "label": "Năng lực kinh nghiệm",
      "type": "dynamiclist",
      "layout": {
        "row": "Row_1hxbbzh",
        "columns": null
      },
      "id": "Field_1035q4z",
      "path": "dynamiclist2"
    },
    {
      "action": "submit",
      "label": "Trình Duyệt",
      "type": "button",
      "layout": {
        "row": "Row_17jw7bj",
        "columns": null
      },
      "id": "Field_0owi1f0"
    }
  ],
  "id": "thongNhatTieuChiDanhGiaVaDanhGia",
  "type": "default",
  "schemaVersion": 16
}


const BpmForm = () => {
  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [dataInit, setDataInit] = useState({ "bidValue": "2000000", "location": "An Giang", "email": "", "phone": "", "cardId": "", "gender": "male", "income": null, "salary": null, "birthday": "1987-10-01", "jobTitle": "", "cardPlace": "", "cardIssued": null, "ownedAsset": "", "companyName": "", "companyPhone": "", "workDuration": "", "livingExpense": null, "number_jpy2he": null, "number_ls2rdw": null, "companyAddress": "", "pernamentAddress": "", "textfield_1tfpx7": "", "textfield_8lze3f": "", "textfield_ckftxf": "" });

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaChange = (newSchema) => {
    setFormSchema(newSchema); // Cập nhật schema mới
    console.log('Schema mới:', newSchema);
  };


  return (
    <div>
      <h1>Cấu hình biểu mẫu</h1>

      {/* Form Viewer để hiển thị form */}
      <FormViewerComponent formSchema={formSchema}
        onSchemaSubmit={(data) => console.log(data)}
        dataInit={dataInit}
        contextData={null}
      />

      {/* Form Editor để chỉnh sửa form */}
      {/* <FormEditorComponent 
        initialSchema={formSchema} 
        onSchemaChange={handleSchemaChange}         
        callback = {() => {}}
      /> */}
    </div>
  );
};

export default BpmForm;