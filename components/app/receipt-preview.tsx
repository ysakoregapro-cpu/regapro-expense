import { isPdfPath } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ReceiptPreview({
  path,
  url,
  framed = false,
  className,
}: {
  path: string | null;
  url: string | null;
  framed?: boolean;
  className?: string;
}) {
  if (!path) {
    return (
      <div
        className={cn(
          "border-y border-line bg-surface-emphasis px-4 py-6 text-center text-[13px] text-ink-secondary sm:rounded-lg sm:border",
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
          "border-y border-line bg-surface-emphasis px-4 py-6 text-center text-[13px] text-ink-secondary sm:rounded-lg sm:border",
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
        framed && "bg-surface-emphasis",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="text-[12px] font-semibold text-ink">証憑</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-[12px] font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {pdf ? "PDFを開く" : "拡大表示"}
        </a>
      </div>
      {pdf ? (
        <div>
          <iframe
            title="領収書PDF"
            src={url}
            className="h-[360px] w-full bg-white sm:h-[420px] xl:h-[520px]"
          />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="領収書"
            className="max-h-[480px] w-full bg-surface-emphasis object-contain"
          />
        </a>
      )}
    </div>
  );
}
