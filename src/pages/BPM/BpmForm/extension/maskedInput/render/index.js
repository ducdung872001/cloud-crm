import { MaskedInputRenderer, maskedInputType } from "./MaskedInput";

/*
 * This is the module definition of the custom field. This goes
 * into the Form instance via `additionalModules`.
 */
class CustomFormFields {
  constructor(formFields) {
    formFields.register(maskedInputType, MaskedInputRenderer);
  }
}

CustomFormFields.$inject = ["formFields"];

export default {
  __init__: ["maskedInputField"],
  maskedInputField: ["type", CustomFormFields],
};
