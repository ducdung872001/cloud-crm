export const EMAIL_REGEX =
  "(^((([a-z]|d|[!#$%&'*+-/=?^_`{|}~]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])+(.([a-z]|d|[!#$%&'*+-/=?^_`{|}~]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])+)*)|((x22)((((x20|x09)*(x0dx0a))?(x20|x09)+)?(([x01-x08x0bx0cx0e-x1fx7f]|x21|[x23-x5b]|[x5d-x7e]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])|(([x01-x09x0bx0cx0d-x7f]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF]))))*(((x20|x09)*(x0dx0a))?(x20|x09)+)?(x22)))@((([a-z]|d|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])|(([a-z]|d|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])([a-z]|d|-|.|_|~|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])*([a-z]|d|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF]))).)+(([a-z]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])|(([a-z]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])([a-z]|d|-|.|_|~|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF])*([a-z]|[u00A0-uD7FFuF900-uFDCFuFDF0-uFFEF]))).?$)|(\\*)";

// số điên thoại của đối tác 
const TEN_DIGIT_NUMBER = "^\\d{10}$";
const TEN_DIGITS_WITH_SEPARATORS = "^(\\d{3}[- .]?){2}\\d{4}$";
const TEN_DIGITS_WITH_PARENTHESIS = "^((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$";
const INTERNATIONAL_PREFIX = "^(\\(\\+\\d{1,3}\\)[ .-]?\\d{3}[ .-]?\\d{3}[ .-]?\\d{3,4}|\\+\\d{1,3}[ .-]?\\d{3}[ .-]?\\d{3}[ .-]?\\d{3,4}|\\+?\\d{1}[ .-]?\\d{3}[ .-]?\\d{3}[ .-]?\\d{4}|\\d{10,11})$";

export const PHONE_REGEX = [
  TEN_DIGIT_NUMBER,
  TEN_DIGITS_WITH_SEPARATORS,
  TEN_DIGITS_WITH_PARENTHESIS,
  INTERNATIONAL_PREFIX
].join("|");

export const PHONE_REGEX_NEW = /^0[0-9]{9}$/;
// Mã hóa đơn
//* Hóa đơn mua (dịch vụ | sản phẩm)
export const INVOICE_PURCHASE = "IV1";

//* Hóa đơn khách hàng hoàn trả (dịch vụ|sản phẩm|thẻ dịch vụ)
export const INVOICE_RETURN_CUSTOMER = "IV2";

//* Mã tên đối tác không được là số
export const PARTNER_NAME_REGEX = /^[A-Za-zÀ-ỹ\s]*$/;

//* Mã số thuế regex 
export const TAX_CODE_REGEX = /^(?:\d{10}|\d{13})$/;

//* Mã đối tác 
export const PARTNER_CODE_REGEX = /^[A-Za-z0-9]+$/;

//* Hóa đơn mua thẻ dịch vụ
export const INVOICE_PURCHASE_CARD = "IV3";

//* Hóa đơn nhập hàng
export const INVOICE_IMPORT = "IV4";

//* Hóa đơn nhập tồn
export const INVOICE_IMPORT_INIT = "IV5";

//* Hóa đơn xuất hủy
export const INVOICE_EXPORT_DESTROY = "IV6";

//* Phiếu yêu cầu điều chỉnh kho
export const INVOICE_ADJUST_INVENTORY = "IV7";

//* Hóa đơn trả hàng nhà cung cấp
export const INVOICE_RETURN_PROVIDER = "IV8";

//* Lịch sử tiêu dùng thẻ dịch vụ (thẻ đa năng)
export const HISTORY_USE_CARD_SERVICE = "IV9";

//Định nghĩa dung lượng file ảnh (25M)
export const FILE_IMAGE_MAX = 26214400;

//Định nghĩa dung lượng file video (500M)
export const FILE_VIDEO_MAX = 524288000;

//Định nghĩa file khác (200M)
export const FILE_OTHER_MAX = 209715200;

//Định nghĩa file khác (50M)
export const FILE_DOC_MAX = 209715200;

//* ĐỊNH NGHĨA REGEX CỦA KHÁCH HÀNG

//*TÀI CHÍNH

// Tháng từ 1 đến 12
export const MONTH_REPORT_REGEX = /^(0?[1-9]|1[0-2])$/; 