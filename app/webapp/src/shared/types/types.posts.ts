import { FetchParams } from './types.fetch';
import { AppPostSemantics, ParsePostResult } from './types.parser';
import { PlatformPost } from './types.platform.posts';
import { AppUser, PLATFORM } from './types.user';

export interface GenericAuthor {
  platformId: PLATFORM;
  id: string;
  username: string;
  name: string;
}

export interface GenericPost {
  url?: string;
  content: string;
  quotedThread?: GenericThread;
}

export interface GenericThread {
  url?: string;
  thread: GenericPost[];
  author: GenericAuthor;
}
/**
 * AppPost object as stored on our database
 *  */
export enum AppPostParsingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERRORED = 'errored',
  EXPIRED = 'expired',
}
export enum AppPostParsedStatus {
  UNPROCESSED = 'unprocessed',
  PROCESSED = 'processed',
}
export enum AppPostReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IGNORED = 'ignored',
  DRAFT = 'draft',
  UPDATED = 'updated',
}
export enum AppPostRepublishedStatus {
  PENDING = 'pending',
  REPUBLISHED = 'republished',
  AUTO_REPUBLISHED = 'autoRepublished',
  UNREPUBLISHED = 'unrepublished',
}

export interface AppPost {
  id: string; // the id may be autogenerated by the DB or computed from an original platform post_id
  generic: GenericThread;
  authorId?: string;
  origin: PLATFORM; // The platform where the post originated
  createdAtMs: number;
  parsingStatus: AppPostParsingStatus;
  parsingStartedAtMs?: number;
  parsedStatus: AppPostParsedStatus;
  reviewedStatus: AppPostReviewStatus;
  republishedStatus: AppPostRepublishedStatus;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  mirrorsIds: string[];
}

export type AppPostCreate = Omit<AppPost, 'id'>;

/**
 * Wrapper object that joins an AppPost, all its mirrors and its
 * author profile (including credentials). Useful to transfer publishing
 * information between services
 * */
export interface AppPostFull extends Omit<AppPost, 'mirrorsIds'> {
  mirrors: PlatformPost[];
}

export interface PostAndAuthor {
  post: AppPostFull;
  author: AppUser;
}

/**
 * Payload to mirror a post on other platforms,
 */
export interface AppPostMirror {
  postId: string;
  content?: string;
  semantics?: AppPostSemantics;
  mirrors: PlatformPost[];
}

/**
 * PostUpdate
 */
export type PostUpdate = Partial<
  Pick<
    AppPost,
    | 'generic'
    | 'semantics'
    | 'originalParsed'
    | 'parsingStatus'
    | 'parsingStartedAtMs'
    | 'parsedStatus'
    | 'reviewedStatus'
    | 'republishedStatus'
  >
>;

export interface PostUpdatePayload {
  postId: string;
  postUpdate: PostUpdate;
}

export enum PostsQueryStatus {
  PUBLISHED = 'published',
  IGNORED = 'ignored',
  PENDING = 'pending',
  DRAFTS = 'drafts',
}

export interface UnpublishPlatformPostPayload {
  postId: string;
  platformId: PLATFORM;
  post_id: string;
}

export interface UserPostsQuery {
  status: PostsQueryStatus;
  fetchParams: FetchParams;
}

export interface ProfilePostsQuery {
  platformId: PLATFORM;
  username: string;
  labelsUris?: string[];
  fetchParams: FetchParams;
}
