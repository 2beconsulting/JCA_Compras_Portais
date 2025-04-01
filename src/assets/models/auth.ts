export interface AuthData {
  email?: string;
  password?: string;
  recoveryMail?: string;
}

export interface AjaxRequestData {
  url: string;
  method: string;
  data?: any;
}
