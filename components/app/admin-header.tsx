import type { Profile } from "@/lib/types/database";

/** Top bar for admin content area — contextual, compact. */
export function AdminHeader({ profile }: { profile: Profile }) {
  return (
    <div className="hidden h-14 items-center justify-end border-b border-line bg-surface px-5 lg:flex">
      <p className="text-[13px] text-ink-secondary">
        <span className="font-medium text-ink">{profile.display_name}</span>
        <span className="mx-2 text-ink-muted">·</span>
        承認作業スペース
      </p>
    </div>
  );
}
