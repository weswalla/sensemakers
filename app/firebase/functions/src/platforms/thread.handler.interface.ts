import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostPosted,
} from '../@shared/types/types.platform.posts';

export interface ThreadHandler {
  isRootThread(post: PlatformPostCreate): boolean;
  isPartOfMainThread(rootPost: PlatformPost, post: PlatformPostCreate): boolean;
  mergeBrokenThreads(
    rootPost: PlatformPost,
    post: PlatformPostCreate
  ): PlatformPostPosted;
}
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * A Mixin that adds ThreadHandler functionality to a class
 */
export function ThreadHandlerMixin<
  TBase extends Constructor,
  THandler extends ThreadHandler,
>(
  Base: TBase,
  ThreadHandlerClass: new () => THandler
): Constructor<ThreadHandler> & TBase {
  return class extends Base implements ThreadHandler {
    private readonly threadHandler = new ThreadHandlerClass();

    isPartOfMainThread(
      rootPost: PlatformPost,
      post: PlatformPostCreate
    ): boolean {
      return this.threadHandler.isPartOfMainThread(rootPost, post);
    }

    mergeBrokenThreads(
      rootPost: PlatformPost,
      post: PlatformPostCreate
    ): PlatformPostPosted {
      return this.threadHandler.mergeBrokenThreads(rootPost, post);
    }

    isRootThread(post: PlatformPostCreate): boolean {
      return this.threadHandler.isRootThread(post);
    }
  };
}
