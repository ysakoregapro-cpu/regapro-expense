# レガプロ経費申請

株式会社レガプロの社内経費申請Webアプリです。

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. `.env.example` を `.env.local` にコピーし、Supabase の値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

`SUPABASE_SECRET_KEY` は server-only です。Client Component や `NEXT_PUBLIC_*` へ置かないでください。

3. 開発サーバーを起動します。

```bash
npm run dev
```

## 主なルート

| パス | 説明 |
|---|---|
| `/login` | ログイン（ログインID / パスワード） |
| `/app` | 申請者ホーム |
| `/app/new` | 新規申請 |
| `/app/applications/[id]` | 申請詳細 |
| `/app/applications/[id]/edit` | 差し戻し再申請 |
| `/admin` | 管理者ホーム（未確認 / 全申請） |
| `/admin/applications/[id]` | 管理者詳細 |

## ドキュメント

- [UI仕様](docs/ui-spec.md)
- [実装計画](docs/implementation-plan.md)

## スクリプト

```bash
npm run lint
npm run build
npm run start
```
