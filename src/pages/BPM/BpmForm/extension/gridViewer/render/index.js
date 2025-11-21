import { GridRenderer } from "./Grid";

/*
 * This is the module definition of the custom field. This goes
 * into the Form instance via `additionalModules`.
 */
class CustomFormFields {
  constructor(formFields) {
    formFields.register(GridRenderer.config.type, GridRenderer, GridRenderer.config);
  }
}

CustomFormFields.$inject = ['formFields'];

export default {
  __init__: ["gridViewerField"],
  gridViewerField: ["type", CustomFormFields],
};
