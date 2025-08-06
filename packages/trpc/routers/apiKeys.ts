import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { z } from "zod";

import { auth } from "@karakeep/auth";
import { apiKeys } from "@karakeep/db/schema";
import serverConfig from "@karakeep/shared/config";

import type { Context } from "../index";
import {
  authedProcedure,
  createRateLimitMiddleware,
  publicProcedure,
  router,
} from "../index";

// const BCRYPT_SALT_ROUNDS = 10;
const API_KEY_PREFIX_V1 = "ak1";
const API_KEY_PREFIX_V2 = "ak2";

const zApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  createdAt: z.date(),
});

function parseApiKey(plain: string) {
  const parts = plain.split("_");
  if (parts.length != 3) {
    throw new Error(
      `Malformd API key. API keys should have 3 segments, found ${parts.length} instead.`,
    );
  }
  if (parts[0] !== API_KEY_PREFIX_V1 && parts[0] !== API_KEY_PREFIX_V2) {
    throw new Error(`Malformd API key. Got unexpected key prefix.`);
  }
  return {
    version: parts[0] == API_KEY_PREFIX_V1 ? (1 as const) : (2 as const),
    keyId: parts[1],
    keySecret: parts[2],
  };
}

async function authenticateApiKey(key: string, database: Context["db"]) {
  const { version, keyId, keySecret } = parseApiKey(key);
  const apiKey = await database.query.apiKeys.findFirst({
    where: (k, { eq }) => eq(k.keyId, keyId),
    with: {
      user: true,
    },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  const hash = apiKey.keyHash;

  let validation = false;
  switch (version) {
    case 1:
      validation = await bcrypt.compare(keySecret, hash);
      break;
    case 2:
      validation =
        createHash("sha256").update(keySecret).digest("base64") == hash;
      break;
    default:
      throw new Error("Invalid API Key");
  }

  if (!validation) {
    throw new Error("Invalid API Key");
  }

  return apiKey.user;
}

async function generateApiKey(
  name: string,
  userId: string,
  database: Context["db"],
) {
  const id = randomBytes(10).toString("hex");
  const secret = randomBytes(16).toString("hex");

  const secretHash = createHash("sha256").update(secret).digest("base64");

  const plain = `${API_KEY_PREFIX_V2}_${id}_${secret}`;

  const key = (
    await database
      .insert(apiKeys)
      .values({
        name: name,
        userId: userId,
        keyId: id,
        keyHash: secretHash,
      })
      .returning()
  )[0];

  invariant(key.createdAt !== null, "createdAt is never null");

  return {
    id: key.id,
    name: key.name,
    createdAt: key.createdAt,
    key: plain,
  };
}

export const apiKeysAppRouter = router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .output(zApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      return await generateApiKey(input.name, ctx.user.id, ctx.db);
    }),
  revoke: authedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id)));
    }),
  list: authedProcedure
    .output(
      z.object({
        keys: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            createdAt: z.date(),
            keyId: z.string(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const resp = await ctx.db.query.apiKeys.findMany({
        where: eq(apiKeys.userId, ctx.user.id),
        columns: {
          id: true,
          name: true,
          createdAt: true,
          keyId: true,
        },
      });
      return { keys: resp };
    }),
  // Exchange the username and password with an API key.
  // Homemade oAuth. This is used by the extension.
  exchange: publicProcedure
    .use(
      createRateLimitMiddleware({
        name: "apiKey.exchange",
        windowMs: 15 * 60 * 1000,
        maxRequests: 10,
      }),
    ) // 10 requests per 15 minutes
    .input(
      z.object({
        keyName: z.string(),
        email: z.string(),
        password: z.string(),
      }),
    )
    .output(zApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      // Special handling as otherwise the extension would show "username or password is wrong"
      if (serverConfig.auth.disablePasswordAuth) {
        throw new TRPCError({
          message: "Password authentication is currently disabled",
          code: "FORBIDDEN",
        });
      }
      try {
        const { user } = await auth.api.signInEmail({
          body: { email: input.email, password: input.password },
        });
        return await generateApiKey(input.keyName, user.id, ctx.db);
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
  validate: publicProcedure
    .use(
      createRateLimitMiddleware({
        name: "apiKey.validate",
        windowMs: 60 * 1000,
        maxRequests: 30,
      }),
    ) // 30 requests per minute
    .input(z.object({ apiKey: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await authenticateApiKey(input.apiKey, ctx.db); // Throws if the key is invalid
      return {
        success: true,
      };
    }),
});
