"use client";

import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";

export function LogoutButton({ label, to = "/admin/connexion" }: { label: string; to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="flex min-h-12 flex-none items-center rounded-field px-3 text-start text-danger hover:bg-bg"
      onClick={async () => {
        await authClient.signOut();
        router.replace(to);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
