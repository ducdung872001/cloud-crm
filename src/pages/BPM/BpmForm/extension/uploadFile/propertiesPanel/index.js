import CustomPropertiesProvider from "./CustomPropertiesProvider";

export default {
  __init__: ["uploadFilePropertiesProvider"],
  uploadFilePropertiesProvider: ["type", CustomPropertiesProvider],
};
