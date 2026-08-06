import { cn } from "@/lib/utils";

export function StickyActionBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky-surface fixed inset-x-0 bottom-0 z-30 px-4 pt-3",
        "xl:static xl:z-20 xl:mt-1 xl:rounded-lg xl:border xl:border-line xl:pb-3",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>
    </div>
  );
}
