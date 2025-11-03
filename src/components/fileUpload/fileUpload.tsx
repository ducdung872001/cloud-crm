import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { uploadImageFromFiles } from "utils/image";
import { showToast } from "utils/common";
import { FILE_IMAGE_MAX } from "utils/constant";
import Button from "components/button/button";
import Image from "components/image";
import Icon from "components/icon";
import FileService from "services/FileService";
import "./fileUpload.scss";

interface FileUploadProps {
  label?: string | ReactElement;
  formData?: any;
  setFormData?: any;
  isRequired?: boolean;
  type?: string;
  name?: string;
  source?: string;
}

export default function FileUpload(props: FileUploadProps) {
  const { label, isRequired, type, formData, setFormData, name, source = "reborn" } = props;  

  const refInputUpload = useRef<HTMLInputElement>();

  const [imagePreview, setImagePreview] = useState<string>("");

  const [file, setFile] = useState(null);

  const handleImageUpload = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_IMAGE_MAX) {
        showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
        e.target.value = "";
      } else {
        setImagePreview(URL.createObjectURL(e.target.files[0]));
        {
          source === "reborn" ? setFile(e.target.files[0]) : uploadImageFromFiles(e.target.files, showImage, false);
        }

        e.target.value = null;
      }
    }
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    showImage(result);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  useEffect(() => {
    if (file) {
      handUploadFile(file);
    }
  }, [file]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showImage = (url, filekey?: any,) => {
    
    switch (type) {
      case "avatar":
        setFormData({ ...formData, values: { ...formData.values, avatar: url } });
        break;
      case "bill":
        setFormData({ ...formData, values: { ...formData.values, bill: url } });
        break;
      case "cover":
        setFormData({ ...formData, values: { ...formData.values, cover: url } });
        break;
      case "prevProof":
        setFormData({ ...formData, values: { ...formData.values, prevProof: url } });
        break;
      case "afterProof":
        setFormData({ ...formData, values: { ...formData.values, afterProof: url } });
        break;
      case "cardvisitFront":
        setFormData({ ...formData, values: { ...formData.values, cardvisitFront: url } });
        break;
      case "cardvisitBack":
        setFormData({ ...formData, values: { ...formData.values, cardvisitBack: url } });
      break;
      default:
        throw new Error("message image");
    }
  };

  const handleDeteleImage = (type) => {
    switch (type) {
      case "avatar":
        setFormData({ ...formData, values: { ...formData.values, avatar: "" } });
        break;
      case "bill":
        setFormData({ ...formData, values: { ...formData.values, bill: "" } });
        break;
      case "cover":
        setFormData({ ...formData, values: { ...formData.values, cover: "" } });
        break;
      case "prevProof":
        setFormData({ ...formData, values: { ...formData.values, prevProof: "" } });
        break;
      case "afterProof":
        setFormData({ ...formData, values: { ...formData.values, afterProof: "" } });
        break;
      case "cardvisitFront":
        setFormData({ ...formData, values: { ...formData.values, cardvisitFront: "" } });
        break;
      case "cardvisitBack":
        setFormData({ ...formData, values: { ...formData.values, cardvisitBack: "" } });
      break;
      default:
        throw new Error("delete image");
    }
  };

  const handleGeneral = (type) => {
    //logic tránh lặp lại code
  };

  return (
    <div className="wrapper-file__upload">
      <label className="label">
        {label} {isRequired ? <span>*</span> : ""}
      </label>
      <div className="file-upload">
        {(
          type === "avatar"
            ? formData?.values?.avatar
            : type === "bill"
            ? formData?.values?.bill
            : type === "cover"
            ? formData?.values?.cover
            : type === "prevProof"
            ? formData?.values?.prevProof
            : type === "afterProof" 
            ? formData?.values?.afterProof
            : type === "cardvisitFront" 
            ? formData?.values?.cardvisitFront
            : type === "cardvisitBack" 
            ? formData?.values?.cardvisitBack
            : ""
        ) ? (
          <Fragment>
            {imagePreview ? (
              <Image src={imagePreview} alt={formData?.values?.name} />
            ) : (
              <Image
                src={
                  type === "avatar"
                    ? formData?.values?.avatar
                    : type === "bill"
                    ? formData?.values?.bill
                    : type === "cover"
                    ? formData?.values?.cover
                    : type === "prevProof"
                    ? formData?.values?.prevProof
                    : type === "afterProof" 
                    ? formData?.values?.afterProof
                    : type === "cardvisitFront" 
                    ? formData?.values?.cardvisitFront
                    : type === "cardvisitBack" 
                    ? formData?.values?.cardvisitBack
                    : ""
                }
                alt={formData?.values?.name}
              />
            )}
            <span className="actions">
              <span className="btn-change-image" onClick={() => refInputUpload.current.click()}>
                Chọn ảnh khác
              </span>
              |
              <Button
                type="button"
                className="btn-remove-image"
                color="link"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeteleImage(type);
                }}
              >
                Xoá
              </Button>
            </span>
          </Fragment>
        ) : (
          <label
            htmlFor={`${name ? name : "imageUpload"}`}
            className={`btn-upload-image${
              (
                type === "avatar"
                  ? formData?.values?.avatar
                  : type === "bill"
                  ? formData?.values?.bill
                  : type === "cover"
                  ? formData?.values?.cover
                  : type === "prevProof"
                  ? formData?.values?.prevProof
                  : type === "afterProof" 
                  ? formData?.values?.afterProof
                  : type === "cardvisitFront" 
                  ? formData?.values?.cardvisitFront
                  : type === "cardvisitBack" 
                  ? formData?.values?.cardvisitBack
                  : ""
              )
                ? " has-image"
                : ""
            }`}
            onClick={(e) =>
              (
                type === "avatar"
                  ? formData?.values?.avatar
                  : type === "bill"
                  ? formData?.values?.bill
                  : type === "cover"
                  ? formData?.values?.cover
                  : type === "prevProof"
                  ? formData?.values?.prevProof
                  : type === "afterProof" 
                  ? formData?.values?.afterProof
                  : type === "cardvisitFront" 
                  ? formData?.values?.cardvisitFront
                  : type === "cardvisitBack" 
                  ? formData?.values?.cardvisitBack
                  : ""
              )
                ? e.preventDefault()
                : undefined
            }
          >
            <span>
              <Icon name="Upload" />
              Tải ảnh lên
            </span>
          </label>
        )}
        <input
          type="file"
          accept="image/gif,image/jpeg,image/png,image/jpg"
          className="d-none"
          id={`${name ? name : "imageUpload"}`}
          onChange={(e) => handleImageUpload(e)}
          ref={refInputUpload}
        />
      </div>
    </div>
  );
}
