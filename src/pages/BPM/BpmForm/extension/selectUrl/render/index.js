import { SelectUrlRenderer, selectUrlType } from "./SelectUrl";

class CustomFormFields {
  constructor(formFields) {
    formFields.register(selectUrlType, SelectUrlRenderer);
  }
}

CustomFormFields.$inject = ["formFields"];

export default {
  __init__: ["selectUrlFields"],
  selectUrlFields: ["type", CustomFormFields],
};
