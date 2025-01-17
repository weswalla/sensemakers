import { BlueskyThread } from '../../@shared/types/types.bluesky';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostPosted,
} from '../../@shared/types/types.platform.posts';
import { ThreadHandler } from '../thread.handler.interface';

export class BlueskyThreadHandler implements ThreadHandler {
  isPartOfMainThread(
    rootPost: PlatformPost<BlueskyThread>,
    post: PlatformPostCreate<BlueskyThread>
  ): boolean {
    if (!rootPost.posted || !post.posted) {
      throw new Error('Unexpected undefined posted');
    }
    if (rootPost.posted.post_id !== post.posted.post_id) return false;
    const rootThreadPosts = rootPost.posted.post.posts;
    const lastRootThreadPost = rootThreadPosts[rootThreadPosts.length - 1];
    const newThreadPosts = post.posted.post.posts;
    const firstNewThreadPost = newThreadPosts[0];

    if (firstNewThreadPost.record.reply?.parent.uri === lastRootThreadPost.uri)
      return true;

    return false;
  }
  mergeBrokenThreads(
    rootPost: PlatformPost<BlueskyThread>,
    post: PlatformPostCreate<BlueskyThread>
  ): PlatformPostPosted {
    if (!rootPost.posted || !post.posted) {
      throw new Error('Unexpected undefined posted');
    }
    const mergedThread = [
      ...rootPost.posted?.post.posts,
      ...post.posted?.post.posts,
    ];
    rootPost.posted.post.posts = mergedThread;
    return rootPost.posted;
  }
  isRootThread(post: PlatformPostCreate): boolean {
    return post.posted?.post.posts[0].uri === post.posted?.post_id;
  }
}
