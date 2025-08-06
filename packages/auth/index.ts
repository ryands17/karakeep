import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { toNextJsHandler } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { count } from "drizzle-orm";

import { db } from "@karakeep/db";
import { user, userSettings } from "@karakeep/db/schema";
import { globalConfig } from "@karakeep/shared/config";

/**
 * Returns true if the user table is empty, which indicates that this user is going to be
 * the first one. This can be racy if multiple users are created at the same time, but
 * that should be fine.
 */
async function isFirstUser() {
  const [{ count: userCount }] = await db.select({ count: count() }).from(user);

  return userCount == 0;
}

/**
 * Retrieves the signup setting from the global settings in the database.
 * Queries the database for a global setting with the name specified by
 * `globalConfig.allowUserSignups.name` and returns its value as a boolean.
 *
 */
async function isSignupEnabled() {
  const setting = await db.query.globalSettings.findFirst({
    where: (globalSettings, { eq }) =>
      eq(globalSettings.name, globalConfig.allowUserSignups.name),
  });

  return Boolean(setting?.value);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        returned: true,
      },
    },
  },
  session: {
    fields: {
      expiresAt: "expires",
      token: "sessionToken",
    },
  },
  account: {
    fields: {
      accountId: "providerAccountId",
      refreshToken: "refresh_token",
      accessToken: "access_token",
      accessTokenExpiresAt: "expires_at",
      idToken: "id_token",
    },
  },
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  databaseHooks: {
    user: {
      create: {
        before: async (user, _ctx) => {
          const isFirst = await isFirstUser();

          return {
            data: {
              ...user,
              role: isFirst ? "admin" : "user",
              emailVerified: true,
            },
          };
        },
        after: async (user) => {
          await db.insert(userSettings).values({ userId: user.id });
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        if (!(await isSignupEnabled())) {
          throw new APIError("BAD_REQUEST", {
            message: "Signups are disabled",
          });
        }
      }
      return;
    }),
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const dbUser = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, user.id),
      });

      return {
        session,
        user: {
          ...user,
          role: dbUser?.role ?? "user",
        },
      };
    }),
  ],
});

export const { POST, GET } = toNextJsHandler(auth);
