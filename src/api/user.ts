import { get, post } from '@/utils/request'

/**
 * @description: 获取图片验证码
 * @return {*}
 */
export function getPicCode<T>() {
  return get<T>({
    url: '/user/captcha',
  })
}

// returnType
export interface PicCodeType {
  // 图形验证码Base64
  base64Data: string
  // 图形验证码会话ID，注册时需要传过来
  sessionId: string
}

export interface SmsCodeRequest {
  phoneNumber: string
  captchaSessionId: string
  captchaVerifyCode: string
}
export function getSmsCode<T>(data: SmsCodeRequest) {
  return post<T>({
    url: '/user/smscode',
    data,
  })
}

export interface RegisterRequest {
  // 手机号
  phoneNumber: string
  // 短信验证码
  smsVerifyCode: string
  // 密码，MD5加密
  password: string
}
/**
 * @description: 注册
 * @param {RegisterRequest} data
 * @return {*}
 */
export function registerUser<T>(data: RegisterRequest) {
  return post<T>({
    url: '/user/register',
    data,
  })
}

export interface LoginRequest {
  phoneNumber: string
  captchaSessionId: string
  captchaVerifyCode: string
  password: string
}

/**
 * @description: 注册
 * @param {LoginRequest} data
 * @return {*}
 */
export function loginUser<T>(data: LoginRequest) {
  return post<T>({
    url: '/user/login',
    data,
  })
}

/**
 * @description: 获取用户信息
 * @return {*}
 */
export function getUserInfo<T>() {
  return get<T>({
    url: '/user/info',
  })
}

// user info
export interface UserInfo {
  userName: string
  remainCount: number
  userType: string
}

// user update request
export interface UserUpdateRequest {
  userName: string
}

/**
 * @description: 获取用户信息
 * @return {*}
 */
export function updateUserInfo<T>(data: UserUpdateRequest) {
  return post<T>({
    url: '/user/info',
    data,
  })
}
