import { showToast } from "./common";
import { convertParamsToString } from "reborn-util";
import { useEffect, useState } from "react";

// Function lấy dữ liệu danh sách từ service
export async function CallApiCommon(api: string, params?: any) {
  params = { ...params};
  
  let response;

  if(api){
    // const apiUrlOption = process.env.APP_API_URL + api;
    const apiUrlOption = api?.includes("https://") ? api : `${process.env.APP_API_URL}${api}`;
    const result = await fetch(`${apiUrlOption}${convertParamsToString(params)}`, {
        method: "GET",
    });

    const data = await result.json();
    response = data;
  }
  
  return response;
}
