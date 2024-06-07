import { expect } from 'chai';

import { AppUser, FetchParams, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import {
  QuoteTweetV2,
  TwitterThread,
} from '../../src/@shared/types/types.twitter';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { convertToQuoteTweets } from '../../src/platforms/twitter/twitter.utils';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { getMockPost } from '../utils/posts.utils';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
  let rsaKeys: RSAKeys | undefined;
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    rsaKeys = getRSAKeys('');

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, TWITTER_USER_ID_MOCKS) !==
          undefined
      );
    });
  });

  describe('twitter', () => {
    it.only('fetch the latest 5 threads', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const twitter = user[PLATFORM.Twitter];

      if (!twitter) {
        throw new Error('User does not have Twitter credentials');
      }

      const fetchParams: FetchParams = {
        expectedAmount: 5,
      };

      const threads = await services.db.run((manager) =>
        twitterService.fetch(fetchParams, userDetails, manager)
      );

      expect(threads).to.not.be.undefined;
      expect(threads.platformPosts.length).to.be.greaterThanOrEqual(5);

      const threadWithQuotedTweet = threads.platformPosts.find((thread) => {
        return (thread.post as TwitterThread).tweets.some((tweet) => {
          return tweet.quote_tweet !== undefined;
        });
      });

      if (threadWithQuotedTweet) {
        const genericPost = await twitterService.convertToGeneric({
          posted: threadWithQuotedTweet,
        } as PlatformPostCreate<TwitterThread>);
        console.log('genericPost: ', genericPost);
        expect(genericPost.metadata.transcludedContent).to.not.be.undefined;
      }
    });

    it('includes quote tweets in platform post and app post', async () => {
      const postIds = [
        '1798791421152911644', // https://x.com/sense_nets_bot/status/1798791421152911644 quotes https://x.com/sense_nets_bot/status/1795069204418175459
        '1798791660668698927', // https://x.com/sense_nets_bot/status/1798791660668698927 quotes https://x.com/sense_nets_bot/status/1798782358201508331
        '1798792109031559184', // https://x.com/sense_nets_bot/status/1798792109031559184 quotes https://x.com/rtk254/status/1798549107507974626
      ];

      if (!user) {
        throw new Error('appUser not created');
      }
      const twitterId = user[PLATFORM.Twitter]?.[0]?.user_id;

      const twitterService = services.platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      try {
        const result = await services.db.run(async (manager) => {
          return twitterService.getPosts(postIds, manager, twitterId);
        });
        const quoteTweets = convertToQuoteTweets(result.data, result.includes);
        expect(quoteTweets).to.not.be.undefined;
        expect(quoteTweets.length).to.be.equal(3);

        const quotedTweetIds = [
          '1795069204418175459',
          '1798782358201508331',
          '1798549107507974626',
        ];

        quoteTweets.forEach((qt: QuoteTweetV2) => {
          expect(quotedTweetIds).to.include(qt.quote_tweet?.id);
        });
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });

  describe('nanopub', () => {
    it('creates a draft nanopub, sign and publish', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }

      try {
        const post = getMockPost({ authorId: user.userId, id: 'post-id-1' });

        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        const nanopub = await nanopubService.convertFromGeneric({
          post,
          author: user,
        });

        if (!nanopub) {
          throw new Error('Post not created');
        }

        if (!rsaKeys) {
          throw new Error('RSA keys not created');
        }

        const signed = await signNanopublication(
          nanopub.unsignedPost,
          rsaKeys,
          ''
        );
        expect(signed).to.not.be.undefined;

        const published = await services.db.run((manager) =>
          nanopubService.publish(
            {
              draft: signed.rdf(),
              userDetails: {
                signupDate: 0,
                user_id: '123456',
              },
            },
            manager
          )
        );
        expect(published).to.not.be.undefined;
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
