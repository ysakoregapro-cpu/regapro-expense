import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

export function AdminHeader({ profile }: { profile: Profile }) {
  return (
    <div className="flex h-14 items-center justify-end gap-3 border-b border-line bg-surface px-4">
      <span className="text-sm text-ink-secondary">{profile.display_name}</span>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="sm">
          ログアウト
        </Button>
      </form>
    </div>
  );
}
