import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-stretch justify-center",
        dims,
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[2px] rounded-[1px] bg-primary" />
      <span className="absolute inset-y-[3px] left-[5px] w-[2px] rounded-[1px] bg-craft" />
      <span className="absolute bottom-0 left-[10px] h-[2px] w-[6px] rounded-[1px] bg-primary/70" />
    </span>
  );
}
