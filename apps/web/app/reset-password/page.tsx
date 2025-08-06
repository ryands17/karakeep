import { headers } from "next/headers";
import { redirect } from "next/navigation";
import KarakeepLogo from "@/components/KarakeepIcon";
import ResetPasswordForm from "@/components/signin/ResetPasswordForm";

import { auth } from "@karakeep/auth";

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    redirect("/");
  }

  const { token } = searchParams;

  if (!token) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center">
          <KarakeepLogo height={80} />
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
