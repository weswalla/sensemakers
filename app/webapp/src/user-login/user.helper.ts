import { Restaurant } from 'grommet-icons';

import {
  AccountDetailsRead,
  AppUserRead,
  PLATFORM,
} from '../shared/types/types.user';

export const getAccount = <P = any>(
  user?: AppUserRead,
  platformId?: PLATFORM,
  user_id?: string,
  username?: string
) => {
  if (!user) {
    return undefined;
  }

  if (!platformId) {
    return undefined;
  }

  if (platformId === PLATFORM.Local) {
    throw Error('undexpected');
  }

  const accounts = user.accounts[platformId] as
    | AccountDetailsRead<P>[]
    | undefined;

  if (!accounts) {
    return undefined;
  }

  if (accounts.length === 0) {
    return undefined;
  }

  return user_id === undefined
    ? accounts[0]
    : accounts.find((a) =>
        user_id
          ? a.user_id === user_id
          : username && (a.profile as any).username !== undefined
            ? (a.profile as any).username === username
            : false
      );
};

export const isValidMastodonServer = (input: string): boolean => {
  const mastodonServerRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return mastodonServerRegex.test(input);
};
