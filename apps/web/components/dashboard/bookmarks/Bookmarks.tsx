import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { api } from "@/server/api/client";

import type { ZGetBookmarksRequest } from "@karakeep/shared/types/bookmarks";
import { auth } from "@karakeep/auth";

import UpdatableBookmarksGrid from "./UpdatableBookmarksGrid";

export default async function Bookmarks({
  query,
  header,
  showDivider,
  showEditorCard = false,
}: {
  query: Omit<ZGetBookmarksRequest, "sortOrder" | "includeContent">; // Sort order is handled by the store
  header?: React.ReactNode;
  showDivider?: boolean;
  showEditorCard?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    redirect("/");
  }

  const bookmarks = await api.bookmarks.getBookmarks({
    ...query,
  });

  return (
    <div className="flex flex-col gap-3">
      {header}
      {showDivider && <Separator />}
      <UpdatableBookmarksGrid
        query={query}
        bookmarks={bookmarks}
        showEditorCard={showEditorCard}
      />
    </div>
  );
}
