import ContractService from "services/ContractService";
import OrderRequestService from "services/OrderRequestService";

export const fetchDataItem = async (potIds, processType) => {
  const params = {
    limit: 10,
    potIds: potIds || "",
  };
  try {
    let response = null;
    switch (processType) {
      case "contract":
        response = await ContractService.list(params);
        break;
      case "orderRequest":
        response = await OrderRequestService.list(params);
        break;

      default:
        break;
    }

    if (response.code === 0) {
      const result = response.result;

      const listClaim = result?.items || [];

      return listClaim;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error); // Xử lý lỗi nếu có
  }
};
