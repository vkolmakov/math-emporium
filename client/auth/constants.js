import { getOrigin } from '../utils';

export const BASE_URL = '/api/auth';
export const OAUTH2_SIGNIN_URL = `${BASE_URL}/oauth2/signin`;
export const OAUTH2_PROVIDER_SIGNOUT_URL =
    `https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${getOrigin()}`;
