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
        "sticky bottom-0 z-20 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/90 md:mx-0 md:rounded-lg md:border",
        className,
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
