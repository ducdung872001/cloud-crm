/* eslint-disable prefer-const */
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { getDomain } from "reborn-util";
import { isArray, isObject, transform } from "lodash";
import moment from "moment";
const cookies = new Cookies();

/**
 * Tạo thông báo
 * @param {string} mgs
 * @param {string} type
 */
export const showToast = (mgs: string, type: "error" | "success" | "warning") => {
  toast[type](mgs == "un authenticated" ? "Đã hết phiên đăng nhập, đang chuyển hướng để đăng nhập lại!" : mgs, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  //Trường hợp là lỗi (type == 'error') và mgs là 'un authenticated' thì chuyển hướng về trang login
  if (type == "error" && mgs == "un authenticated") {
    //Chuyển hướng về trang login
    setTimeout(logout, 5000);
  }
};
/**
 * Kiểm tra 2 object có khác biệt nhau ko?
 * @param {*} orgObj
 * @param {*} newObj
 * @returns {boolean}
 */
export const isDifferenceObj = (orgObj, newObj) => {
  return Object.keys(differenceObj(orgObj, newObj)).length > 0;
};
/**
 * Kiểm tra 2 object có khác nhau hay ko?
 * @param {*} orgObj
 * @param {*} newObj
 * @returns {}
 */
export const differenceObj = (orgObj, newObj) => {
  function changes(newObj, orgObj): Record<string, any> {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result, value, key: string) {
      if (value != orgObj[key]) {
        const resultKey = isArray(orgObj) ? arrayIndexCounter++ : key;
        result[resultKey] = isObject(value) && isObject(orgObj[key]) ? changes(value, orgObj[key]) : value;
      }
    });
  }
  function changesReverse(orgObj, newObj): Record<string, any> {
    let arrayIndexCounter = 0;
    return transform(orgObj, function (result, value, key: string) {
      if (value != newObj[key]) {
        const resultKey = isArray(newObj) ? arrayIndexCounter++ : key;
        result[resultKey] = isObject(value) && isObject(newObj[key]) ? changesReverse(value, newObj[key]) : value;
      }
    });
  }
  if (!newObj && !orgObj) {
    return {};
  }
  if (!newObj) {
    return orgObj;
  }
  if (!orgObj) {
    return newObj;
  }
  return { ...changes(newObj, orgObj), ...changesReverse(orgObj, newObj) };
};

/**
 * Format tiền tệ
 * @param {*} num
 * @param {*} separate
 * @param {*} suffixes
 * @returns {string|number}
 */
export const formatCurrency = (num, separate = ",", suffixes = "đ", positionSuffixes = "right") => {
  if (num) {
    const s = parseInt(num).toString();
    const regex = /\B(?=(\d{3})+(?!\d))/g;
    return positionSuffixes === "right" ? s.replace(regex, separate) + suffixes : suffixes + s.replace(regex, separate);
  } else {
    return positionSuffixes === "right" ? 0 + suffixes : suffixes + 0;
  }
};


/**
 * Format dung lượng file
 * @param {*} bytes
 */

 export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};


/**
 * Lấy ra thông tin tài khoản đăng nhập là GDP or GPP
 */

export const getInfoLogin = () => {
  const takeUserTypeInLocalStorage = localStorage.getItem("user_type");

  return takeUserTypeInLocalStorage || "GPP";
};

/**
 * Xử lý get params
 * @param {string} prmstr
 * @return {object} params
 */
const transformToAssocArray = (prmstr: string) => {
  const params = {};
  const prmarr = prmstr.split("&");
  for (let i = 0; i < prmarr.length; i++) {
    const tmparr = prmarr[i].split("=");
    params[tmparr[0]] = tmparr[1];
  }
  return params;
};

/**
 * Lấy search parameter
 * @return {object} params
 */
export const getSearchParameters = () => {
  const prmstr = window.location.search.substr(1);
  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
};

/**
 * Lấy kí tự bởi code
 * @param {string} str
 * @param {number} position
 * @returns {string}
 */
export const getCharByCode = (str: string, position: number) => {
  return String.fromCharCode(str.charCodeAt(0) + position);
};

/**
 * Lấy text trong ReactElement
 * @param {React.ReactElement | string} elem
 * @param {number} position
 * @returns {string}
 */
