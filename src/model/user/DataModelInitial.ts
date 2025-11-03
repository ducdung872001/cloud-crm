import { IForgotRequest } from "./UserRequestModel";

export const stepForgot = {
  verified_phone: "verified_phone",
  verified_otp: "verified_otp",
  new_password: "new_password",
  resend_otp: "resend_otp",
};

export const formForgotDefault: IForgotRequest = {
  phone_number: "",
  otp: "",
  password: "",
  password_confirmation: "",
  type: stepForgot.verified_phone,
};
