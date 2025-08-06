import { headers } from "next/headers";
import { redirect } from "next/navigation";
import KarakeepLogo from "@/components/KarakeepIcon";
import ForgotPasswordForm from "@/components/signin/ForgotPasswordForm";

import { auth } from "@karakeep/auth";

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center">
          <KarakeepLogo height={80} />
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
