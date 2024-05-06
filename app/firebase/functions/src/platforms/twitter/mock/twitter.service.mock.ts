import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { UserDetailsBase } from '../../../@shared/types/types';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  TwitterDraft,
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { dateStrToTimestampMs } from '../twitter.utils';

interface TwitterTestState {
  latestId: number;
  tweets: Array<{ id: string; tweet: TweetV2SingleResult }>;
}

let state: TwitterTestState = {
  latestId: 0,
  tweets: [],
};

export type TwitterMockConfig = 'real' | 'mock-publish' | 'mock-signup';

export const TWITTER_USER_ID_MOCKS = '1753077743816777728';

const getSampleTweet = (id: string, authorId: string, createdAt: number) => {
  const date = new Date(createdAt);

  return {
    data: {
      id: id,
      text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id}`,
      author_id: authorId,
      created_at: date.toISOString(),
      edit_history_tweet_ids: [],
    },
  };
};

const now = Date.now();

const tweets = [1, 2, 3, 4, 5, 6].map((ix) => {
  const createdAt = now + ix * 10;
  state.latestId = ix;
  return {
    id: `${ix}`,
    tweet: getSampleTweet(`T${ix}`, TWITTER_USER_ID_MOCKS, createdAt),
  };
});

state.tweets.push(...tweets);

/** make private methods public */
type MockedType = Omit<TwitterService, 'fetchInternal'> & {
  fetchInternal: TwitterService['fetchInternal'];
};

/**
 * TwitterService mock that publish and fetches posts without really
 * hitting the API
 */
export const getTwitterMock = (
  twitterService: TwitterService,
  type: TwitterMockConfig
) => {
  if (type === 'real') {
    return twitterService;
  }

  if (type === 'mock-publish' || type === 'mock-signup') {
    const Mocked = spy(twitterService) as unknown as MockedType;

    when(Mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<TwitterDraft>) => {
        logger.warn(`called twitter publish mock`, postPublish);

        const tweet: TweetV2SingleResult = {
          data: {
            id: (++state.latestId).toString(),
            text: postPublish.draft.text,
            edit_history_tweet_ids: [],
            author_id: postPublish.userDetails.user_id,
            created_at: new Date().toISOString(),
          },
        };

        state.tweets.push({ id: tweet.data.id, tweet });

        const post: PlatformPostPosted<TweetV2SingleResult> = {
          post_id: tweet.data.id,
          user_id: tweet.data.author_id as string,
          timestampMs: dateStrToTimestampMs(tweet.data.created_at as string),
          post: tweet,
        };
        return post;
      }
    );

    when(Mocked.fetchInternal(anything(), anything(), anything())).thenCall(
      (params: TwitterQueryParameters, userDetails?: UserDetailsBase) => {
        const tweets = state.tweets
          .reverse()
          .filter((entry) => {
            const createdAt = new Date(entry.tweet.data.created_at as string);
            const startAt = params.start_time
              ? new Date(params.start_time)
              : undefined;
            return startAt ? createdAt.getTime() >= startAt.getTime() : true;
          })
          .map((entry) => entry.tweet.data);
        return tweets;
      }
    );

    if (type === 'mock-signup') {
      when(Mocked.getSignupContext(anything(), anything())).thenCall(
        (userId?: string, params?: TwitterGetContextParams) => {
          return {};
        }
      );

      when(Mocked.handleSignupData(anything())).thenCall(
        (data: { user_id: string }): TwitterUserDetails => {
          return {
            user_id: data.user_id,
            lastFetchedMs: 0,
            signupDate: 0,
          };
        }
      );
    }

    return instance(Mocked) as unknown as TwitterService;
  }

  throw new Error('Unexpected');
};
