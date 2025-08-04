"use client";

import LoadingSpinner from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n/client";
import { api } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

export default function ServerStats() {
  const { t } = useTranslation();
  const { data: serverStats } = api.admin.stats.useQuery(undefined, {
    refetchInterval: 5000,
    placeholderData: keepPreviousData,
  });

  if (!serverStats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 text-xl font-medium">
        {t("admin.server_stats.server_stats")}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="rounded-md border bg-background p-4 sm:w-1/4">
          <div className="text-sm font-medium text-gray-400">
            {t("admin.server_stats.total_users")}
          </div>
          <div className="text-3xl font-semibold">{serverStats.numUsers}</div>
        </div>
        <div className="rounded-md border bg-background p-4 sm:w-1/4">
          <div className="text-sm font-medium text-gray-400">
            {t("admin.server_stats.total_bookmarks")}
          </div>
          <div className="text-3xl font-semibold">
            {serverStats.numBookmarks}
          </div>
        </div>
        <div className="rounded-md border bg-background p-4 sm:w-1/4">
          <div className="text-sm font-medium text-gray-400">
            {t("admin.server_stats.server_version")}
          </div>
        </div>
      </div>
    </div>
  );
}
