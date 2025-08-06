import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@karakeep/db";
import { user } from "@karakeep/db/schema";

import { AuthedContext } from "..";

export async function buildImpersonatingAuthedContext(
  userId: string,
): Promise<AuthedContext> {
  const u = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  if (!u) {
    throw new Error("User not found");
  }

  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    },
    db,
    req: { ip: null },
    headers: headers(),
  };
}
