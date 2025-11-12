import { name } from "jssip";
import ContractService from "services/ContractService";
import TicketService from "services/TicketService";

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

const getListTicket = async (potIds: any) => {
  const params = {
    limit: 10,
    potIds: potIds,
    name  : "",
  };

  const response = await TicketService.list(params);

  if (response.code === 0) {
    const result = response.result;

    const listTicket = result?.items || [];

    return listTicket;
  }
};

export const fetchDataDetail = async (potIds, processType) => {
  console.log("fetchDataDetail potIds:", potIds, "processType:", processType);
  try {
    const dataFetch = processType && processType === "ticket" ? await getListTicket(potIds) : await getListContract(potIds);
    return dataFetch;
  } catch (error) {
    console.error("Error fetching data:", error); // Xử lý lỗi nếu có
  }
};
