import { headers } from "next/headers";
import requestIp from "request-ip";

import { auth } from "@karakeep/auth";
import { db } from "@karakeep/db";
import { Context, createCallerFactory } from "@karakeep/trpc";
import { appRouter } from "@karakeep/trpc/routers/_app";

export const createContext = async (
  database?: typeof db,
  ip?: string | null,
): Promise<Context> => {
  const reqHeaders = headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!ip) {
    ip = requestIp.getClientIp({
      headers: Object.fromEntries(reqHeaders.entries()),
    });
  }

  return {
    user: session?.user ?? null,
    db: database ?? db,
    req: { ip },
    headers: reqHeaders,
  };
};

const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);

export const createTrcpClientFromCtx = createCaller;
