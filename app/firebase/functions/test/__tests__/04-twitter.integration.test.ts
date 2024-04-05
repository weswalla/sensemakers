import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

import { PLATFORM } from '../../src/@shared/types';
import {
  TwitterAccountCredentials,
  authenticateTwitterUsers,
} from '../utils/authenticate.users';

const NUM_TWITTER_USERS = 1;
const TEST_ACCOUNTS: TwitterAccountCredentials[] = JSON.parse(
  process.env.TEST_USER_TWITTER_ACCOUNTS as string
);

/** skip for now as it will invalidate access tokens */
describe.skip('twitter integration', () => {
  if (!TEST_ACCOUNTS) {
    throw new Error('test acccounts undefined');
  }
  if (TEST_ACCOUNTS.length < NUM_TWITTER_USERS) {
    throw new Error('need at least two test accounts');
  }

  it(`authenticates ${NUM_TWITTER_USERS} twitter users with the oauth 2.0 flow for reading access`, async () => {
    const appUserCreates = await authenticateTwitterUsers(
      TEST_ACCOUNTS.slice(0, NUM_TWITTER_USERS)
    );
    expect(appUserCreates).to.not.be.undefined;
    expect(appUserCreates.length).to.eq(NUM_TWITTER_USERS);
    for (const appUserCreate of appUserCreates) {
      for (const twitterDetails of appUserCreate[PLATFORM.Twitter] ?? []) {
        if (!twitterDetails.read?.accessToken) {
          throw new Error('unexpected: access token missing');
        }
        const twitterClient = new TwitterApi(twitterDetails.read?.accessToken);
        const { data: userObject } = await twitterClient.v2.me();
        expect(userObject).to.not.be.undefined;
        const result = await twitterClient.v2.userTimeline(
          twitterDetails.user_id,
          {
            start_time: new Date(Date.now()).toISOString(),
          }
        );
        expect(result).to.not.be.undefined;
      }
    }
  });
});