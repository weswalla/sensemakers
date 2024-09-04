import { SciFilterClassfication } from '../../@shared/types/types.parser';
import { AppPostFull } from '../../@shared/types/types.posts';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../@shared/types/types.user';
import { UsersHelper } from '../../users/users.helper';

export const prepareNanopubDetails = (user: AppUser, post: AppPostFull) => {
  // platform accounts
  const nanopubAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Nanopub,
    undefined,
    true
  );

  const twitterAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Twitter,
    undefined
  );
  const mastodonAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Mastodon,
    undefined
  );

  if (!twitterAccount && !mastodonAccount) {
    throw new Error('Twitter or Mastodon account not found');
  }

  const orcidAccount = UsersHelper.getAccount(user, PLATFORM.Orcid, undefined);

  // parameters
  const introUri = nanopubAccount.profile?.introNanopubUri;

  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const platformUsername = (() => {
    if (twitterAccount) return twitterAccount.profile?.username;
    if (mastodonAccount) return mastodonAccount.profile?.username;
  })();
  const platformName = (() => {
    if (twitterAccount) return twitterAccount.profile?.name;
    if (mastodonAccount) return mastodonAccount.profile?.displayName;
  })();

  if (!platformUsername) {
    throw new Error('platform username not found');
  }

  if (!platformName) {
    throw new Error('platform name not found');
  }

  const ethAddress = nanopubAccount && nanopubAccount.profile?.ethAddress;
  if (!ethAddress) {
    throw new Error('Eth address not found');
  }

  const orcidId = orcidAccount ? orcidAccount.user_id : undefined;

  const autopostOption: AutopostOption = (() => {
    /** anything that isn't citoid detected doesn't get autopublished */
    if (
      post.originalParsed?.filter_classification !==
      SciFilterClassfication.CITOID_DETECTED_RESEARCH
    )
      return AutopostOption.MANUAL;

    /** only indicate it was autopublished if it was created after the autoposting settings were set */
    if (
      user.settings.autopost[PLATFORM.Nanopub].after &&
      post.createdAtMs > user.settings.autopost[PLATFORM.Nanopub].after
    )
      return user.settings.autopost[PLATFORM.Nanopub].value;

    return AutopostOption.MANUAL;
  })();
  post.originalParsed?.filter_classification ===
  SciFilterClassfication.CITOID_DETECTED_RESEARCH
    ? user.settings.autopost[PLATFORM.Nanopub].value
    : AutopostOption.MANUAL;

  const platformPost = (() => {
    const twitterPost = post.mirrors.find(
      (platformPost) => platformPost.platformId === PLATFORM.Twitter
    )?.posted;
    const mastodonPost = post.mirrors.find(
      (platformPost) => platformPost.platformId === PLATFORM.Mastodon
    )?.posted;
    return twitterPost || mastodonPost;
  })();

  const nanopub = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Nanopub
  );
  const latestNanopubUri = nanopub?.posted?.post_id;
  const rootNanopubUri = nanopub?.post_id;

  const platformPostId = platformPost?.post_id;

  if (!platformPostId) {
    throw new Error('Original platform post id not found');
  }

  const platformPostUrl = (() => {
    if (twitterAccount) {
      return `https://x.com/${platformUsername}/status/${platformPostId}`;
    }
    if (mastodonAccount) {
      const mastodonServer = mastodonAccount.profile?.mastodonServer;
      return `https://${mastodonServer}/@${platformUsername}/${platformPostId}`;
    }
    throw new Error('Unable to construct platform post URL');
  })();

  return {
    introUri,
    platformUsername,
    platformName,
    autopostOption,
    ethAddress,
    orcidId,
    platformPostUrl,
    latestNanopubUri,
    rootNanopubUri,
  };
};
