import { UserDetailsBase } from './types.user';

export interface MastodonUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mastodonServer: string;
}

export interface MastodonUserCredentials {
  accessToken: string;
}

export type MastodonUserDetails = UserDetailsBase<
  MastodonUserProfile,
  MastodonUserCredentials,
  MastodonUserCredentials
>;

export interface MastodonGetContextParams {
  domain: string;
  callback_url: string;
  type: 'read' | 'write';
}

export interface MastodonSignupContext extends MastodonGetContextParams {
  authorizationUrl: string;
}

export interface MastodonSignupData extends MastodonGetContextParams {
  code: string;
}
