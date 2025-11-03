import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import Icon from "components/icon";
import "./ButtonExportNode.scss";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import BusinessProcessService from "services/BusinessProcessService";
import { handDownloadFileOrigin, showToast } from "utils/common";

export default function ButtonExportNode({ nodeId }) {

    const [requestId, setRequestId] = useState(null);
    const [isLoadingExport, setIsLoadingEpxort] = useState(false);

    const ExportNode = async (nodeId) => {
        const body = {
            nodeIds: [nodeId]
        }
        const response = await BusinessProcessService.exportDataProcess(body);

        if (response.code == 0) {
            const result = response.result;
            const requestId = result?.requestId

            if(requestId){
                setRequestId(requestId);
            } else {
                setIsLoadingEpxort(false)
            }
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
    }

    useEffect(() => {
        if(requestId){
          const timer = setInterval(async () => {
            const response = await BusinessProcessService.getUrlExportDataProcess({requestId: requestId});
            if(response.code == 0) {
              const result = response.result;
              const fileResponse = result.fileResponse;
    
              if(fileResponse){
                handDownloadFileOrigin(fileResponse?.fileUrl, fileResponse?.fileName);
                showToast("Xuất dữ liệu thành công", "success");
                clearInterval(timer);
                setRequestId(null);
              }
              setIsLoadingEpxort(false)
            }
            
          }, 2000, requestId);
      
          return () => clearInterval(timer);
        }
        
    }, [requestId]);

    return (
        <div className="button-export-node">
            <Tippy content="Export Node">
                <div>
                    <Button
                        onClick={() => {
                            ExportNode(nodeId);
                        }}
                        type="button"
                        className="btn-setting"
                        color="transparent"
                        onlyIcon={true}
                    >
                        <Icon name="Download" style={{ width: 20 }} />
                    </Button>
                </div>
            </Tippy>
        </div>
  );
}
