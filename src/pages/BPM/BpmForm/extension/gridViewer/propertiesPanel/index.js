import CustomPropertiesProvider from "./CustomPropertiesProvider";

export default {
  __init__: ["gridViewerPropertiesProvider"],
  gridPropertiesProvider: ["type", CustomPropertiesProvider],
};
