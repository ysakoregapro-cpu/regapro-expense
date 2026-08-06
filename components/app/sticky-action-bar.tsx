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
        // Mobile: fixed bottom bar (solid, no glass). Desktop: in-flow sticky panel.
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 py-3",
        "lg:static lg:z-20 lg:mt-2 lg:rounded-lg lg:border",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
