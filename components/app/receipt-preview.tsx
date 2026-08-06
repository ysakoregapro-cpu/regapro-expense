import { isPdfPath } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ReceiptPreview({
  path,
  url,
  className,
}: {
  path: string | null;
  url: string | null;
  className?: string;
}) {
  if (!path) {
    return (
      <div
        className={cn(
          "rounded-lg border border-line bg-surface-subtle px-4 py-8 text-center text-sm text-ink-secondary",
          className,
        )}
      >
        領収書なし
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={cn(
          "rounded-lg border border-line bg-surface-subtle px-4 py-8 text-center text-sm text-ink-secondary",
          className,
        )}
      >
        領収書を表示できません。権限またはファイルを確認してください。
      </div>
    );
  }

  const pdf = isPdfPath(path);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-surface", className)}>
      <div className="border-b border-line bg-surface-subtle px-3 py-2 text-xs font-medium text-ink-secondary">
        領収書
      </div>
      {pdf ? (
        <div className="bg-surface-subtle">
          <iframe
            title="領収書PDF"
            src={url}
            className="h-[480px] w-full bg-white"
          />
          <div className="border-t border-line px-3 py-2 text-xs">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              別タブで開く
            </a>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="領収書"
          className="max-h-[560px] w-full object-contain bg-surface-subtle"
        />
      )}
    </div>
  );
}
