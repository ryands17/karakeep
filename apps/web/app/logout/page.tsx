"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";

import { useSearchHistory } from "@karakeep/shared-react/hooks/search-history";

export default function Logout() {
  const router = useRouter();
  const { clearHistory } = useSearchHistory({
    getItem: (k: string) => localStorage.getItem(k),
    setItem: (k: string, v: string) => localStorage.setItem(k, v),
    removeItem: (k: string) => localStorage.removeItem(k),
  });
  useEffect(() => {
    authClient.signOut().then(() => {
      clearHistory();
      router.push("/");
    });
  }, []);
  return <span />;
}
