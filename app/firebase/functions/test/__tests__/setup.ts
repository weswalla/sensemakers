import fs from 'fs';
import { Context } from 'mocha';

import { AppUser } from '../../src/@shared/types/types';
import { envDeploy } from '../../src/config/typedenv.deploy';
import {
  TestUserCredentials,
  authenticateTestUser,
} from '../utils/authenticate.users';
import { resetDB } from '../utils/db';
import { getTestServices } from './test.services';

export const LOG_LEVEL_MSG = envDeploy.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envDeploy.LOG_LEVEL_OBJ.value();
export const NUM_TEST_USERS = 1;
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const USE_REAL_TWITTER = process.env.USE_REAL_TWITTERX === 'true';
export const USE_REAL_NANOPUB = process.env.USE_REAL_NANOPUB === 'true';
export const USE_REAL_PARSER = process.env.USE_REAL_PARSER === 'true';

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export let testUsers: Map<string, AppUser> = new Map();

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks = (): Mocha.RootHookObject => {
  const services = getTestServices();

  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};
      await resetDB();

      await services.db.run(async (manager) => {
        const testAccountsCredentials: TestUserCredentials[] = JSON.parse(
          process.env.TEST_USER_ACCOUNTS as string
        );
        if (!testAccountsCredentials) {
          throw new Error('test acccounts undefined');
        }
        if (testAccountsCredentials.length < NUM_TEST_USERS) {
          throw new Error('not enough twitter account credentials provided');
        }
        let appUsers: AppUser[] = [];

        if (fs.existsSync(TEST_USERS_FILE_PATH)) {
          const fileContents = fs.readFileSync(TEST_USERS_FILE_PATH, 'utf8');
          appUsers = JSON.parse(fileContents);

          await Promise.all(
            appUsers.map(async (appUser) => {
              testUsers.set(appUser.userId, appUser);
            })
          );
        } else {
          await Promise.all(
            testAccountsCredentials.map(async (accountCredentials) => {
              const user = await authenticateTestUser(
                accountCredentials,
                services,
                manager
              );
              testUsers.set(user.userId, user);
            })
          );
        }
      });

      Object.assign(this, context);
    },

    beforeEach(this: TestContext) {
      // the contents of the Before Each hook
    },

    /** update stored test users after all tests run */
    async afterAll(this: TestContext) {
      if (testUsers.size > 0) {
        fs.writeFileSync(
          TEST_USERS_FILE_PATH,
          JSON.stringify(Array.from(testUsers.values())),
          'utf8'
        );
      }
    },

    /** update test users global variable after each test in case tokens have been refreshed */
    async afterEach(this: TestContext) {
      const testAppUsers = await services.users.repo.getAll();
      testAppUsers.forEach((appUser) => {
        testUsers.set(appUser.userId, appUser);
      });
    },
  };
};
