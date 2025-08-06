import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InviteAcceptForm from "@/components/invite/InviteAcceptForm";
import KarakeepLogo from "@/components/KarakeepIcon";

import { auth } from "@karakeep/auth";

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center">
          <KarakeepLogo height={80} />
        </div>
        <InviteAcceptForm token={params.token} />
      </div>
    </div>
  );
}
