import { PLATFORM, UserDetailsBase } from '../@shared/types';
import { IdentityPlatforms } from '../platforms/platforms.interface';
import { UsersRepository } from './users.repository';

/**
 * A user profile is made up of a dictionary of PLATFORM => Arrray<AuthenticationDetails>
 * One user can have multiple profiles on each platform.
 *
 * Authentication details may be OAuth access tokens, or validated details about the user
 * identity like its public key/address.
 */
export class UsersService {
  constructor(
    public repo: UsersRepository,
    public platforms: IdentityPlatforms
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.platforms.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  /** This method request the user signup context and stores it in the user profile */
  public async getSignupContext(platform: PLATFORM, userId?: string) {
    const context =
      await this.getIdentityService(platform).getSignupContext(userId);

    if (userId) {
      await this.repo.addUserDetails(userId, platform, context);
    }

    return context;
  }

  /**
   * This method validates the signup data and stores it in the user profile. If
   * a userId is provided the user must exist and a new platform is added to it,
   * otherewise a new user is created.
   */
  public async handleSignup(
    platform: PLATFORM,
    _signupData: any,
    _userId?: string
  ) {
    /**
     * signup data is obtained from the provided one merged with the current user
     * signupData (in case getSignupContext precomputed some user details)
     */
    let currentDetails = {};
    if (_userId) {
      const user = await this.repo.getUser(_userId, true);
      const allDetails = user[platform];
      currentDetails = allDetails ? allDetails[0] : {};
    }

    /**
     * validate the signup data for this platform and convert it into
     * user details
     */
    const signupData = { ...currentDetails, ..._signupData };
    const userDetails = (await this.getIdentityService(
      platform
    ).handleSignupData(signupData)) as UserDetailsBase;

    let userId = _userId;

    /** create user if it does not exist */
    if (!_userId) {
      userId = userDetails.user_id;
      await this.repo.createUser(userId, { [platform]: [userDetails] });
    } else {
      if (!userId) throw new Error('unexpected');
      await this.repo.addUserDetails(userId, platform, userDetails);
    }

    return userId;
  }
}