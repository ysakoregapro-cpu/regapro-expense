import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

export function ApplicantHeader({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            レガプロ経費申請
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-secondary sm:inline">
            {profile.display_name}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              ログアウト
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
