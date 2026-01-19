import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, IFilterItem } from "model/OtherModel";
import { ICustomerListProps } from "model/callCenter/PropsModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import AddPhoneModal from "../AddPhoneModal";
import AddManagementOpportunityModal from "pages/ManagementOpportunity/partials/AddManagementOpportunityModal";
import AddTreatmentScheduleModal from "pages/CalendarCommon/partials/AddTreatmentScheduleModal/AddTreatmentScheduleModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import { ContextType, UserContext } from "contexts/userContext";
import EmployeeAgentService from "services/EmployeeAgentService";
import JsSIP from "jssip";
import * as SIP from "sip.js";
import { Inviter, Registerer, URI, UserAgent } from "sip.js";
// import { useWebRTC } from "components/WebRTCEmbed/hooks/useWebRTC";
import { useSTWebRTC } from "webrtc/useSTWebRTC";
import WebRtcPhoneModal from "../WebRtcPhoneModal";
import WebRtcCallIncomeModal from "../WebRtcCallIncomeModal";

// const { makeCall } = useWebRTC();
interface IParamsCustomerInCallCenter {
  keyword?: string;
  callStatus?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  page?: number;
  limit?: number;
}

export default function CustomerList(props: ICustomerListProps) {
  const { tab, reload, setReload } = props;
  const checkUserRoot = localStorage.getItem("user.root");
  const remoteAudioRef = useRef(null);
  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalPhone, setShowModalPhone] = useState<boolean>(false);
  const [showModalCallIncome, setShowModalCallIncome] = useState<boolean>(false);
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>([]);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);
  const [showModalAddManagementOpportunity, setShowModalAddManagementOpportunity] = useState<boolean>(false);
  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [showModalAddConsultationScheduleModal, setShowModalAddConsultationScheduleModal] = useState<boolean>(false);

  const [params, setParams] = useState<IParamsCustomerInCallCenter>({
    keyword: "",
  });
  const pbxCustomerCode = "d9cf985baac44238b3d930ae569d9f0912";

  const employeeSip470 = "470";

  const employeeSip471 = "471";

  const { callState, incomingNumber, makeCall, answer, hangup, transfer } = useSTWebRTC({
    extension: checkUserRoot == "1" ? employeeSip470 : employeeSip471,
    pbxCustomerCode: pbxCustomerCode,
  });

  useEffect(() => {
    console.log("Trạng thái tổng đài >>", callState);
    console.log("Số điện thoại gọi đến >>", incomingNumber);
    console.log("Số máy lẻ >>", checkUserRoot == "1" ? employeeSip470 : employeeSip471);

    if (callState == "incoming") {
      setShowModalCallIncome(true);
    }
  }, [callState, incomingNumber]);

  useEffect(() => {
    if (params?.callStatus || params?.startDate || params?.endDate) {
      delete params?.callStatus;
      delete params?.startDate;
      delete params?.endDate;
    }
  }, [params]);

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1 ? [
        //     {
        //       key: "branchId",
        //       name: "Chi nhánh",
        //       type: "select",
        //       is_featured: true,
        //       value: searchParams.get("branchId") ?? "",
        //     },
        //   ] : []
        // ),
        {
          key: "employeeId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListCustomer = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);

    const response = await CustomerService.filter(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListCustomer(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword !== "" && +params.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
    setReload(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCustomer(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      if (tab.name == "tab_one") {
        delete paramsTemp["callStatus"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
  }, [params, tab.name]);

  useEffect(() => {
    if (reload) {
      getListCustomer(params);
    }
  }, [reload]);

  const titles = [
    "STT",
    "Ảnh đại diện",
    "Tên khách hàng",
    "Giới tính",
    "Điện thoại",
    "Email",
    "Địa chỉ",
    "Người phụ trách",
    "Tạo lịch hẹn",
    "Tạo cơ hội",
  ];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center", "", "", "", "text-center", "text-center"];

  const dataMappingArray = (item: ICustomerResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.avatar || ""} alt={""} />,
    item.name,
    item.gender === 1 ? "Nữ" : "Nam",
    item.phoneMasked,
    item.emailMasked,
    item.address,
    item.employeeName,
    <span
      key={item.id}
      style={{ color: "var(--primary-color-90)", fontWeight: "500", cursor: "pointer" }}
      onClick={() => {
        setIdCustomer(item.id);
        setShowModalAddConsultationScheduleModal(true);
      }}
    >
      Tạo
    </span>,
    <span
      key={item.id}
      style={{ color: "var(--primary-color-90)", fontWeight: "500", cursor: "pointer" }}
      onClick={() => {
        setIdCustomer(item.id);
        setShowModalAddManagementOpportunity(true);
      }}
    >
      Tạo
    </span>,
  ];

  const actionsTable = (item: ICustomerResponse): IAction[] => {
    return [
      {
        title: "Gọi điện",
        icon: <Icon name="ContactPhone" />,
        callback: () => {
          setDataCustomer(item);
          setShowModalPhone(true);
          // handleMakeCall()
        },
      },
    ];
  };

  const getAccountCall = async () => {
    const response = await EmployeeAgentService.listAthena();
  };

  // useEffect(() => {
  //   getAccountCall()
  // }, [])

  // function makeCall(phoneNumber) {
  //   // Thông tin cấu hình SIP
  //   const socket = new JsSIP.WebSocketInterface('wss://pbx-athenaspear-prod.athenafs.io:7443');
  //   const configuration = {
  //     sockets: [socket],
  //     uri: 'sip:athena_101057@pbx-athenaspear-dev.athenafs.io',
  //     password: 'B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR'
  //   };

  //   // Tạo user agent
  //   const ua = new JsSIP.UA(configuration);

  //   // Đăng ký với máy chủ SIP
  //   ua.start();
  //   const session = ua.call(`sip:${phoneNumber}@pbx-athenaspear-prod.athenafs.io`, {
  //     mediaConstraints: { audio: true, video: false }
  //   });

  //   // Lắng nghe các sự kiện
  //   session.on('confirmed', () => {
  //     console.log('Call confirmed');
  //   });

  //   session.on('ended', () => {
  //     console.log('Call ended');
  //   });

  //   session.on('failed', (e) => {
  //     console.log('Call failed', e);
  //   });
  // }

  const handleMakeCall = () => {
    var socket = new JsSIP.WebSocketInterface("wss://pbx-athenaspear-prod.athenafs.io:7443");
    var configuration = {
      sockets: [socket],
      // uri      : 'sip:alice@example.com',
      // password : 'superpassword'
      uri: "sip:athena_100073@pbx-athenaspear-dev.athenafs.io",
      password: "B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR",
    };

    var ua = new JsSIP.UA(configuration);

    ua.start();

    // Register callbacks to desired call events
    var eventHandlers = {
      progress: function (e) {
        console.log("call is in progress");
      },
      failed: function (e) {
        console.log("e", e);

        console.log("call failed with cause: ", e.data.cause);
      },
      ended: function (e) {
        console.log("call ended with cause: " + e.data.cause);
      },
      confirmed: function (e) {
        console.log("call confirmed");
      },
    };

    var options = {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: true },
    };

    var session = ua.call("sip:athena_101057@pbx-athenaspear-prod.athenafs.io:7443", options);
  };

  // const sipUri = new URI("sip", "athena_101057", "pbx-athenaspear-prod.athenafs.io");
  // // Cấu hình UserAgent
  // const userAgent = new UserAgent({
  //   uri: sipUri,
  //   authorizationUsername: 'athena_101057',
  //   authorizationPassword: 'B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR',
  //   transportOptions: {
  //     server: "wss://pbx-athenaspear-prod.athenafs.io:7443",
  //   },
  //   logLevel: "debug",
  // });

  // userAgent.transport.onConnect = () => {
  //   console.log("WebSocket connected");
  // };

  // userAgent.transport.onDisconnect = (error) => {
  //   console.error("WebSocket disconnected", error);
  // };

  // const registerer = new Registerer(userAgent);

  // // Bắt đầu UserAgent và đăng ký
  // userAgent
  //   .start()
  //   .then(() => {
  //     console.log("UserAgent started successfully");

  //     // Đăng ký
  //     registerer
  //       .register()
  //       .then(() => {
  //         console.log("Registered successfully");
  //       })
  //       .catch((error) => {
  //         console.error("Registration failed", error);
  //       });
  //   })
  //   .catch((error) => {
  //     console.error("Failed to start UserAgent", error);
  //   });

  // // Thực hiện cuộc gọi
  // function makeCall(target) {
  //   // const phone = `sip:${target}@pbx-athenaspear-prod.athenafs.io`
  //   // Số điện thoại hoặc URI SIP của người nhận
  //   const targetURI = new URI("sip", target, 'pbx-athenaspear-prod.athenafs.io'); // Tạo URI với số điện thoại
  //   const inviterOptions = {
  //     media: {
  //       constraints: {
  //         audio: true,
  //         video: false,
  //       },
  //     },
  //   };

  //   // Tạo Inviter và thực hiện gọi
  //   const inviter = new Inviter(userAgent, targetURI);

  //   inviter
  //     .invite()
  //     .then(() => {
  //       console.log(`Cuộc gọi tới ${target} đã bắt đầu`);
  //     })
  //     .catch((error) => {
  //       console.error("Lỗi khi thực hiện cuộc gọi:", error);
  //     });

  // }

  // // Nhận cuộc gọi
  // userAgent.delegate = {
  //   onInvite: (incomingSession) => {
  //     console.log('Incoming call from:', incomingSession.remoteIdentity.uri.toString());
  //     incomingSession.accept({
  //       sessionDescriptionHandlerOptions: {
  //         constraints: { audio: true, video: false }
  //       }
  //     });

  //     incomingSession.on('terminated', () => console.log('Call ended'));
  //   }
  // };

  // Cấu hình SIP User Agent
  // const config = {
  //   uri: "sip:athena_101057@pbx-athenaspear-prod.athenafs.io",
  //   wsServers: ["wss://pbx-athenaspear-prod.athenafs.io:7443"],
  //   authorizationUser: "athena_101057",
  //   password: "B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR",
  //   traceSip: true, // Log SIP messages for debugging
  // };

  // const audioElement = document.createElement("audio");
  // audioElement.setAttribute("autoPlay", "true");
  // audioElement.style.display = "none";
  // remoteAudioRef.current = audioElement;

  // document.body.appendChild(audioElement);

  // const userAgent = new SIP.WebRTC.Simple({
  //   media: {
  //       remote: {
  //         audio: remoteAudioRef.current,
  //       },
  //   },
  //   ua: config,
  // });

  // // Lắng nghe các sự kiện từ User Agent
  // userAgent.on("registered", () => console.log("Registered successfully!"));
  // userAgent.on("unregistered", () => console.log("Unregistered"));
  // userAgent.on("registrationFailed", (error) => console.error("Registration failed:", error));
  // userAgent.on("invite", (session) => console.log("Incoming call:", session));

  // const makeCall = (phone) => {
  //   // const target = `sip:${phone}@pbx-athenaspear-prod.athenafs.io`; // Số hoặc SIP URI

  //   const target = `25603355_0996623235_${phone}@pbx-athenaspear-prod.athenafs.io`

  //   userAgent.call(target);

  //   // Lắng nghe sự kiện
  //   userAgent.on("ringing", () => {
  //     console.log("The call is ringing!");
  //   });

  //   userAgent.on("progress", () => {
  //     console.log("The call is ringing!");
  //   });

  //   userAgent.on("ended", () => {
  //     console.log("The call has ended!");
  //   });

  //   userAgent.on("failed", (error) => {
  //     console.error("Call failed:", error);
  //   });
  // }

  return (
    <Fragment>
      {/* <div>
        <audio ref={remoteAudioRef} autoPlay />
      </div> */}
      <SearchBox
        name="Khách hàng"
        params={params}
        isFilter={true}
        listFilterItem={customerFilterList}
        placeholderSearch="Tìm kiếm theo tên, số điện thoại, email khách hàng"
        updateParams={(paramNew) => setParams(paramNew)}
      />

      {!isLoading && listCustomer && listCustomer.length > 0 ? (
        <BoxTable
          name="Khách hàng"
          titles={titles}
          items={listCustomer}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {!isNoItem ? (
            <SystemNotification description={<span>Hiện tại chưa có khách hàng nào.</span>} type="no-item" />
          ) : (
            <SystemNotification
              description={
                <span>
                  Không có dữ liệu trùng khớp.
                  <br />
                  Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                </span>
              }
              type="no-result"
            />
          )}
        </Fragment>
      )}

      <WebRtcPhoneModal
        onShow={showModalPhone}
        dataCustomer={dataCustomer}
        makeCall={makeCall}
        hangup={hangup}
        answer={answer}
        transfer={transfer}
        callState={callState}
        incomingNumber={incomingNumber}
        onHide={() => setShowModalPhone(false)}
      />

      <WebRtcCallIncomeModal
        onShow={showModalCallIncome}
        dataCustomer={dataCustomer}
        makeCall={makeCall}
        hangup={hangup}
        answer={answer}
        transfer={transfer}
        callState={callState}
        incomingNumber={incomingNumber}
        onHide={() => setShowModalCallIncome(false)}
      />
      {/* <AddPhoneModal onShow={showModalPhone} dataCustomer={dataCustomer} onHide={() => setShowModalPhone(false)} /> */}
      <AddManagementOpportunityModal
        onShow={showModalAddManagementOpportunity}
        idCustomer={idCustomer}
        onHide={() => setShowModalAddManagementOpportunity(false)}
      />

      <AddConsultationScheduleModal
        onShow={showModalAddConsultationScheduleModal}
        idData={null}
        idCustomer={idCustomer}
        startDate={new Date()}
        endDate={new Date(new Date().setMinutes(new Date().getMinutes() + 10))}
        onHide={(reload) => {
          if (reload) {
            // getListSchedule(params);
          }
          setShowModalAddConsultationScheduleModal(false);
        }}
      />
    </Fragment>
  );
}
