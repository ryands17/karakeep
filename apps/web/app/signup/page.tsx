import { redirect } from "next/dist/client/components/navigation";
import { headers } from "next/headers";
import KarakeepLogo from "@/components/KarakeepIcon";
import SignUpForm from "@/components/signup/SignUpForm";

import { auth } from "@karakeep/auth";

export default async function SignUpPage() {
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
        <SignUpForm />
      </div>
    </div>
  );
}
