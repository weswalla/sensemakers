import {
  IOAuth2RequestTokenResult,
  TweetV2,
  TweetV2PostTweetResult,
  UserV2,
} from 'twitter-api-v2';

import { UserDetailsBase } from './types.user';

export type TwitterGetContextParams = {
  callback_url: string;
  type: 'read' | 'write';
};

export type TwitterSignupContext = IOAuth2RequestTokenResult &
  TwitterGetContextParams;

export type TwitterAccountSignupData = TwitterSignupContext & {
  code: string;
};
export type TwitterSignupData =
  | TwitterAccountSignupData
  | TwitterGhostSignupData;

export type TwitterGhostSignupData = {
  username: string;
  accessToken: string;
  isGhost: true;
};

export interface TwitterUserCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAtMs: number;
}

export type TwitterUserProfile = Pick<
  UserV2,
  'profile_image_url' | 'name' | 'username' | 'id'
>;

/** For Twitter we need to store the oAuth token and secret as part of the signup process
 * and the access Token and Secret as the credentials need to post in the name of the user
 */
export interface TwitterUserDetails
  extends UserDetailsBase<
    TwitterUserProfile,
    TwitterUserCredentials,
    TwitterUserCredentials
  > {}

export type TweetRead = TweetV2PostTweetResult['data'];

export interface TwitterDraft {
  text: string;
}

export type TwitterUser = Required<
  Pick<Omit<UserV2, 'profile_image_url'>, 'id' | 'username' | 'name'>
> & { profile_image_url?: string };

export interface TwitterThread {
  conversation_id: string;
  tweets: AppTweet[];
  author: TwitterUser;
}

export enum REQUIRED_TWEET_FIELDS {
  Id = 'id',
  CreatedAt = 'created_at',
  AuthorId = 'author_id',
  Text = 'text',
  ConversationId = 'conversation_id',
}

export enum OPTIONAL_TWEET_FIELDS {
  Entities = 'entities',
  NoteTweet = 'note_tweet',
  ReferencedTweets = 'referenced_tweets',
}

// I was gettig an error Type 'OPTIONAL_TWEET_FIELDS' does not satisfy the constraint 'keyof TweetV2'
// export type AppTweetBase = Required<Pick<TweetV2, REQUIRED_TWEET_FIELDS>> &
//   Pick<TweetV2, OPTIONAL_TWEET_FIELDS>;

export type AppTweetBase = Required<Pick<TweetV2, REQUIRED_TWEET_FIELDS>> & {
  entities?: TweetV2['entities'];
  note_tweet?: TweetV2;
  referenced_tweets?: TweetV2['referenced_tweets'];
};

export type AppQuotedTweet = AppTweetBase & {
  author: TwitterUser;
};

/** our internal representation of a tweet */
export interface AppTweet extends AppTweetBase {
  quoted_tweet?: AppQuotedTweet;
}