export const getTextFromReactElement = (elem: React.ReactElement | string) => {
  if (["string"].includes(typeof elem)) return elem;
  if (elem instanceof Array) return elem.map(getTextFromReactElement).join("");
  if (typeof elem === "object" && elem) return getTextFromReactElement(elem.props.children);
};

export const getPermissions = () => {
  let permissions = localStorage.getItem("permissions");
  if (!permissions) {
    return {};
  }

  permissions = JSON.parse(permissions);
  return permissions;
};

/**
 * Chuyển hướng người dùng tới trang mặc định
 * @param returnUrl
 */
export const redirectUrl = (returnUrl: any, targetUrl: any) => {
  targetUrl = targetUrl || "/customer"; //dashboard
  let url = returnUrl || targetUrl;
  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  if (!url.startsWith("/crm/")) {
    url = "/crm" + url;
  }

  location.href = url;
};

/**
 * Chuyển đổi số tiền
 * @param total
 */
export const convertToPrettyNumber = (total: number) => {
  if (!total) {
    return `${0} <span className="currency-unit">Nghìn</span>`;
  }

  const options = {
    minimunFrationDigits: 0,
    maxnimunFrationDigits: 0,
    minimunIntegerDigits: 1,
  };

  if (total > 999000) {
    const formattedNumber = (total / 1000000).toLocaleString("vi-VN", options as any);
    return `${formattedNumber} <span className="currency-unit">Triệu</span>`;
  }

  if (total > 99000) {
    const formattedNumber = (total / 100000).toLocaleString("vi-VN", options as any);
    return `${formattedNumber} <span className="currency-unit">Trăm</span>`;
  }

  if (total > 9000) {
    const formattedNumber = (total / 10000).toLocaleString("vi-VN", options as any);
    return `${formattedNumber} <span className="currency-unit">Chục</span>`;
  }

  // total = Math.round(total / 100000) * 0.1;
  // return total.toFixed(1);
};

/**
 * Chuyển hướng về trang đăng nhập
 */
export const logout = () => {
  localStorage.removeItem("permissions");
  localStorage.removeItem("user.root");
  localStorage.removeItem("SelectedRole");

  let sourceDomain = getDomain(decodeURIComponent(document.location.href));
  let rootDomain = getRootDomain(sourceDomain);

  cookies.remove("token", {
    path: "/",
    domain: rootDomain,
  });

  //Đăng xuất về trang sso
  let sourceUri = encodeURIComponent(location.href);
  let appSSOLink = getAppSSOLink(rootDomain);
  document.location.href = `${appSSOLink}?redirect_uri=${sourceUri}&env=${process.env.APP_ENV}&domain=${rootDomain}`;
};

/**
 * Download ảnh, tài liệu trong phần chat
 * @param link
 */

export const handleDownload = async (link: string, nameData?: string) => {
  if (!link) return;

  // fetch(data, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // })
  //   .then((response) => response.blob())
  //   .then((blob) => {
  //     const url = URL.createObjectURL(blob);
  //     console.log("url : ", url);
  //   });
};

/**
 * Lấy đuôi file ảnh
 * @param file
 */

export const getFileExtension = (file) => {
  const lastIndex = file.lastIndexOf(".");
  if (lastIndex !== -1) {
    return file.slice(lastIndex + 1).toLowerCase();
  }
  return "png";
};

/**
 * Lấy ra id youtube để hiển thị ảnh
 * @return {string} params
 */

export const takeThumbnailImgYoutube = (url: string) => {
  if (!url) return;

  const params = url.split("&");

  const handleParmas = params.find((param) => param.includes("v="));

  const result = handleParmas?.slice(handleParmas.indexOf("=") + 1);

  return result;
};

/**
 * Lấy tên miền gốc
 * @param sourceDomain
 */
export const getRootDomain = (sourceDomain: string) => {
  let parts = sourceDomain?.split(".");
  let rootDomain = sourceDomain;
  if (parts.length > 2) {
    rootDomain = parts[parts.length - 2] + "." + parts[parts.length - 1];
  }

  return rootDomain;
};

export const getAppSSOLink = (rootDomain: string) => {
  if (!rootDomain || rootDomain == "localhost") {
    return "http://localhost:8080";
  }

  if (rootDomain == "tnteco.vn" || rootDomain == "apphub.vn") {
    return `https://crmsso.${rootDomain}`;
  }

  return `https://sso.${rootDomain}`;
};

