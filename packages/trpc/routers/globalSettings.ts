import { eq } from "drizzle-orm";
import { z } from "zod";

import { globalSettings } from "@karakeep/db/schema";
import { globalConfig } from "@karakeep/shared/config";

import { adminProcedure, publicProcedure, router } from "../index";

export const globalSettingsRouter = router({
  list: adminProcedure
    .output(
      z.object({
        globalSettings: z.array(
          z.object({
            name: z.string(),
            description: z.string().nullable(),
            value: z.boolean().nullable(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const globalSettings = await ctx.db.query.globalSettings.findMany();
      return { globalSettings };
    }),
  signupEnabled: publicProcedure
    .output(
      z.object({
        signupsEnabled: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      const signupsEnabled = await ctx.db.query.globalSettings.findFirst({
        where: eq(globalSettings.name, globalConfig.allowUserSignups.name),
      });
      return { signupsEnabled: Boolean(signupsEnabled?.value) };
    }),
  toggle: adminProcedure
    .input(
      z.object({
        name: z.string(),
        value: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(globalSettings)
        .set({ value: input.value })
        .where(eq(globalSettings.name, input.name));
    }),
});
