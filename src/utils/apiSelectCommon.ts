import { showToast } from "./common";
import { convertParamsToString } from "reborn-util";
import { useEffect, useState } from "react";

// Function lấy dữ liệu danh sách từ service
export async function SelectOptionEform(key: string, api: string, params?: any) {
  params = { ...params, limit: params?.limit ? params.limit : 200, page: params?.page ? params.page : 1 };
  
  let response;

  if(api){
    const apiUrlOption = process.env.APP_API_URL + api;
    const result = await fetch(`${apiUrlOption}${convertParamsToString(params)}`, {
        method: "GET",
    });

    const data = await result.json();
    response = data;
  }

  // console.log('response', response);
  
  if (response) {
    if (response.code === 0) {
      return [...(response.result.items ? response.result.items : response.result)].map((item) => {
        
        if (key === "field" || key === "investor" || key === "supplier" || key === "procurementType" || key === "projectCatalog") {
          return { value: item.id, label: `${item.code || item.id} - ${item.name}` };
        }
        if (key === "projectRealty") {
          return { 
            value: item.id, 
            label: `${item.code || item.id} - ${item.name}`,
            projectCatalog: item.pclId,
          };
        }
        return {
          value: item.id,
          label: item.name || item.title,
        };
      });
    } else {
      showToast(response.message, "error");
    }
    return [];
  }
}
