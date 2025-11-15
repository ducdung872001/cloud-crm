import ContractService from "services/ContractService";
import OrderRequestService from "services/OrderRequestService";

const getListContract = async (potIds: any) => {
  const params = {
    limit: 10,
    potIds: potIds,
  };

  const response = await ContractService.list(params);

  if (response.code === 0) {
    const result = response.result;

    const listContract = result?.items || [];

    return listContract;
  }
};

const getListClaim = async (potIds: any) => {
  const params = {
    limit: 10,
    potIds: potIds,
  };

  const response = await OrderRequestService.list(params);

  if (response.code === 0) {
    const result = response.result;

    const listClaim = result?.items || [];

    return listClaim;
  }
};

export const fetchDataDetail = async (potIds, processType) => {
  try {
    const dataFetch = processType && processType === "claim" ? await getListClaim(potIds) : await getListContract(potIds);
    return dataFetch;
  } catch (error) {
    console.error("Error fetching data:", error); // Xử lý lỗi nếu có
  }
};
