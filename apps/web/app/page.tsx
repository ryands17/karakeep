import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@karakeep/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    redirect("/dashboard/bookmarks");
  } else {
    redirect("/signin");
  }
}
