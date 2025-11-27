import BusinessProcessService from "services/BusinessProcessService";

const colorData = [
  "#E98E4C",
  "#ED6665",
  "#FFBF00",
  "#9966CC",
  "#6A5ACD",
  "#007FFF",
  "#993300",
  "#F0DC82",
  "#CC5500",
  "#C41E3A",
  "#ACE1AF",
  "#7FFF00",
  "#FF7F50",
  "#BEBEBE",
  "#FF00FF",
  "#C3CDE6",
  "#FFFF00",
  "#40826D",
  "#704214",
];
const abortController = new AbortController();

const getListStepProcess = async (processId) => {
  try {
    const body: any = {
      processId,
      limit: 100,
    };

    const response = await BusinessProcessService.listStep(body);
    if (response.code === 0) {
      const dataOption = response?.result?.items || [];
      return dataOption.map((item, index) => {
        return {
          id: item.id,
          title: item.stepName,
          color: colorData[index],
          processId: item.processId,
          step: item.stepNumber,
        };
      });
    } else {
      console.error("Error fetching steps:", response.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching steps:", error);
  }
};
const getDataOfStepSuccess = async (processId, status) => {
  try {
    const param = {
      processId: processId,
      limit: 10,
      page: 1,
      workflowId: -1,
      status: status,
    };
    const response = await BusinessProcessService.listWorkFlow(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      return result;
    } else {
      console.error("Error fetching data of step success:", response.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching step data:", error);
    return [];
  }
};

export const getListColumns = async (processId) => {
  try {
    console.log("processId:", processId); // Kiểm tra giá trị processId
    const listStepProcess = await getListStepProcess(processId);

    return [
      ...listStepProcess,
      {
        id: "done",
        title: "Hoàn thành",
        color: "#1bc10d",
        processId: processId,
        items: [],
        hasMore: false,
        page: 1,
      },
    ]; // Trả về danh sách các bước của quy trình
  } catch (error) {
    console.error("Error fetching data:", error); // Xử lý lỗi nếu có
  }
};

export const getDetailColumns = async (listColumn) => {
  try {
    const processId = listColumn[0]?.processId; // Lấy processId từ cột đầu tiên
    const listDataOfStepSuccess = await getDataOfStepSuccess(processId, 2);
    console.log("listColumn:", listColumn);
  } catch (error) {
    console.error("Error fetching data:", error); // Xử lý lỗi nếu có
  }
};
