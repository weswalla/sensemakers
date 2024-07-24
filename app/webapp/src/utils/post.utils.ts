import { TwitterUserDetails } from '../shared/types/types.twitter';
import { AppUserRead, PLATFORM } from '../shared/types/types.user';

export function getPlatformProfile(
  user: AppUserRead,
  platform: PLATFORM,
  authorId: string
) {
  if (!user) {
    return undefined;
  }
  if (platform === PLATFORM.Local) {
    return undefined;
  }
  const platformProfiles = user[platform];
  if (!platformProfiles) {
    return undefined;
  }
  for (const platformProfile of platformProfiles) {
    if (`${platform}:${platformProfile.user_id}` === authorId) {
      switch (platform) {
        case PLATFORM.Twitter:
          const twitterProfile =
            platformProfile.profile as TwitterUserDetails['profile'];
          if (!twitterProfile) {
            return undefined;
          }

          return {
            profileName: twitterProfile.name,
            profileHandle: twitterProfile.username,
            profileImageUrl: twitterProfile.profile_image_url,
          };
        default:
          return undefined;
      }
    }
  }
  return undefined;
}
