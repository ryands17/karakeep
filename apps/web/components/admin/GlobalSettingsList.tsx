"use client";

import LoadingSpinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/client";
import { api } from "@/lib/trpc";

import { AdminCard } from "./AdminCard";

export default function GlobalSettingsSection() {
  const { t } = useTranslation();

  const invalidateGlobalSettings =
    api.useUtils().globalSettings.list.invalidate;
  const { data } = api.globalSettings.list.useQuery();

  const { mutateAsync: updateSetting } = api.globalSettings.toggle.useMutation({
    onSuccess: () => {
      toast({
        description: t("admin.global_settings.actions.updated"),
      });
      invalidateGlobalSettings();
    },
    onError: (e) => {
      console.error(e.message);
      toast({
        variant: "destructive",
        description: t("admin.global_settings.actions.error"),
      });
    },
  });

  const handleToggle = (name: string, checked: boolean) => {
    updateSetting({ name, value: checked });
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminCard>
        <div className="flex flex-col gap-4">
          <div className="mb-2 flex items-center justify-between text-xl font-medium">
            <span>{t("admin.global_settings.global_settings")}</span>
          </div>

          <Table>
            <TableHeader className="bg-gray-200">
              <TableHead>{t("admin.global_settings.table.name")}</TableHead>
              <TableHead>
                {t("admin.global_settings.table.description")}
              </TableHead>
              <TableHead>{t("admin.global_settings.table.value")}</TableHead>
            </TableHeader>
            <TableBody>
              {data.globalSettings.map((setting) => (
                <TableRow key={setting.name}>
                  <TableCell className="py-1">
                    {toSentenceCase(setting.name)}
                  </TableCell>
                  <TableCell className="py-1">{setting.description}</TableCell>
                  <TableCell className="flex gap-1 py-1">
                    <Switch
                      checked={Boolean(setting.value)}
                      onCheckedChange={(checked) =>
                        handleToggle(setting.name, checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminCard>
    </div>
  );
}

function toSentenceCase(input: string): string {
  if (!input) return "";

  const sentence = input.toLowerCase().replace(/_/g, " ");

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
