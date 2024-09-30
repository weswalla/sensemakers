import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { MastodonUserProfile } from '../../shared/types/types.mastodon';
import { NanopubUserProfile } from '../../shared/types/types.nanopubs';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { OrcidUserProfile } from '../../shared/types/types.orcid';
import { TwitterUserProfile } from '../../shared/types/types.twitter';
import {
  ALL_PUBLISH_PLATFORMS,
  AccountDetailsRead,
  AppUserRead,
  AutopostOption,
  EmailDetails,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../../shared/types/types.user';
import { usePersist } from '../../utils/use.persist';
import { getAccount } from '../user.helper';

const DEBUG = false;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';
export const PLATFORMS_LOGIN_STATUS = 'platformsLoginStatus';

export type AccountContextType = {
  connectedUser?: ConnectedUser;
  isConnected: boolean;
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => void;
  token?: string;
  setToken: (token: string) => void;
  setOverallLoginStatus: (status: OverallLoginStatus) => void;
  overallLoginStatus: OverallLoginStatus | undefined;
  setLoginFlowState: (status: LoginFlowState) => void;
  loginFlowState: LoginFlowState;
  resetLogin: () => void;
  currentAutopost?: AutopostOption;
  currentNotifications?: NotificationFreq;
  setPlatformConnectedStatus: (
    platform: PLATFORM,
    status: PlatformConnectedStatus
  ) => void;
  getPlatformConnectedStatus: (
    platformId: PLATFORM
  ) => PlatformConnectedStatus | undefined;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

export interface ConnectedUser extends AppUserRead {
  profiles?: {
    [PLATFORM.Twitter]: TwitterUserProfile;
    [PLATFORM.Mastodon]: MastodonUserProfile;
    [PLATFORM.Nanopub]: NanopubUserProfile;
    [PLATFORM.Orcid]: OrcidUserProfile;
  };
}

/** explicit status of the login/signup process */
export enum LoginFlowState {
  Idle = 'Idle',
  ConnectingSigner = 'ConnectingSigner',
  ComputingAddress = 'ComputingAddress',
  ComputingRSAKeys = 'ComputingsRSAKeys',
  CreatingEthSignature = 'CreatingEthSignature',
  SignningUpNanopub = 'SignningUpNanopub',
  RegisteringEmail = 'RegisteringEmail',
  ConnectingTwitter = 'ConnectingTwitter',
  ConnectingMastodon = 'ConnectingMastodon',
  BasicLoggedIn = 'BasicLoggedIn',
  Disconnecting = 'Disconnecting',
}

/** higher level status of the login flow. Persisted in localStorage helps
 * make sense of the LoginFlowState on different situations
 */
export enum OverallLoginStatus {
  NotKnown = 'NotKnown', // init value before we check localStorage
  LoggedOut = 'LoggedOut',
  LogginIn = 'LogginIn',
  PartialLoggedIn = 'PartialLoggedIn',
  FullyLoggedIn = 'FullyLoggedIn',
}

export enum PlatformConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
}

export type PlatformsConnectedStatus = Partial<
  Record<PLATFORM, PlatformConnectedStatus>
>;

const platformsConnectedStatusInit: PlatformsConnectedStatus = {};
ALL_PUBLISH_PLATFORMS.forEach((platform) => {
  platformsConnectedStatusInit[platform] = PlatformConnectedStatus.Disconnected;
});

/**
 * Manages the logged-in user. We use JWT tokens to authenticate
 * a logged in user to our backend. The JWT is set when the user
 * logsin or sign up with any supported platform, and is stored
 * in the localStorage
 */
export const AccountContext = (props: PropsWithChildren) => {
  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>();

  const [loginFlowState, _setLoginFlowState] = useState<LoginFlowState>(
    LoginFlowState.Idle
  );

  const [token, setToken] = usePersist<string>(OUR_TOKEN_NAME, null);
  const [overallLoginStatus, _setOverallLoginStatus] =
    usePersist<OverallLoginStatus>(LOGIN_STATUS, OverallLoginStatus.NotKnown);

  const [platformsConnectedStatus, setPlatformsConnectedStatus] =
    usePersist<PlatformsConnectedStatus>(
      PLATFORMS_LOGIN_STATUS,
      platformsConnectedStatusInit
    );

  /** keep the conneccted user linkted to the current token */
  useEffect(() => {
    refresh();
  }, [token]);

  const setOverallLoginStatus = (status: OverallLoginStatus) => {
    if (DEBUG) console.log('setOverallLoginStatus', status);
    _setOverallLoginStatus(status);
  };

  const setLoginFlowState = (status: LoginFlowState) => {
    if (DEBUG) console.log('setLoginFlowState', status);
    _setLoginFlowState(status);
  };

  const resetLogin = () => {
    setLoginFlowState(LoginFlowState.Idle);
    setOverallLoginStatus(OverallLoginStatus.NotKnown);
  };

  const refresh = async () => {
    try {
      if (token) {
        if (DEBUG) console.log('getting me', { token });
        const user = await _appFetch<AppUserRead>('/api/auth/me', {}, token);
        if (DEBUG) console.log('set connectedUser after fetch', { user });
        setConnectedUser(user);
      } else {
        if (DEBUG) console.log('setting connected user as null');
        setConnectedUser(null);
      }
    } catch (e) {
      setToken(null);
    }
  };

  /** logged in status is strictly linked to the connected user,
   * this should be the only place on the app where the status is set to loggedIn
   */
  useEffect(() => {
    if (DEBUG)
      console.log('overallStatus update effect', {
        connectedUser,
        overallLoginStatus,
        twitter: connectedUser?.email,
      });

    /**
     * once connected user is defined and has an email, but there is no
     * twitter, the user is partially logged in
     */
    if (connectedUser && connectedUser.email) {
      /** if not a single platform has been connected, consider login partial */
      if (
        !connectedUser.profiles ||
        Object.keys(connectedUser.profiles).length === 0
      ) {
        setOverallLoginStatus(OverallLoginStatus.PartialLoggedIn);
      }

      /** update each platform persisted connected status */
      ALL_PUBLISH_PLATFORMS.forEach((platform) => {
        if (
          connectedUser.profiles &&
          connectedUser.profiles[platform] &&
          loginFlowState !== LoginFlowState.Disconnecting
        ) {
          setPlatformsConnectedStatus({
            ...platformsConnectedStatus,
            [platform]: PlatformConnectedStatus.Connected,
          });
        }
      });

      /** enable fully logged in when at least one platform is connected */
      if (connectedUser.profiles) {
        const some = Object.keys(connectedUser.profiles)
          .map(
            (platform) =>
              connectedUser.profiles &&
              connectedUser.profiles[platform as PUBLISHABLE_PLATFORM] !==
                undefined
          )
          .some((profile) => profile);

        if (some) {
          setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
        }
      }
    }

    /**
     * once the user is partiallyLoggedIn and has a twitter profile
     * then the user is FullyLoggedIn
     */

    /** If finished fetching for connected user and is undefined, then
     * the status is not not-known, its a confirmed LoggedOut */
    if (
      overallLoginStatus === OverallLoginStatus.NotKnown &&
      connectedUser === undefined
    ) {
      disconnect();
    }
  }, [connectedUser, overallLoginStatus, token, loginFlowState]);

  const disconnect = () => {
    setConnectedUser(undefined);
    setToken(null);

    ALL_PUBLISH_PLATFORMS.forEach((platform) => {
      setPlatformsConnectedStatus({
        ...platformsConnectedStatus,
        [platform]: PlatformConnectedStatus.Disconnected,
      });
    });

    _setLoginFlowState(LoginFlowState.Idle);
    _setOverallLoginStatus(OverallLoginStatus.LoggedOut);
  };

  const twitterProfile = useMemo(() => {
    const profile = connectedUser
      ? getAccount(connectedUser, PLATFORM.Twitter)?.profile
      : undefined;

    if (DEBUG) console.log('twitterProfile', { profile });

    return profile;
  }, [connectedUser]);

  const mastodonProfile = useMemo(() => {
    const profile = connectedUser
      ? getAccount(connectedUser, PLATFORM.Mastodon)?.profile
      : undefined;

    if (DEBUG) console.log('mastodonProfile', { profile });

    return profile;
  }, [connectedUser]);

  const orcid = useMemo(() => {
    const profile = connectedUser
      ? getAccount<OrcidUserProfile>(connectedUser, PLATFORM.Orcid)
      : undefined;

    if (DEBUG) console.log('orcidProfile', { profile });

    return profile;
  }, [connectedUser]);

  const currentAutopost =
    connectedUser?.settings?.autopost[PLATFORM.Nanopub].value;

  const currentNotifications = connectedUser?.settings?.notificationFreq;

  const email = connectedUser ? connectedUser.email : undefined;

  const setPlatformConnectedStatus = (
    platformId: PLATFORM,
    status: PlatformConnectedStatus
  ) => {
    setPlatformsConnectedStatus({
      ...platformsConnectedStatus,
      [platformId]: status,
    });
  };

  const getPlatformConnectedStatus = (
    platformId: PLATFORM
  ): PlatformConnectedStatus | undefined => {
    return platformsConnectedStatus && platformsConnectedStatus[platformId];
  };

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        email,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        disconnect,
        refresh,
        token,
        setToken,
        setOverallLoginStatus,
        overallLoginStatus,
        loginFlowState,
        setLoginFlowState,
        resetLogin,
        currentAutopost,
        currentNotifications,
        setPlatformConnectedStatus,
        getPlatformConnectedStatus,
      }}>
      {props.children}
    </AccountContextValue.Provider>
  );
};

export const useAccountContext = (): AccountContextType => {
  const context = useContext(AccountContextValue);
  if (!context) throw Error('context not found');
  return context;
};
