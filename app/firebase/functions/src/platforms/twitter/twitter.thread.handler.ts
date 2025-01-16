// 1. Define the Mastodon-specific ThreadHandler logic in a separate class
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostPosted,
} from '../../@shared/types/types.platform.posts';
import { ThreadHandler } from '../thread.handler.interface';

export class TwitterThreadHandler implements ThreadHandler {
  isPartOfMainThread(
    rootPost: PlatformPost,
    post: PlatformPostCreate
  ): boolean {
    return true;
  }

  mergeBrokenThreads(
    rootPost: PlatformPost,
    post: PlatformPostCreate
  ): PlatformPostPosted {
    return rootPost.posted!;
  }

  isRootThread(post: PlatformPostCreate): boolean {
    return true;
  }
}
