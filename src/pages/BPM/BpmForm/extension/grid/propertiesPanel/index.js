import CustomPropertiesProvider from "./CustomPropertiesProvider";

export default {
  __init__: ["gridPropertiesProvider"],
  gridPropertiesProvider: ["type", CustomPropertiesProvider],
};
