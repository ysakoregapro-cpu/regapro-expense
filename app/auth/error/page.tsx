import { AppShell } from "@/components/app/app-shell";

export default function AuthErrorPage() {
  return (
    <AppShell className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface px-5 py-6 text-center">
        <h1 className="text-lg font-semibold text-ink">認証エラー</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          認証処理に失敗しました。ログイン画面から再度お試しください。
        </p>
        <a
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          ログインへ戻る
        </a>
      </div>
    </AppShell>
  );
}
