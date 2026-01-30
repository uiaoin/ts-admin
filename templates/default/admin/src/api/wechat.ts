import { http } from '@/utils/request';

/**
 * 获取微信授权URL
 */
export function getWechatAuthUrl(redirectUri: string): Promise<{ authUrl: string }> {
  return http.get('/wechat/auth-url', { params: { redirectUri } });
}

/**
 * 微信授权登录（前端传code方式）
 */
export function wechatLogin(code: string, state?: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
}> {
  return http.post('/wechat/login', { code, state });
}

/**
 * 绑定微信账号
 */
export function bindWechat(code: string): Promise<{ id: number; wechatOpenId: string }> {
  return http.post('/wechat/bind', { code });
}

/**
 * 解绑微信账号
 */
export function unbindWechat(): Promise<boolean> {
  return http.post('/wechat/unbind');
}
