import { UploadFileRenderer, uploadFileType } from "./UploadFile";

/*
 * This is the module definition of the custom field. This goes
 * into the Form instance via `additionalModules`.
 */
class CustomFormFields {
  constructor(formFields) {
    formFields.register(uploadFileType, UploadFileRenderer);
  }
}

CustomFormFields.$inject = ["formFields"];

export default {
  __init__: ["uploadFileField"],
  uploadFileField: ["type", CustomFormFields],
};
