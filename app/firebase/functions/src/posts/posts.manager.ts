import { ALL_PUBLISH_PLATFORMS, AppUser } from '../@shared/types/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import { PlatformPost } from '../@shared/types/types.platform.posts';
import { AppPostFull, PostUpdate } from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { ParserService } from '../parser/parser.service';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsProcessing } from './posts.processing';

/**
 * Top level methods. They instantiate a TransactionManger and execute
 * read and writes to the DB
 */
export class PostsManager {
  constructor(
    protected db: DBInstance,
    protected users: UsersService,
    public processing: PostsProcessing,
    protected platforms: PlatformsService,
    protected parserService: ParserService
  ) {}

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll() {
    const users = await this.users.repo.getAll();

    /** Call fetch for each user */
    const posts = await Promise.all(
      users.map(async (user) => this.fetchUser(user))
    );

    return posts.flat();
  }

  /**
   * Fetch and store platform posts of one user
   * as one Transaction. It doesn't return anything
   * Could be modified to return the PlatformPosts fetched,
   * and the corresponding AppPosts and Drafts
   * */
  async fetchUser(user: AppUser) {
    /** Call fetch for each platform */
    return this.db.run(async (manager) => {
      await Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platformId) => {
          const accounts = UsersHelper.getAccounts(user, platformId);
          /** Call fetch for each account */
          return Promise.all(
            accounts.map(async (account) => {
              /** This fetch parameters */
              const userParams: FetchUserPostsParams = {
                start_time: account.read
                  ? account.read.lastFetchedMs
                  : account.signupDate,
                userDetails: account,
              };

              /** Fetch */
              const platformPosts = await this.platforms.fetch(
                platformId,
                userParams,
                manager
              );

              /** Create the PlatformPosts */
              const platformPostsCreated =
                await this.processing.createPlatformPosts(
                  platformPosts,
                  manager
                );

              const postIds = platformPostsCreated.map((pp) => pp.post.id);
              await this.parsePosts(postIds, manager);

              /** Create the Drafts */
              await this.processing.createPostsDrafts(
                postIds,
                ALL_PUBLISH_PLATFORMS.filter(
                  (_platformId) => _platformId !== platformId
                ),
                manager
              );

              return platformPostsCreated;
            })
          );
        })
      );
    });
  }

  /** get pending posts AppPostFull of user, cannot be part of a transaction */
  async getPendingOfUser(userId: string) {
    const pendingAppPosts =
      await this.processing.posts.getPendingOfUser(userId);

    const postsFull = await Promise.all(
      pendingAppPosts.map(async (post): Promise<AppPostFull> => {
        const mirrors = await Promise.all(
          post.mirrorsIds.map((mirrorId) => {
            return this.db.run((manager) =>
              this.processing.platformPosts.get(mirrorId, manager)
            );
          })
        );
        return {
          ...post,
          mirrors: mirrors.filter((m) => m !== undefined) as PlatformPost[],
        };
      })
    );

    return postsFull;
  }

  async getPost<T extends boolean>(postId: string, shouldThrow: T) {
    return this.db.run(async (manager) =>
      this.processing.getPostFull(postId, manager, shouldThrow)
    );
  }

  async parsePosts(postIds: string[], manager: TransactionManager) {
    return Promise.all(
      postIds.map((postId) => this.parsePost(postId, manager))
    );
  }

  async parsePost(postId: string, manager: TransactionManager) {
    const post = await this.processing.posts.get(postId, manager, true);

    const params: ParsePostRequest<TopicsParams> = {
      post: { content: post.content },
      params: {
        [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
      },
    };

    /** Call the parser */
    const parserResult = await this.parserService.parsePosts(params);

    if (!parserResult) {
      throw new Error(`Error parsing post: ${post.id}`);
    }

    const update: PostUpdate = {
      semantics: parserResult.semantics,
      originalParsed: parserResult,
      parseStatus: 'processed',
    };

    await this.processing.posts.updateContent(post.id, update, manager);
  }
}
