import React, { Fragment, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import InfoPerson from "./partials/InfoPerson/InfoPerson";
import ViewDetailPerson from "./partials/ViewDetailPerson/ViewDetailPerson";
import ListDetailTab from "./partials/ListDetailTab/ListDetailTab";
import { useWindowDimensions } from "utils/hookCustom";
import AddCustomerEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/AddCustomerEmailModal";
import AddCustomPlaceholderEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddCustomerSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";
import AddCustomPlaceholderSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";
import * as SIP from "sip.js";

import "./DetailPersonList.scss";
import { getDomain } from "reborn-util";
import ModalCalling from "./partials/ModalCalling/ModalCalling";
import ringtone from "assets/sounds/phone_calling.wav";

export default function DetailPersonList() {
  document.title = "Chi tiết khách hàng";
  const remoteAudioRef = useRef(null);
  const { width } = useWindowDimensions();
  const { id } = useParams();
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");
  const takeUrlCustomerLocalStorage = JSON.parse(localStorage.getItem("backUpUrlCustomer") || "");
  console.log("takeUrlCustomerLocalStorage", takeUrlCustomerLocalStorage);
  const accessTokenAthenaLocal = localStorage.getItem("access_token_athena") || "";

  const [accessTokenAthena, setAccessTokenAthena] = useState(accessTokenAthenaLocal);
  console.log("accessTokenAthena", accessTokenAthena);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailPerson, setDetailPerson] = useState(null);

  const [deleteSignal, setDeleteSignal] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<string>("");
  const [codes, setCodes] = useState(null);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);
  const [showModalCalling, setShowModalCalling] = useState(false);
  console.log("showModalCalling", showModalCalling);
  const [statusCalling, setStatusCalling] = useState({
    title: "",
    status: "",
  });

  const getDetailPerson = async () => {
    setIsLoading(true);
    const response = await CustomerService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailPerson(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  const [dataOther, setDataOther] = useState([]);

  const handleMergeData = (dataAttribute, dataExtraInfo) => {
    const result = dataExtraInfo
      .map((item) => {
        for (const key in dataAttribute) {
          const foundItem = dataAttribute[key].find((objItem) => objItem.id === item.attributeId);
          if (foundItem) {
            return {
              value: item.attributeValue,
              label: foundItem.name,
            };
          }
        }
        return null;
      })
      .filter((item) => item !== null);

    setDataOther(result);
  };

  useEffect(() => {
    if (detailPerson) {
      handleMergeData(detailPerson.mapCustomerAttribute, detailPerson.lstCustomerExtraInfo || []);
    }
  }, [detailPerson]);

  useEffect(() => {
    if (id && !deleteSignal) {
      getDetailPerson();
    }
  }, [id, deleteSignal]);

  const lstInteract = [
    {
      value: 1,
      label: "Đặt lịch hẹn",
      icon: <Icon name="CalendarFill" />,
      type: "calendar",
    },
    {
      value: 2,
      label: "Tạo công việc",
      icon: <Icon name="Job" />,
      type: "job",
    },
    {
      value: 3,
      label: "Call",
      icon: <Icon name="CallPhone" />,
      type: "call",
    },
    {
      value: 4,
      label: "Email",
      icon: <Icon name="EmailFill" />,
      type: "email",
    },
    {
      value: 5,
      label: "SMS",
      icon: <Icon name="SMS" />,
      type: "sms",
    },
  ];

  //Tổng đài
  const audioRef = useRef(new Audio(ringtone));
  const [userAgentAll, setUserAgentAll] = useState(null);
  const [sessionAll, setSessionAll] = useState(null); // Active call session
  const [seconds, setSeconds] = useState(0); // Số giây đã đếm
  const [isRunning, setIsRunning] = useState(false); // Trạng thái của đồng hồ
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(timer); // Xóa timer khi component bị hủy hoặc khi dừng
  }, [isRunning]);

  useEffect(() => {
    const config = {
      uri: "sip:athena_101057@pbx-athenaspear-prod.athenafs.io",
      wsServers: ["wss://pbx-athenaspear-prod.athenafs.io:7443"],
      authorizationUser: "athena_101057",
      password: "B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR",
      traceSip: true, // Log SIP messages for debugging
    };

    const audioElement = document.createElement("audio");
    audioElement.setAttribute("autoPlay", "true");
    audioElement.style.display = "none";
    remoteAudioRef.current = audioElement;

    document.body.appendChild(audioElement);

    const userAgent = new SIP.WebRTC.Simple({
      media: {
        remote: {
          audio: remoteAudioRef.current,
        },
      },
      ua: config,
    });

    // Lắng nghe các sự kiện từ User Agent
    userAgent.on("registered", () => console.log("Registered successfully!"));
    userAgent.on("unregistered", () => console.log("Unregistered"));
    userAgent.on("registrationFailed", (error) => console.error("Registration failed:", error));
    userAgent.on("invite", (session) => console.log("Incoming call:", session));
    setUserAgentAll(userAgent);
  }, []);
  // Cấu hình SIP User Agent

  const getAccountCall = async () => {
    const response = await CustomerService.getAccountCall();

    if (response.code === 0) {
      const result = response.result;
      if (result.length > 0 && result[0]) {
        const config = result[0].configs && JSON.parse(result[0].configs);
        const accountCall = {
          username: config.username,
          password: config.password,
        };
        loginAccountAthena(accountCall);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const loginAccountAthena = async (accountCall) => {
    const response = await CustomerService.loginAccountAthena({
      username: accountCall.username,
      password: accountCall.password,
    });

    if (response?.error_code === 0 && response?.data?.access_token) {
      // createCall(response?.data?.access_token);
      setAccessTokenAthena(response?.data?.access_token);
      localStorage.setItem("access_token_athena", response?.data?.access_token);
    } else {
      showToast(response.error_msg ? `${response.error_msg} Không thể thực hiện cuộc gọi` : "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const createCall = async (accessTokenAthena, phone) => {
    const url = "https://api-athenaspear-prod.athenafs.io/api/v1/call-history/create-call";
    const headers = {
      "Content-Type": "application/json",
      "x-access-token": accessTokenAthena,
      // "x-access-token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMTA1NywiY29tcGFueV9pZCI6NiwicyI6ImlRVGV2Y1A0aDE0NzZVMXQxaW9aRTY1dTVqeWJnRDJIdTVsWlU4dmsiLCJpYXQiOjE3MzYxODUyMDUsImV4cCI6MTczNjE4ODgwNX0.wF0EwTQto91jFzMt5ntxtRcWMijAAp80CITXRjpwjbnDS2AoDtlxNDfohx6B4HxsVhcIgNsxN7DiuiGBjCZgWS-o7ghnv3cTzyneuBCWreID_QrK2NW4FZjDbOEesTmx41zV8oqfv1-xX8VdkbXls4IFp3ZqDtuGgQFeDyIMmTFenN7N5MokmP_JHzo-iwybEwVexzA-RjbjQ3gb-eLBd7IFWTZOrlFj4SqaImZnHvsS7Yb1qQ82tYJWTs-yTcChjhXQFn828n2oqGkX6BQN1RSkmK0Z8C8pBAdRYl6eOPQdZlOwtmPxF7Dx15NoWKzxKUFzZ8UipC4uvW9oMg6Q3A",
    };

    const body = {
      phone: phone,
      campaign_id: 2207,
    };
    const response: any = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    }).then((res) => res.json());

    console.log("responseCreateCall", response);

    if (response?.error_code === 0) {
      makeCall(phone, response.data);
      setShowModalCalling(true);
    } else {
      if (response.error_msg === "Permission denied") {
        getAccountCall();
        showToast("Đã hết phiên thực hiện cuộc gọi!. Vui lòng bấm gọi lần nữa để thực hiện lại cuộc gọi", "error");
      } else {
        showToast(response.error_msg ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  useEffect(() => {
    if (id && checkSubdomainTNEX) {
      if (accessTokenAthena) {
        // createCall(accessTokenAthena);
      } else {
        getAccountCall();
      }
    }
  }, [id, checkSubdomainTNEX, accessTokenAthena]);

  // End the call
  const endCall = () => {
    if (sessionAll) {
      sessionAll.terminate();
      console.log("Call ended.");
      // setIsRunning(false);
    } else {
      console.error("No active call to end.");
    }
    if (audioRef.current) {
      audioRef.current.pause(); // Stop waiting sound
    }
  };

  const makeCall = async (phone, dataCreateCall) => {
    // const target = `sip:${phone}@pbx-athenaspear-prod.athenafs.io`; // Số hoặc SIP URI
    console.log("phone", phone);
    const hotline = dataCreateCall.hotline;
    console.log("hotline", hotline);

    // const target = `25603355_0996623235_${phone}@pbx-athenaspear-prod.athenafs.io`;
    // const target = `26298974_0996416571_${phone}@pbx-athenaspear-prod.athenafs.io`
    const target = `${dataCreateCall.call_id}_${hotline[0]}_${phone}@pbx-athenaspear-prod.athenafs.io`;

    // Thực hiện cuộc gọi
    const session = userAgentAll.call(target);
    setSessionAll(session);
    // Kiểm tra nếu `session` tồn tại và có các sự kiện
    console.log("session", session);

    if (session) {
      // Lắng nghe các trạng thái của cuộc gọi
      session.on("progress", () => {
        console.log("Đang đổ chuông...");
        setStatusCalling({
          status: "progress",
          title: "Đang đổ chuông...",
        });

        console.log("audioRef.current", audioRef.current);

        if (audioRef.current) {
          audioRef.current.play(); // Play waiting sound
        }
      });

      session.on("accepted", () => {
        console.log("Cuộc gọi đã được chấp nhận!");
        setStatusCalling({
          status: "accepted",
          title: "Cuộc gọi đã được chấp nhận!",
        });
        if (audioRef.current) {
          audioRef.current.pause(); // Stop waiting sound
        }
        setIsRunning(true);
      });

      session.on("confirmed", () => {
        console.log("Cuộc gọi đang diễn ra...");
        setStatusCalling({
          status: "confirmed",
          title: "Cuộc gọi đang diễn ra...",
        });
      });

      session.on("terminated", () => {
        console.log("Cuộc gọi kết thúc.");
        setStatusCalling({
          status: "terminated",
          title: "Cuộc gọi kết thúc.",
        });
        if (audioRef.current) {
          audioRef.current.pause(); // Stop waiting sound
          // audioRef.current.currentTime = 0; // Reset audio to start
        }
        setSessionAll(null);
        setIsRunning(false);
      });

      session.on("failed", (error) => {
        console.log("Cuộc gọi thất bại:", error);
        setStatusCalling({
          status: "failed",
          title: "Cuộc gọi thất bại:",
        });
        if (audioRef.current) {
          audioRef.current.pause(); // Stop waiting sound
        }
        setIsRunning(false);
      });
    } else {
      console.log("Không thể khởi tạo cuộc gọi!");
    }

    // userAgent.call(target);

    // // Lắng nghe sự kiện
    // userAgent.on("ringing", () => {
    //   console.log("The call is ringing!");
    // });

    // userAgent.on("progress", () => {
    //   console.log("The call is ringing!");
    // });

    // userAgent.on("ended", () => {
    //   console.log("The call has ended!");
    // });

    // userAgent.on("failed", (error) => {
    //   console.error("Call failed:", error);
    // });
  };

  const backScreenList = () => {
    navigate(
      `/customer?contactType=${takeUrlCustomerLocalStorage.contactType}&page=${takeUrlCustomerLocalStorage?.page || 1}&limit=${
        takeUrlCustomerLocalStorage?.limit || 10
      }` +
        `${takeUrlCustomerLocalStorage.keyword ? `&keyword=${takeUrlCustomerLocalStorage.keyword}` : ""}` +
        `${takeUrlCustomerLocalStorage.custType ? `&custType=${takeUrlCustomerLocalStorage.custType}` : ""}` +
        `${takeUrlCustomerLocalStorage.checkDebt ? `&checkDebt=${takeUrlCustomerLocalStorage.checkDebt}` : ""}` +
        `${takeUrlCustomerLocalStorage.cgpId ? `&cgpId=${takeUrlCustomerLocalStorage.cgpId}` : ""}` +
        `${takeUrlCustomerLocalStorage.careerId ? `&careerId=${takeUrlCustomerLocalStorage.careerId}` : ""}` +
        `${takeUrlCustomerLocalStorage.sourceId ? `&sourceId=${takeUrlCustomerLocalStorage.sourceId}` : ""}` +
        `${takeUrlCustomerLocalStorage.employeeId ? `&employeeId=${takeUrlCustomerLocalStorage.employeeId}` : ""}` +
        `${takeUrlCustomerLocalStorage.projectId ? `&projectId=${takeUrlCustomerLocalStorage.projectId}` : ""}` +
        `${takeUrlCustomerLocalStorage.serviceId ? `&serviceId=${takeUrlCustomerLocalStorage.serviceId}` : ""}` +
        `${takeUrlCustomerLocalStorage.uploadId ? `&uploadId=${takeUrlCustomerLocalStorage.uploadId}` : ""}` +
        `${takeUrlCustomerLocalStorage.filterId ? `&filterId=${takeUrlCustomerLocalStorage.filterId}` : ""}` +
        `${takeUrlCustomerLocalStorage.numCall ? `&numCall=${takeUrlCustomerLocalStorage.numCall}` : ""}` +
        `${takeUrlCustomerLocalStorage.callStatus ? `&callStatus=${takeUrlCustomerLocalStorage.callStatus}` : ""}` +
        `${takeUrlCustomerLocalStorage.callStartDate ? `&callStartDate=${takeUrlCustomerLocalStorage.callStartDate}` : ""}` +
        `${takeUrlCustomerLocalStorage.callEndDate ? `&callEndDate=${takeUrlCustomerLocalStorage.callEndDate}` : ""}` +
        `${takeUrlCustomerLocalStorage.startSyncDate ? `&startSyncDate=${takeUrlCustomerLocalStorage.startSyncDate}` : ""}` +
        `${takeUrlCustomerLocalStorage.endSyncDate ? `&endSyncDate=${takeUrlCustomerLocalStorage.endSyncDate}` : ""}` +
        `${
          takeUrlCustomerLocalStorage.employeeAssignStartDate ? `&employeeAssignStartDate=${takeUrlCustomerLocalStorage.employeeAssignStartDate}` : ""
        }` +
        `${takeUrlCustomerLocalStorage.employeeAssignEndDate ? `&employeeAssignEndDate=${takeUrlCustomerLocalStorage.employeeAssignEndDate}` : ""}` +
        `${takeUrlCustomerLocalStorage.customerExtraInfo ? `&customerExtraInfo=${takeUrlCustomerLocalStorage.customerExtraInfo}` : ""}` +
        `${
          takeUrlCustomerLocalStorage.Trangthaikhoanvaycashloan
            ? `&Trangthaikhoanvaycashloan=${takeUrlCustomerLocalStorage.Trangthaikhoanvaycashloan}`
            : ""
        }` +
        `${
          takeUrlCustomerLocalStorage.Trangthaikhoanvaycreditline
            ? `&Trangthaikhoanvaycreditline=${takeUrlCustomerLocalStorage.Trangthaikhoanvaycreditline}`
            : ""
        }` +
        `${
          takeUrlCustomerLocalStorage.TrangThaiKhoanVayTBoss ? `&TrangThaiKhoanVayTBoss=${takeUrlCustomerLocalStorage.TrangThaiKhoanVayTBoss}` : ""
        }` +
        `${takeUrlCustomerLocalStorage.TrangthaiOnboard ? `&TrangthaiOnboard=${takeUrlCustomerLocalStorage.TrangthaiOnboard}` : ""}` +
        `${takeUrlCustomerLocalStorage.LyDo ? `&LyDo=${takeUrlCustomerLocalStorage.LyDo}` : ""}` +
        `${takeUrlCustomerLocalStorage.employeeIds ? `&employeeIds=${takeUrlCustomerLocalStorage.employeeIds}` : ""}` +
        `${takeUrlCustomerLocalStorage.sourceIds ? `&sourceIds=${takeUrlCustomerLocalStorage.sourceIds}` : ""}` +
        `${takeUrlCustomerLocalStorage.callStatuses ? `&callStatuses=${takeUrlCustomerLocalStorage.callStatuses}` : ""}` +
        `${takeUrlCustomerLocalStorage.LyDo ? `&marketingSendLeadSource=${takeUrlCustomerLocalStorage.marketingSendLeadSource}` : ""}` +
        `${
          takeUrlCustomerLocalStorage.cashLoanApproveStartDate
            ? `&cashLoanApproveStartDate=${takeUrlCustomerLocalStorage.cashLoanApproveStartDate}`
            : ""
        }` +
        `${
          takeUrlCustomerLocalStorage.cashLoanApproveEndDate ? `&cashLoanApproveEndDate=${takeUrlCustomerLocalStorage.cashLoanApproveEndDate}` : ""
        }` +
        `${
          takeUrlCustomerLocalStorage.creditLineApproveStartDate
            ? `&creditLineApproveStartDate=${takeUrlCustomerLocalStorage.creditLineApproveStartDate}`
            : ""
        }` +
        `${
          takeUrlCustomerLocalStorage.creditLineApproveEndDate
            ? `&creditLineApproveEndDate=${takeUrlCustomerLocalStorage.creditLineApproveEndDate}`
            : ""
        }` +
        `${takeUrlCustomerLocalStorage.tBossApproveStartDate ? `&tBossApproveStartDate=${takeUrlCustomerLocalStorage.tBossApproveStartDate}` : ""}` +
        `${takeUrlCustomerLocalStorage.tBossApproveEndDate ? `&tBossApproveEndDate=${takeUrlCustomerLocalStorage.tBossApproveEndDate}` : ""}`
    );
  };

  return (
    <div className="page-content page-detail-person">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              // navigate(`/customer?contactType=${takeUrlCustomerLocalStorage.contactType}&page=${takeUrlCustomerLocalStorage?.page || 1}`);
              backScreenList();
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              backScreenList();
            }}
          />
          <h1 className="title-last" title={width < 1400 ? "Chi tiết khách hàng" : ""}>
            Chi tiết khách hàng
          </h1>
        </div>

        <div className="action-interact">
          {lstInteract.map((item, idx) => {
            return checkSubdomainTNEX ? (
              item.type === "call" ? (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => {
                    if (item.type === "call") {
                      if (detailPerson.phoneUnmasked) {
                        // makeCall(detailPerson.phoneUnmasked);
                        // setShowModalCalling(true);
                        if (accessTokenAthena) {
                          createCall(accessTokenAthena, detailPerson.phoneUnmasked);
                        } else {
                          showToast("Bạn chưa có tài khoản để gọi Telesale", "error");
                        }
                      } else {
                        showToast("Chưa có số điện thoại", "error");
                      }

                      // makeCall('0962829352')
                      // setShowModalCalling(true);
                    } else {
                      setShowModalAdd(true);
                      setShowTypeModal(item.type);
                    }
                  }}
                >
                  {item.icon} {item.label}
                </Button>
              ) : null
            ) : (
              <Button
                key={idx}
                variant="outline"
                onClick={() => {
                  if (item.type === "call") {
                    // if(detailPerson.phoneUnmasked){
                    //   makeCall(detailPerson.phoneUnmasked);
                    //   setShowModalCalling(true);
                    // } else {
                    //   showToast('Chưa có số điện thoại', 'error');
                    // }
                    // makeCall('0962829352');
                    // setShowModalCalling(true);
                  } else {
                    setShowModalAdd(true);
                    setShowTypeModal(item.type);
                  }
                }}
              >
                {item.icon} {item.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="card-box d-flex flex-column">
        {!isLoading && detailPerson !== null ? (
          <Fragment>
            <div className="info-person">
              <InfoPerson data={detailPerson} />
            </div>
            <div className="info-action-detail">
              <ViewDetailPerson
                data={detailPerson}
                callback={getDetailPerson}
                setDeleteSignal={setDeleteSignal}
                dataOther={dataOther}
                deleteSignal={deleteSignal}
              />
              <ListDetailTab data={detailPerson} />
            </div>
          </Fragment>
        ) : isLoading ? (
          <Loading />
        ) : (
          ""
        )}
      </div>

      {showTypeModal && showTypeModal == "job" ? (
        <div>Công việc </div>
      ) : showTypeModal == "calendar" ? (
        <AddConsultationScheduleModal
          onShow={showModalAdd}
          onHide={(reload) => {
            if (reload) {
              //
            }

            setShowModalAdd(false);
          }}
          idCustomer={detailPerson?.id}
          startDate={new Date()}
        />
      ) : showTypeModal == "sms" ? (
        <Fragment>
          <AddCustomerSMSModal
            onShow={showModalAdd}
            idCustomer={detailPerson?.id}
            callback={(codes) => {
              setCodes(codes);
              setShowModalPlaceholder(true);
            }}
            onHide={(reload) => {
              if (reload) {
                //
              }
              setShowModalAdd(false);
            }}
          />

          <AddCustomPlaceholderSMSModal
            onShow={showModalPlaceholder}
            data={codes}
            onHide={(reload) => {
              if (reload) {
                //
              }
              setShowModalPlaceholder(false);
            }}
          />
        </Fragment>
      ) : showTypeModal == "email" ? (
        <Fragment>
          <AddCustomerEmailModal
            onShow={showModalAdd}
            dataCustomer={detailPerson}
            callback={(codes) => {
              setCodes(codes);
              setShowModalPlaceholder(true);
            }}
            onHide={(reload) => {
              if (reload) {
                //
              }
              setShowModalAdd(false);
            }}
          />

          <AddCustomPlaceholderEmailModal
            onShow={showModalPlaceholder}
            data={codes}
            onHide={(reload) => {
              if (reload) {
                //
              }
              setShowModalPlaceholder(false);
            }}
          />
        </Fragment>
      ) : (
        <AddPhoneModal onShow={showModalAdd} dataCustomer={detailPerson} onHide={() => setShowModalAdd(false)} />
      )}
      <ModalCalling
        onShow={showModalCalling}
        statusCall={statusCalling}
        dataCustomer={detailPerson}
        endCall={endCall}
        seconds={seconds}
        onHide={(reload) => {
          if (reload) {
            //
          }
          setShowModalCalling(false);
          setSessionAll(null);
          setStatusCalling({
            title: "",
            status: "",
          });
          setSeconds(0);
        }}
      />
      <audio ref={audioRef} src={ringtone} loop />
    </div>
  );
}
