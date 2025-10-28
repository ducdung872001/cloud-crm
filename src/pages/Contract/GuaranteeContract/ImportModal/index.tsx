import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import Tippy from "@tippyjs/react";
import { IAction, IActionModal } from "model/OtherModel";
import { IAutoProcessModalProps } from "model/customer/CustomerRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Checkbox from "components/checkbox/checkbox";
import NummericInput from "components/input/numericInput";
import RadioList from "components/radio/radioList";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import { useOnClickOutside } from "utils/hookCustom";
import Button from "components/button/button";
import "./index.scss";
import ContractGuaranteeService from "services/ContractGuaranteeService";

interface IImportModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  code?: string;
  name: string;
  type?: "customer" | "partner";
}

export default function ImportModal(props: IImportModalProps) {
  const { onShow, onHide, name, code, } = props;

  const defaultStep = {
    stepOne: true,
    stepTwo: false,
    stepThree: false,
  };

  const [addFile, setAddFile] = useState<string>("");
  const [prevAddFile, setPrevAddFile] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [infoFile, setInfoFile] = useState(null);
  const [showProgress, setShowProgress] = useState(0);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [step, setStep] = useState(defaultStep);
  const [lstData, setLstData] = useState([]);
  const [idData, setIdData] = useState<number>(null);
  const [dataDuplicate, setDataDuplicate] = useState(null);
  const [showModalCustomer, setShowModalCustomer] = useState<boolean>(false);

  const [typeContract, setTypeContract] = useState("1");

  const [lstTypeContract] = useState([
    {
      value: "1",
      label: "Hợp đồng khách hàng",
    },
    {
      value: "0",
      label: "Hợp đồng đối tác",
    },
  ]);

  // const [exampleFile] = useState<string>(() => {
  //   //TODO: đoạn này sau không cần thì xóa đi
  //   if (type !== "customer" && type !== "partner") {
  //     return "https://cdn.reborn.vn/2024/01/02/885a4307-b65d-4b8f-91c6-6e5bce8f6195-1704205902.xlsx";
  //   }
  // });

  useEffect(() => {
    if (addFile !== prevAddFile) {
      setPrevAddFile(addFile);
    }
  }, [addFile, prevAddFile]);

  const lstOptionMechanismBug = [
    {
      value: "ignore",
      label: "Bỏ qua lỗi và tiếp tục",
    },
    {
      value: "stop",
      label: "Gặp lỗi dừng chương trình",
    },
  ];

  const lstOptionMechanismDuplicate = [
    {
      value: "override",
      label: "Ghi đè dữ liệu cũ",
    },
    {
      value: "ignore",
      label: "Bỏ qua dữ liệu trùng lặp",
    },
    {
      value: "merge",
      label: "Trộn hai kết quả",
    },
    {
      value: "manual",
      label: "Xử lý thủ công",
    },
  ];

  const defaultFormData = {
    uploadId: null,
    fileName: "",
    processErrorCode: "ignore",
    processDuplicateCode: "override",
  };

  const [formData, setFormData] = useState<IAutoProcessModalProps>(defaultFormData);

  useEffect(() => {
    if (infoFile) {
      setFormData({ ...formData, uploadId: infoFile.uploadId });
    } else {
      setFormData({ ...formData, uploadId: null });
    }
  }, [infoFile]);

  useEffect(() => {
    if (infoFile?.data) {
      setLstData(infoFile.data);
    } else {
      setLstData([]);
    }
  }, [infoFile]);

  const takeFileAdd = (data) => {
    if (data) {
      setAddFile(data);
    }
  };

  const handConfirmUploadFile = (data, parmas) => {
    if (!data) return;
    setIsSubmit(true);
    uploadDocumentFormData(data, onSuccess, onError, onProgress, 'guarantee', +parmas);
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    setIsLoadingFile(true);

    if (data) {
      setInfoFile(data);
    }

    setTimeout(() => {
      setIsSubmit(false);
      setIsLoadingFile(false);
      setStep({ ...step, stepOne: false, stepTwo: true });
    }, 800);
  };

  const onError = (message) => {
    setIsSubmit(false);
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

    const onProgress = (percent) => {    
      if (percent) {
        setShowProgress(percent.toFixed(0));
        // if (percent = 100) {
        //   setShowProgress(0);
        // }
      }
    };
  

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body: IAutoProcessModalProps = {
      ...(formData as IAutoProcessModalProps),
    };

    const response = await ContractGuaranteeService.autoProcess(body);

    if (response.code === 0) {
      setInfoFile(response.result);
      setStep({ stepOne: false, stepTwo: false, stepThree: true });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  };

  const handDownloadFileError = async () => {
    if (!infoFile.uploadId) return;

    const response = await ContractGuaranteeService.downloadFile(infoFile.uploadId);
   
    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `file_error_guarantee.xlsx`;
      link.click();
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handDownloadFileSample = (file) => {
    if (!file) return;

    // Tạo đối tượng XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // Mở kết nối với đường dẫn URL
    xhr.open("GET", file, true);

    // Đặt kiểu dữ liệu trả về là blob
    xhr.responseType = "blob";

    // Xử lý sự kiện khi yêu cầu đã hoàn thành
    xhr.onload = function () {
      // Kiểm tra xem yêu cầu có thành công không
      if (xhr.status === 200) {
        // Tạo một Blob từ dữ liệu nhận được
        const blob = new Blob([xhr.response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        // Tạo đối tượng URL từ Blob
        const url = window.URL.createObjectURL(blob);

        // Tạo thẻ a để download
        const link = document.createElement("a");

        // Đặt tên mới cho file
        link.download = "Mau_nhap_b.xlsx";

        // Thiết lập đường dẫn URL
        link.href = url;

        // Thêm thẻ a vào body
        document.body.appendChild(link);

        // Kích hoạt sự kiện click để download
        link.click();

        // Loại bỏ thẻ a sau khi đã sử dụng
        document.body.removeChild(link);

        // Giải phóng đối tượng URL
        window.URL.revokeObjectURL(url);
      }
    };

    // Gửi yêu cầu
    xhr.send();
  };

  const titles = ["STT", "Tên khách hàng", "Mã khách hàng", "Số điện thoại", "Email"];
  const dataFormat = ["text-center", "", "", "", ""];

  const dataMappingArray = (item, idx: number) => [idx + 1, item.name || "", item.code || "", item.phone || "", item.email || ""];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setIdData(item.id);
          setShowModalCustomer(true);
        },
      },
    ];
  };

  useEffect(() => {
    if (idData && lstData && lstData.length > 0) {
      const takeDataDuplicate = lstData.find((item) => item.id === idData);
      const result = takeDataDuplicate.duplicateData;
      setDataDuplicate(result);
    }
  }, [idData, lstData]);

  const refOption = useRef();
  const refOptionContainer = useRef();

  const initalFieldChoose = [
    { name: "Số thư bảo lãnh(*)", fieldName: "numberLetter" },
    { name: "Loại bảo lãnh(*)", fieldName: "guaranteeTypeName" },
    { name: "Nghiệp vụ bảo lãnh(*)", fieldName: "competencyName" },
    { name: "Hợp đồng gốc(*)", fieldName: "contractName" },
    { name: "Ngân hàng bảo lãnh(*)", fieldName: "bankName" },
    { name: "Số điện thoại đơn vị thụ hưởng(*)", fieldName: "beneficiaryPhone" },
    { name: "Số điện thoại đơn vị phát hành(*)", fieldName: "issuerPhone" },
    { name: "Loại tiền tệ(*)", fieldName: "currency" },
    { name: "Giá trị bảo lãnh(*)", fieldName: "value" },
    { name: "Trạng thái(*)", fieldName: "guaranteeStatusName" },
    { name: "Ngày bắt đầu(*)", fieldName: "startDate" },
    { name: "Ngày hết hạn(*)", fieldName: "endDate" },
    { name: "Ngày lập(*)", fieldName: "establishDate" },
    { name: "Ngày ký(*)", fieldName: "signDate" },
    { name: "Tỉ lệ ký quỹ(%)(*)", fieldName: "signRate" },
    { name: "Giá trị hợp đồng(*)", fieldName: "contractValue" },
  ];

  const [countDataTest, setCountDataTest] = useState<number>(1);
  const [lstFieldChoose, setLstFieldChoose] = useState(initalFieldChoose);
  const [lstFieldChooseChildren, setLstFieldChooseChildren] = useState([]);
  const [lstFieldCustomer, setLstFieldCustomer] = useState([]);
  const [isShowField, setIsShowField] = useState<boolean>(false);

  const handGetExAttributes = async () => {
    const params = {
        // isCustomer: +typeContract,
    };

    const response = await ContractGuaranteeService.exAttributes(params);

    if (response.code === 0) {
      const result = (response.result || []).map((item) => {
        return {
          name: item.title,
          fieldName: item.name,
          children: item?.children?.map((el) => {
            return {
              name: el.title,
              fieldName: el.name,
            };
          }),
        };
      });

      setLstFieldCustomer(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow ) {
      handGetExAttributes();
    }
  }, [onShow]);

  useOnClickOutside(refOption, () => setIsShowField(false), ["btn__submit--data"]);

  function flattenArrayChildren(arr) {
    let result = [];

    arr.forEach((item) => {
      if (item.children) {
        result = result.concat(item.children);
        // result = result.concat(flattenArrayChildren(item.children)); // nếu như có các cấp sâu hơn
      }
    });

    return result;
  }

  const checkAll = (isChecked: boolean) => {
    if (isChecked) {
      setLstFieldChoose(lstFieldCustomer);
      setLstFieldChooseChildren(flattenArrayChildren(lstFieldCustomer));
    } else {
      setLstFieldChoose(initalFieldChoose);
      setLstFieldChooseChildren([]);
    }
  };

  const checkOne = (data, isChecked: boolean) => {
    if (isChecked) {
      setLstFieldChoose((prev) => {
        const updatedList = [...prev, data];
        if (data.children) {
          const children = flattenArrayChildren([data]);
          setLstFieldChooseChildren((prevChildren) => [...prevChildren, ...children]);
        }
        return updatedList;
      });
    } else {
      // Xóa phần tử và tất cả các phần tử con của nó
      setLstFieldChoose((prev) => {
        const filteredList = prev.filter((item) => item.fieldName !== data.fieldName);
        // Xác định và loại bỏ tất cả các phần tử con của phần tử cha
        if (data.children) {
          const childrenFields = flattenArrayChildren([data]).map((child) => child.fieldName);
          return filteredList.filter((item) => !childrenFields.includes(item.fieldName));
        }
        return filteredList;
      });
      setLstFieldChooseChildren((prevChildren) => {
        // Xóa tất cả các phần tử con của phần tử cha
        if (data.children) {
          const childrenFields = flattenArrayChildren([data]).map((child) => child.fieldName);
          return prevChildren.filter((item) => !childrenFields.includes(item.fieldName));
        }
        return prevChildren;
      });
    }
  };

  const checkOneChildren = (data, isChecked: boolean) => {
    if (isChecked) {
      setLstFieldChooseChildren((prevChildren) => [...prevChildren, data]);
      const parentItem = lstFieldCustomer.find((parent) => parent.children && parent.children.some((child) => child.fieldName === data.fieldName));
      if (parentItem) {
        setLstFieldChoose((prev) => [...prev, parentItem]);
      }
    } else {
      setLstFieldChooseChildren((prevChildren) => prevChildren.filter((item) => item.fieldName !== data.fieldName));
      const parentItem = lstFieldCustomer.find((parent) => parent.children && parent.children.some((child) => child.fieldName === data.fieldName));
      if (parentItem) {
        const remainingChildren = lstFieldChooseChildren.filter((child) =>
          parentItem.children.some((childItem) => childItem.fieldName === child.fieldName)
        );

        const parentItemIndex = lstFieldChoose.findIndex((item) => item.fieldName === parentItem.fieldName);

        if (remainingChildren.length <= 1) {
          if (parentItemIndex !== -1) {
            setLstFieldChoose((prev) => prev.filter((item, index) => index !== parentItemIndex));
          }
        }
      }
    }
  };

  const [hasSubmitDataTest, setHasSubmitDataTest] = useState<boolean>(false);

  const handSubmitDataTest = async (count: number, typeContract) => {
    if (!count) return;

    setHasSubmitDataTest(true);

    const body = {
        numGuarantee: count,
    //   branchName: true,
      name: true,
      phone: true,
    };

    const param = {
        // isCustomer: +typeContract,
    };

    const response = await ContractGuaranteeService.numberFieldGuarantee(body, param);

    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Mau_nhap_bao_lanh.xlsx`;
      link.click();
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setHasSubmitDataTest(false);
  };

  const [isLoadingImportField, setIsLoadingImportField] = useState<boolean>(false);

  // đoạn này hàm gọi api khi mà chọn các trường gửi xuống
  const handImportFielDownload = async (count: number, lstField?: any[], lstFieldChildren?: any[], typeContract?: any) => {
    const changeLstField = lstField.map((item) => ({ [item.fieldName]: true }));
    const changeLstFieldChildren = lstFieldChildren?.map((item) => ({ [item.fieldName]: true }));

    setIsLoadingImportField(true);

    const body = {
      numGuarantee: count,
      ...Object.assign({}, ...changeLstField),
      ...Object.assign({}, ...changeLstFieldChildren),
    };

    const param = {
      // isCustomer: +typeContract,
    };

    const response = await ContractGuaranteeService.numberFieldGuarantee(body, param);

    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Mau_nhap_bao_lanh.xlsx`;
      link.click();
      setIsShowField(false);
      setLstFieldChoose(initalFieldChoose);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingImportField(false);
  };

  const handClearForm = () => {
    step.stepOne ? onHide(false) : onHide(true);
    setAddFile("");
    setInfoFile(null);
    setPrevAddFile("");
    setFormData(defaultFormData);
    setStep(defaultStep);
    setLstData([]);
    setCountDataTest(1);
    setLstFieldChoose(initalFieldChoose);
    setIsShowField(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: step.stepTwo ? "Quay lại" : "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              step.stepOne ? handClearForm() : step.stepTwo ? setStep({ stepOne: true, stepTwo: false, stepThree: false }) : handClearForm();
            },
          },
          ...(!step.stepThree
            ? ([
                {
                  title: "Tiếp tục",
                  disabled: isSubmit || !addFile || (step.stepTwo && !formData.fileName),
                  is_loading: isSubmit,
                  type: step.stepOne ? "button" : "submit",
                  callback: () => {
                    if (step.stepOne) {
                      if (addFile !== prevAddFile) {
                        handConfirmUploadFile(addFile, typeContract);
                      } else {
                        setStep({ ...step, stepOne: false, stepTwo: true });
                      }
                    }
                  },
                },
              ] as any)
            : []),
        ],
      },
    }),
    [isSubmit, addFile, step, formData, typeContract]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal__import--guarantee"
        size={`${infoFile?.data ? "xl" : "md"}`}
      >
        <form className="form__import--guarantee" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={name} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="box__ui--import">
              {step.stepOne ? (
                <div className="wrapper__step--one">
                  <div className="box__update--file">
                    {!addFile && <div className="notify-message">Hiện tại bạn chưa có file mẫu nhập liệu. Hãy tải file mẫu ở phía dưới nhé!</div>}
                    {isLoadingFile ? (
                      <div className="is__loading--file">
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                    ) : (
                      <AddFile takeFileAdd={takeFileAdd} code={code} fileProps={addFile} />
                    )}
                  </div>

                  {/* {exampleFile && (
                    <div className="file__example">
                      <h4>
                        Tải về file mẫu:
                        <span className="download__file--sample" onClick={() => handDownloadFileSample(exampleFile)}>
                          Excel file
                        </span>
                      </h4>
                    </div>
                  )} */}

                  {/* <div className="choose-type">
                    <RadioList
                      title=""
                      name="type-customer"
                      value={typeContract}
                      options={lstTypeContract}
                      onChange={(e) => setTypeContract(e.target.value)}
                    />
                  </div> */}
                  

                  <div className="download__sample--data">
                    <h4 className="name__sample">Tải dữ liệu mẫu:</h4>

                    <div className="info__sample--data">
                      <Tippy content="Số lượng bản ghi trong file mẫu">
                        <div className="count__data">
                          <NummericInput
                            value={countDataTest === 0 ? 1 : countDataTest > 500 ? 500 : countDataTest}
                            fill={true}
                            maxValue={500}
                            disabled={hasSubmitDataTest}
                            onValueChange={(e) => setCountDataTest(e.floatValue)}
                          />
                        </div>
                      </Tippy>

                      <div className={`btn__submit--data ${hasSubmitDataTest ? "dis__submit--data" : ""}`} ref={refOptionContainer}>
                        <div className="btn__confirm" 
                          // onClick={() => !hasSubmitDataTest && handSubmitDataTest(countDataTest, typeContract)}
                          onClick={(e) => {
                            e.preventDefault();
                            handImportFielDownload(countDataTest, lstFieldChoose, lstFieldChooseChildren, typeContract);
                          }}
                        >
                          {hasSubmitDataTest ? (
                            <span className="animation__loading" />
                          ) : (
                            <span className="animation__download">
                              <Icon name="Download" />
                            </span>
                          )}{" "}
                          {hasSubmitDataTest ? "Đang tải" : "Tải xuống"}
                        </div>
                        <div className="btn__choose--field" onClick={() => setIsShowField(!isShowField)}>
                          <Icon name="CaretDown" />
                        </div>

                        {isShowField && (
                          <div className="info__field--customer" ref={refOption}>
                            <span className="suggested__schools">Chọn các trường đề xuất</span>

                            <div className="lst__field">
                              <Checkbox
                                indeterminate={lstFieldChoose.length > 0 && lstFieldChoose?.length < lstFieldCustomer.length}
                                label="Tất cả"
                                checked={lstFieldChoose.length === lstFieldCustomer.length}
                                onChange={(e) => checkAll(e.target.checked)}
                              />
                              {lstFieldCustomer.map((item, idx) => {
                                const isCheck = lstFieldChoose && lstFieldChoose.some((el) => el.fieldName === item.fieldName) ? true : false;

                                const hasChildren = item.children && item.children.length > 0;

                                const childrenCheckedCount = lstFieldChooseChildren.filter((child) =>
                                  item.children?.some((childItem) => childItem.fieldName === child.fieldName)
                                ).length;

                                const isChecked = hasChildren ? childrenCheckedCount === item.children.length : isCheck;
                                const isIndeterminate = hasChildren && !isChecked && childrenCheckedCount > 0;

                                return (
                                  <Fragment key={idx}>
                                    <Checkbox
                                      checked={isChecked}
                                      indeterminate={isIndeterminate}
                                      disabled={
                                        [
                                          "numberLetter", 
                                          "guaranteeTypeName", 
                                          "competencyName",
                                          "contractName",
                                          "bankName",
                                          "beneficiaryPhone",
                                          "issuerPhone",
                                          "currency",
                                          "value",
                                          "guaranteeStatusName",
                                          "startDate",
                                          "endDate",
                                          "establishDate",
                                          "signDate",
                                          "signRate",
                                          "contractValue"
                                        ].includes(item.fieldName)}
                                      label={item.name}
                                      onChange={(e) => checkOne(item, e.target.checked)}
                                    />

                                    {item.children && (
                                      <div className="lst__field--children">
                                        {item.children.map((el, index) => {
                                          const isCheckChildren =
                                            lstFieldChooseChildren && lstFieldChooseChildren.some((il) => il.fieldName === el.fieldName)
                                              ? true
                                              : false;
                                          return (
                                            <Checkbox
                                              key={index}
                                              checked={isCheckChildren}
                                              label={el.name}
                                              onChange={(e) => checkOneChildren(el, e.target.checked)}
                                            />
                                          );
                                        })}
                                      </div>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </div>
                            <div className="confirm__field--submit">
                              <Button
                                disabled={lstFieldChoose.length === 0 || isLoadingImportField}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handImportFielDownload(countDataTest, lstFieldChoose, lstFieldChooseChildren, typeContract);
                                }}
                              >
                                Xác nhận {isLoadingImportField && <Icon name="Loading" />}
                              </Button>
                            </div>
                            <div className="arrow-down"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : step.stepTwo ? (
                <div className="wrapper__step--two">
                  <div className="form-group">
                    <Input
                      name="sourceData"
                      label="Nguồn dữ liệu"
                      value={formData.fileName}
                      fill={true}
                      required={true}
                      placeholder="Nhập tên nguồn dữ liệu bảo lãnh"
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    />
                  </div>

                  <div className="form-group mechanism_bug">
                    <RadioList
                      title="Cơ chế giải quyết lỗi"
                      value={formData.processErrorCode}
                      name="mechanism_bug"
                      options={lstOptionMechanismBug}
                      onChange={(e) => setFormData({ ...formData, processErrorCode: e.target.value })}
                    />
                  </div>

                  <div className="form-group mechanism_duplicate">
                    <RadioList
                      title="Cơ chế giải quyết trùng lặp dữ liệu"
                      value={formData.processDuplicateCode}
                      name="mechanism_duplicate"
                      options={lstOptionMechanismDuplicate}
                      onChange={(e) => setFormData({ ...formData, processDuplicateCode: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="wrapper__step--three">
                  <div className="show__result">
                    <span className="summary-item">
                      - Tổng số <span className="qty-success">{infoFile?.numValid} bản ghi</span> thành công.
                    </span>
                    <span className="summary-item">
                      - Tổng số <span className="qty-duplicate">{infoFile?.numDuplicate} bản ghi</span> bị trùng.
                    </span>
                    <span className="summary-item">
                      - Tổng số <span className="qty-faild">{infoFile?.numInvalid} bản ghi </span>thất bại.{" "}
                      {infoFile?.numInvalid > 0 && (
                        <span>
                          Tải xuống danh sách không thành công <a onClick={() => handDownloadFileError()}>tại đây</a>.
                        </span>
                      )}
                    </span>
                  </div>

                  {/* {infoFile?.data && infoFile?.data?.length > 0 && (
                    <div className="table__item--error">
                      <h2 className="title__tbale">Danh sách bản ghi trùng</h2>

                      <div className="lst__item--duplicate">
                        <BoxTable
                          name="Danh sách dữ liệu trùng"
                          titles={titles}
                          items={lstData}
                          dataMappingArray={(item, index) => dataMappingArray(item, index)}
                          dataFormat={dataFormat}
                          striped={true}
                          actions={actionsTable}
                          actionType="inline"
                        />
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      {/* <AddCustomerPersonModal onShow={showModalCustomer} onHide={() => setShowModalCustomer(false)} data={dataDuplicate} lstDataOrigin={lstData} /> */}
    </Fragment>
  );
}
