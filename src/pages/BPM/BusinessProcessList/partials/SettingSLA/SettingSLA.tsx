import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { showToast } from "utils/common";
import "./SettingSLA.scss";
import NummericInput from "components/input/numericInput";
import _ from "lodash";
import BusinessProcessService from "services/BusinessProcessService";

export default function SettingSLA(props: any) {
  const { processId, valueSLA, setValueSLA } = props;

  useEffect(() => {
    if(processId ){
        // setValueSLA(valueSLAInit);
    }
  }, [processId])

//   const getDetailServiceLevel = async (nodeId) => {
//     const params = {
//       nodeId: nodeId,
//     };
    
//     const response = await BusinessProcessService.listServiceLevel(params);
//     if (response.code === 0) {
//       const result = response.result;
//       if(result.items && result.items.length > 0){
//         const dataResponse = result.items.find(el => el.timeType === 'response');
//         if(dataResponse){
//           setValueResponse(dataResponse)
//         } else {
//           setValueResponse({...valueResponse, nodeId: nodeId});
//         }
        
//         const dataProcess = result.items.find(el => el.timeType === 'process');        
//         if(dataProcess){
//           setValueProcess(dataProcess)
//         } else {
//           setValueProcess({...valueProcess, nodeId: nodeId});
//         }
//       } else {
//         setValueProcess({...valueProcess, nodeId: nodeId});
//         setValueResponse({...valueResponse, nodeId: nodeId});
//       }

//     } else {
//       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
//     }

//   };

// const [valueSLA, setValueSLA] = useState({
//     planResponseDay: '',
//     planResponseHour: '',
//     planResponseMinute: '',
//     planExecutionDay: '',
//     planExecutionHour: '',
//     planExecutionMinute: ''
//   })  



  return (
    <div className="setting-SLA-process">
        <div className="box_line_date"> 
            <span className="title_time">Thời gian phản hồi:</span>
            <div className="box_setting_time">
                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planResponseDay}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planResponseDay: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">ngày</span>
                    </div>
                </div>

                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planResponseHour}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planResponseHour: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">giờ</span>
                    </div>
                </div>

                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planResponseMinute}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planResponseMinute: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">phút</span>
                    </div>
                </div>

            </div>
        </div>

        <div className="box_line_date">
            <span className="title_time">Thời gian xử lý:</span>
            <div className="box_setting_time">
                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planExecutionDay}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planExecutionDay: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">ngày</span>
                    </div>
                </div>

                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planExecutionHour}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planExecutionHour: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">giờ</span>
                    </div>
                </div>

                <div className="box_time">
                    <div className="form-group">
                        <NummericInput
                            name="score"
                            id="score"
                            // label="Số lượng thực tế"
                            fill={false}
                            value={valueSLA.planExecutionMinute}
                            onChange={(e) => {
                                const value = e.target.value || ''
                                setValueSLA({ ...valueSLA, planExecutionMinute: value});
                            }}
                        />
                    </div>
                    <div>
                        <span className="title_time">phút</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
