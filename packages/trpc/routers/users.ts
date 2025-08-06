import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import invariant from "tiny-invariant";
import { z } from "zod";

import { auth } from "@karakeep/auth";
import {
  assets,
  bookmarkLinks,
  bookmarkLists,
  bookmarks,
  bookmarkTags,
  highlights,
  tagsOnBookmarks,
  user,
  userSettings,
} from "@karakeep/db/schema";
import { deleteUserAssets } from "@karakeep/shared/assetdb";
import {
  zUpdateUserSettingsSchema,
  zUserSettingsSchema,
  zUserStatsResponseSchema,
  zWhoAmIResponseSchema,
} from "@karakeep/shared/types/users";

import { adminProcedure, authedProcedure, router } from "../index";

export const usersAppRouter = router({
  list: adminProcedure
    .output(
      z.object({
        users: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.enum(["user", "admin"]).nullable(),
            localUser: z.boolean(),
            bookmarkQuota: z.number().nullable(),
            storageQuota: z.number().nullable(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const dbUsers = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: user.password,
          bookmarkQuota: user.bookmarkQuota,
          storageQuota: user.storageQuota,
        })
        .from(user);

      return {
        users: dbUsers.map(({ password, ...user }) => ({
          ...user,
          localUser: password !== null,
        })),
      };
    }),
  changePassword: authedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      invariant(ctx.user.email, "A user always has an email specified");
      await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
        headers: ctx.headers,
      });
    }),
  delete: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.delete(user).where(eq(user.id, input.userId));
      if (res.changes == 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await deleteUserAssets({ userId: input.userId });
    }),
  deleteAccount: authedProcedure
    .input(
      z.object({
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      invariant(ctx.user.email, "A user always has an email specified");

      // Check if user has a password (local account)
      const newUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.user.id),
      });

      if (!newUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete the user account
      await auth.api.deleteUser({
        body: { password: input.password },
        headers: ctx.headers,
      });

      // Delete user assets
      await deleteUserAssets({ userId: ctx.user.id });
    }),
  whoami: authedProcedure
    .output(zWhoAmIResponseSchema)
    .query(async ({ ctx }) => {
      if (!ctx.user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userDb = await ctx.db.query.user.findFirst({
        where: and(eq(user.id, ctx.user.id), eq(user.email, ctx.user.email)),
      });
      if (!userDb) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        localUser: userDb.password !== null,
      };
    }),
  stats: authedProcedure
    .output(zUserStatsResponseSchema)
    .query(async ({ ctx }) => {
      // Get user's timezone
      const userSet = await ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.user.id),
      });
      const userTimezone = userSet?.timezone || "UTC";
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const [
        [{ numBookmarks }],
        [{ numFavorites }],
        [{ numArchived }],
        [{ numTags }],
        [{ numLists }],
        [{ numHighlights }],
        bookmarksByType,
        topDomains,
        [{ totalAssetSize }],
        assetsByType,
        [{ thisWeek }],
        [{ thisMonth }],
        [{ thisYear }],
        bookmarkTimestamps,
        tagUsage,
      ] = await Promise.all([
        // Basic counts
        ctx.db
          .select({ numBookmarks: count() })
          .from(bookmarks)
          .where(eq(bookmarks.userId, ctx.user.id)),
        ctx.db
          .select({ numFavorites: count() })
          .from(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.user.id),
              eq(bookmarks.favourited, true),
            ),
          ),
        ctx.db
          .select({ numArchived: count() })
          .from(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.user.id),
              eq(bookmarks.archived, true),
            ),
          ),
        ctx.db
          .select({ numTags: count() })
          .from(bookmarkTags)
          .where(eq(bookmarkTags.userId, ctx.user.id)),
        ctx.db
          .select({ numLists: count() })
          .from(bookmarkLists)
          .where(eq(bookmarkLists.userId, ctx.user.id)),
        ctx.db
          .select({ numHighlights: count() })
          .from(highlights)
          .where(eq(highlights.userId, ctx.user.id)),

        // Bookmarks by type
        ctx.db
          .select({
            type: bookmarks.type,
            count: count(),
          })
          .from(bookmarks)
          .where(eq(bookmarks.userId, ctx.user.id))
          .groupBy(bookmarks.type),

        // Top domains
        ctx.db
          .select({
            domain: sql<string>`CASE 
              WHEN ${bookmarkLinks.url} LIKE 'https://%' THEN 
                CASE 
                  WHEN INSTR(SUBSTR(${bookmarkLinks.url}, 9), '/') > 0 THEN
                    SUBSTR(${bookmarkLinks.url}, 9, INSTR(SUBSTR(${bookmarkLinks.url}, 9), '/') - 1)
                  ELSE
                    SUBSTR(${bookmarkLinks.url}, 9)
                END
              WHEN ${bookmarkLinks.url} LIKE 'http://%' THEN 
                CASE 
                  WHEN INSTR(SUBSTR(${bookmarkLinks.url}, 8), '/') > 0 THEN
                    SUBSTR(${bookmarkLinks.url}, 8, INSTR(SUBSTR(${bookmarkLinks.url}, 8), '/') - 1)
                  ELSE
                    SUBSTR(${bookmarkLinks.url}, 8)
                END
              ELSE 
                CASE 
                  WHEN INSTR(${bookmarkLinks.url}, '/') > 0 THEN
                    SUBSTR(${bookmarkLinks.url}, 1, INSTR(${bookmarkLinks.url}, '/') - 1)
                  ELSE
                    ${bookmarkLinks.url}
                END
            END`,
            count: count(),
          })
          .from(bookmarkLinks)
          .innerJoin(bookmarks, eq(bookmarks.id, bookmarkLinks.id))
          .where(eq(bookmarks.userId, ctx.user.id))
          .groupBy(
            sql`CASE 
            WHEN ${bookmarkLinks.url} LIKE 'https://%' THEN 
              CASE 
                WHEN INSTR(SUBSTR(${bookmarkLinks.url}, 9), '/') > 0 THEN
                  SUBSTR(${bookmarkLinks.url}, 9, INSTR(SUBSTR(${bookmarkLinks.url}, 9), '/') - 1)
                ELSE
                  SUBSTR(${bookmarkLinks.url}, 9)
              END
            WHEN ${bookmarkLinks.url} LIKE 'http://%' THEN 
              CASE 
                WHEN INSTR(SUBSTR(${bookmarkLinks.url}, 8), '/') > 0 THEN
                  SUBSTR(${bookmarkLinks.url}, 8, INSTR(SUBSTR(${bookmarkLinks.url}, 8), '/') - 1)
                ELSE
                  SUBSTR(${bookmarkLinks.url}, 8)
              END
            ELSE 
              CASE 
                WHEN INSTR(${bookmarkLinks.url}, '/') > 0 THEN
                  SUBSTR(${bookmarkLinks.url}, 1, INSTR(${bookmarkLinks.url}, '/') - 1)
                ELSE
                  ${bookmarkLinks.url}
              END
          END`,
          )
          .orderBy(desc(count()))
          .limit(10),

        // Total asset size
        ctx.db
          .select({
            totalAssetSize: sql<number>`COALESCE(SUM(${assets.size}), 0)`,
          })
          .from(assets)
          .where(eq(assets.userId, ctx.user.id)),

        // Assets by type
        ctx.db
          .select({
            type: assets.assetType,
            count: count(),
            totalSize: sql<number>`COALESCE(SUM(${assets.size}), 0)`,
          })
          .from(assets)
          .where(eq(assets.userId, ctx.user.id))
          .groupBy(assets.assetType),

        // Activity stats
        ctx.db
          .select({ thisWeek: count() })
          .from(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.user.id),
              gte(bookmarks.createdAt, weekAgo),
            ),
          ),
        ctx.db
          .select({ thisMonth: count() })
          .from(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.user.id),
              gte(bookmarks.createdAt, monthAgo),
            ),
          ),
        ctx.db
          .select({ thisYear: count() })
          .from(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.user.id),
              gte(bookmarks.createdAt, yearAgo),
            ),
          ),

        // Get all bookmark timestamps for timezone conversion
        ctx.db
          .select({
            createdAt: bookmarks.createdAt,
          })
          .from(bookmarks)
          .where(eq(bookmarks.userId, ctx.user.id)),

        // Tag usage
        ctx.db
          .select({
            name: bookmarkTags.name,
            count: count(),
          })
          .from(bookmarkTags)
          .innerJoin(
            tagsOnBookmarks,
            eq(tagsOnBookmarks.tagId, bookmarkTags.id),
          )
          .where(eq(bookmarkTags.userId, ctx.user.id))
          .groupBy(bookmarkTags.name)
          .orderBy(desc(count()))
          .limit(10),
      ]);

      // Process bookmarks by type
      const bookmarkTypeMap = { link: 0, text: 0, asset: 0 };
      bookmarksByType.forEach((item) => {
        if (item.type in bookmarkTypeMap) {
          bookmarkTypeMap[item.type as keyof typeof bookmarkTypeMap] =
            item.count;
        }
      });

      // Process timestamps with user timezone
      const hourCounts = Array.from({ length: 24 }, () => 0);
      const dayCounts = Array.from({ length: 7 }, () => 0);

      bookmarkTimestamps.forEach(({ createdAt }) => {
        if (createdAt) {
          // Convert timestamp to user timezone
          const date = new Date(createdAt);
          const userDate = new Date(
            date.toLocaleString("en-US", { timeZone: userTimezone }),
          );

          const hour = userDate.getHours();
          const day = userDate.getDay();

          hourCounts[hour]++;
          dayCounts[day]++;
        }
      });

      const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourCounts[i],
      }));

      const dailyActivity = Array.from({ length: 7 }, (_, i) => ({
        day: i,
        count: dayCounts[i],
      }));

      return {
        numBookmarks,
        numFavorites,
        numArchived,
        numTags,
        numLists,
        numHighlights,
        bookmarksByType: bookmarkTypeMap,
        topDomains: topDomains.filter((d) => d.domain && d.domain.length > 0),
        totalAssetSize: totalAssetSize || 0,
        assetsByType,
        bookmarkingActivity: {
          thisWeek: thisWeek || 0,
          thisMonth: thisMonth || 0,
          thisYear: thisYear || 0,
          byHour: hourlyActivity,
          byDayOfWeek: dailyActivity,
        },
        tagUsage,
      };
    }),
  settings: authedProcedure
    .output(zUserSettingsSchema)
    .query(async ({ ctx }) => {
      const settings = await ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.user.id),
      });
      if (!settings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User settings not found",
        });
      }
      return {
        bookmarkClickAction: settings.bookmarkClickAction,
        archiveDisplayBehaviour: settings.archiveDisplayBehaviour,
        timezone: settings.timezone || "UTC",
      };
    }),
  updateSettings: authedProcedure
    .input(zUpdateUserSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (Object.keys(input).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No settings provided",
        });
      }
      await ctx.db
        .update(userSettings)
        .set({
          bookmarkClickAction: input.bookmarkClickAction,
          archiveDisplayBehaviour: input.archiveDisplayBehaviour,
          timezone: input.timezone,
        })
        .where(eq(userSettings.userId, ctx.user.id));
    }),
});
