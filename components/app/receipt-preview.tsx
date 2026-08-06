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
          "border-y border-line bg-surface-subtle px-4 py-6 text-center text-sm text-ink-secondary sm:rounded-lg sm:border",
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
          "border-y border-line bg-surface-subtle px-4 py-6 text-center text-sm text-ink-secondary sm:rounded-lg sm:border",
          className,
        )}
      >
        領収書を表示できません。権限またはファイルを確認してください。
      </div>
    );
  }

  const pdf = isPdfPath(path);

  return (
    <div
      className={cn(
        "overflow-hidden border-y border-line bg-surface sm:rounded-lg sm:border",
        className,
      )}
    >
      <div className="border-b border-line bg-surface-subtle px-3 py-2 text-xs font-medium text-ink-secondary">
        領収書
      </div>
      {pdf ? (
        <div className="bg-surface-subtle">
          <iframe
            title="領収書PDF"
            src={url}
            className="h-[420px] w-full bg-white xl:h-[520px]"
          />
          <div className="border-t border-line px-3 py-2 text-xs">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="max-h-[480px] w-full bg-surface-subtle object-contain xl:max-h-[560px]"
        />
      )}
    </div>
  );
}
