export interface IUserRequest {
  id?: number | string;
  name: string;
  avatar?: string;
  phone?: string;
  phoneVerified: number;
  email: string;
  plainPassword: string;
  isCollaborator: number;
  seeder: number;
  role?: string;
  newPassword?: string;
  userId?: number | string;
}

export interface IUserLoginRequest {
  phone: string;
  plainPassword: string;  
}

export interface ISelectUsersFilterRequest {
  query?: string;
  page?: number;
  limit?: number;
}

export interface IForgotRequest {
  username?: string;
  phone_number: string;
  otp: string;
  password: string;
  password_confirmation: string;
  type: string;
}

export interface IChangePasswordRequest {
  plainPassword: string;
  newPassword: string;
  retypeNewPassword: string;
}