/**
 * Lấy ra các khung giờ
 *@param {number} intervalMinutes // Khoảng thời gian giữa các khung giờ
 *@param {string} startTime // thời gian bắt đầu
 *@param {string} endTime // thời gian kết thúc
 */

export function listTimeSlots(startTime, endTime, intervalMinutes) {
  const timeSlots = [];
  let currentTime = moment(startTime);

  while (currentTime.isBefore(endTime)) {
    const data = {
      value: currentTime.format("HH:mm:ss"),
      label: currentTime.format("HH:mm"),
    };
    timeSlots.push(data);
    currentTime.add(intervalMinutes, "minutes");
  }

  return timeSlots;
}

/**
 * Đoạn này conver tên file gốc khi tải ảnh hoặc dữ liệu về
 * @param {string} file
 * @param {string} nameFile
 */

export const handDownloadFileOrigin = (file, nameFile) => {
  if (!file) return;

  // Tạo đối tượng XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Mở kết nối với đường dẫn URL
  xhr.open("GET", file, true);

  // Đặt kiểu dữ liệu trả về là blob
  xhr.responseType = "blob";

  // Xử lý sự kiện khi yêu cầu đã hoàn thành
  xhr.onload = function () {
    // Kiểm tra xem yêu cầu có thành công không
    if (xhr.status === 200) {
      // Tạo một Blob từ dữ liệu nhận được
      const blob = new Blob([xhr.response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      // Tạo đối tượng URL từ Blob
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ a để download
      const link = document.createElement("a");

      // Đặt tên mới cho file
      link.download = nameFile;

      // Thiết lập đường dẫn URL
      link.href = url;

      // Thêm thẻ a vào body
      document.body.appendChild(link);

      // Kích hoạt sự kiện click để download
      link.click();

      // Loại bỏ thẻ a sau khi đã sử dụng
      document.body.removeChild(link);

      // Giải phóng đối tượng URL
      window.URL.revokeObjectURL(url);
    }
  };

  // Gửi yêu cầu
  xhr.send();
};

/**
 * @param {url} string
 * @param {filename} string
 */

export const downloadImage = (imageUrl, imageName) => {
  if (!imageUrl) return;

  // Tạo đối tượng XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Mở kết nối với đường dẫn URL của ảnh
  xhr.open("GET", imageUrl, true);

  // Đặt kiểu dữ liệu trả về là blob
  xhr.responseType = "blob";

  // Xử lý sự kiện khi yêu cầu đã hoàn thành
  xhr.onload = function () {
    // Kiểm tra xem yêu cầu có thành công không
    if (xhr.status === 200) {
      // Tạo một Blob từ dữ liệu nhận được
      const blob = new Blob([xhr.response], { type: xhr.getResponseHeader("Content-Type") });

      // Tạo đối tượng URL từ Blob
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ a để download
      const link = document.createElement("a");

      // Đặt tên mới cho file
      link.download = imageName || "image_download";

      // Thiết lập đường dẫn URL
      link.href = url;

      // Thêm thẻ a vào body
      document.body.appendChild(link);

      // Kích hoạt sự kiện click để download
      link.click();

      // Loại bỏ thẻ a sau khi đã sử dụng
      document.body.removeChild(link);

      // Giải phóng đối tượng URL
      window.URL.revokeObjectURL(url);
    }
  };

  // Gửi yêu cầu
  xhr.send();
};

/**
 * radom ra số lượng ký tự tùy ý
 * @param {string} str
 * @returns {string}
 */
export const generateRandomString = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Lấy filed API
 * @param {string} str
 * @returns {string}
 */

export const getField = (str) => {
  const AccentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ",
    "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị",
    "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ",
    "YỲỶỸÝỴ",
  ];

  // Xóa dấu
  for (let i = 0; i < AccentsMap.length; i++) {
    const re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
    const char = AccentsMap[i][0];
    str = str.replace(re, char);
  }

  // Chuyển đổi chữ cái đầu tiên của chuỗi thành chữ thường
  str = str.charAt(0).toLowerCase() + str.slice(1);

  // Thay thế khoảng trắng hoặc ký tự không phải chữ cái bằng khoảng trắng và chuyển đổi chữ cái đầu tiên của từ tiếp theo thành chữ hoa
  str = str.replace(/[^a-zA-Z0-9]+(.)/g, (match, char) => char.toUpperCase());

  // Loại bỏ khoảng trắng
  str = str.replace(/\s+/g, "");

  return str;
};
