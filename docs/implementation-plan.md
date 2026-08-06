# レガプロ経費申請 — 実装計画

本書はコードベース監査結果と、Supabase上の**既存スキーマ（変更禁止）**を前提にした実装計画である。  
UIの見た目・情報設計は [`docs/ui-spec.md`](./ui-spec.md) を Source of Truth とする。

この段階ではアプリ本体の実装・マイグレーション作成は行わない。

---

## 1. 現在のコード構成の監査結果

監査日時点でリポジトリを実ファイルから確認した内容。推測で補完していない。

### 1.1 パッケージ / ランタイム

| 項目 | 実態 |
|---|---|
| `package.json` scripts | `dev` / `build` / `start` / `lint`（`eslint .`） |
| Next.js（lock） | **16.3.0**（`package.json` は `"next": "latest"`） |
| React（lock） | **19.2.8** |
| TypeScript（lock） | **5.9.3**（`strict: true`） |
| Tailwind CSS（lock） | **3.4.19**（`tailwind.config.ts` + PostCSS + `tailwindcss-animate`） |
| `@supabase/ssr`（lock） | **0.12.4**（`package.json` は `latest`） |
| `@supabase/supabase-js`（lock） | **2.112.1** |
| UI基盤 | shadcn/ui new-york（`components.json`）、Radix、CVA、lucide-react、next-themes |

補足: `eslint-config-next` は `15.3.1` 表記。Next 本体は 16.3.0。将来の設定ずれに注意。

### 1.2 App Router 構成

`middleware.ts` は**存在しない**。Next.js 16 系スターターの **`proxy.ts`（ルート）** がセッション更新入口。

```text
app/
  layout.tsx              # Geist、ThemeProvider、英語 metadata（スターター）
  page.tsx                # スターターランディング（Hero / tutorial）
  globals.css             # shadcn HSL トークン + dark
  auth/
    login/page.tsx
    sign-up/page.tsx
    sign-up-success/page.tsx
    forgot-password/page.tsx
    update-password/page.tsx
    error/page.tsx
    confirm/route.ts      # verifyOtp
  protected/
    layout.tsx
    page.tsx              # getClaims() で保護例示
```

経費ドメインの `app/` ルートは未作成。`supabase/` ディレクトリ・ローカルマイグレーションも**なし**（スキーマはリモート作成済み前提）。

### 1.3 TypeScript

- `tsconfig.json`: `paths` に `@/*` → `./*`
- `jsx: react-jsx`、`moduleResolution: bundler`
- `next.config.ts`: `cacheComponents: true`

### 1.4 Tailwind

- 設定ファイル: `tailwind.config.ts`
- darkMode: `class`
- 色は `hsl(var(--...))` 経由の shadcn トークン
- `components.json` の `tailwind.config` フィールドは空文字（実体は上記 ts 設定）

製品UIでは `docs/ui-spec.md` の固定色へ CSS 変数を寄せる。ダークモード依存の製品トーンは採用しない（`ThemeProvider` の扱いを実装時に整理）。

### 1.5 lib/supabase と Cookie 認証

| ファイル | 役割 |
|---|---|
| `lib/supabase/client.ts` | Browser: `createBrowserClient` |
| `lib/supabase/server.ts` | Server: `createServerClient` + `cookies()` getAll/setAll |
| `lib/supabase/proxy.ts` | `updateSession`: Cookie 更新 + `auth.getClaims()` + 未ログイン時 `/auth/login` リダイレクト |
| `proxy.ts` | 上記 `updateSession` を呼ぶエントリ + matcher |

環境変数（`.env.example`）:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`hasEnvVars`（`lib/utils.ts`）で両方が揃っているかを判定。未設定時は proxy の認証チェックをスキップ（スターター挙動）。

認可関連 API（インストール済み `@supabase/auth-js`）:

- **`getClaims()`**: スターターが proxy / protected / AuthButton で使用中 → **維持して第一候補**
- **`getUser()`**: 利用可能。Auth サーバー検証が必要な場合の代替
- **`getSession()`**: サーバー上の認可判断の唯一根拠にしてはならない（SDKコメントどおり）

### 1.6 既存認証UI

- `components/login-form.tsx`: `signInWithPassword({ email, password })`、成功後 `/protected`
- Sign up / Forgot password / Update password フォームとページが揃っている
- ログイン画面は Card ベース、英語コピー、Forgot / Sign up リンクあり → **製品仕様では除去・置換**

### 1.7 既存UIコンポーネント

`components/ui/`: `button` / `input` / `label` / `badge` / `card` / `checkbox` / `dropdown-menu`

その他スターター装飾: `hero` / `theme-switcher` / `deploy-button` / `tutorial/*` / logos 等。

### 1.8 lint / build

```bash
npm run lint    # eslint .
npm run build   # next build
npm run dev     # next dev
```

---

## 2. 維持する既存コード

認証基盤（Supabase公式スターターの骨子）は壊さない。

- Browser Client / Server Client の分離（`lib/supabase/client.ts` / `server.ts`）
- Cookie ベースセッション
- `proxy.ts` + `lib/supabase/proxy.ts` の Cookie 更新と `getClaims()`
- Server Component での認証確認パターン（`createClient` + claims/user）
- `app/auth/login` の存在（中身は製品仕様に合わせて改修）
- `app/auth/confirm` / `error` はパスワードフロー上必要な範囲で維持検討
- `cn()`（`lib/utils.ts`）
- shadcn の素となる `Button` / `Input` / `Label` 等（トークン調整前提）
- パスエイリアス `@/*`

---

## 3. 削除または非製品化するもの（スターター）

製品導線から外す／削除対象（実装フェーズ）:

| 対象 | 理由 |
|---|---|
| `app/page.tsx` の Hero / tutorial / Deploy | 製品トップではない |
| `components/hero.tsx`、`tutorial/*`、logos、`deploy-button` | スターター宣伝 |
| `components/theme-switcher.tsx` と暗黙の宣伝フッター | 業務UI不要（ThemeProvider方針とセットで整理） |
| Sign up / Forgot / Sign-up success の**露出** | UI仕様: 非表示。ルート無効化またはリダイレクト |
| `login-form` の Sign up / Forgot リンク | 仕様違反 |
| `app/protected/*` | 経費の役割別シェルへ置換 |
| `AuthButton` の Sign up CTA・「Hey, email」装飾 | 製品コピーに不適 |
| 無制約の汎用 `Card` 多用パターン | UI仕様で制限 |

> 物理削除かルート遮断かは実装時判断。いずれにせよユーザー向けナビに出さない。

---

## 4. 追加予定ファイル（案）

実際のファイル名は実装時に微調整してよいが、責務は固定する。

### 4.1 App Router

```text
app/
  (applicant)/...          # 申請者シェル
  (admin)/admin/...        # 管理者シェル
  auth/login/page.tsx      # 改修
  actions/expenses.ts      # Server Actions（申請・承認等）
  api/...                  # 必要な場合のみ（Signed URL等）。原則 Server Action 優先
```

想定ページ:

- 申請者一覧・新規・詳細・再申請
- 管理者未確認・全申請・詳細

### 4.2 コンポーネント（UI仕様準拠）

`components/expense/` または `components/app/` 配下に:

`AppShell` / `ApplicantHeader` / `AdminSidebar` / `AdminHeader` / `PageHeader` / `InlineSummary` / `StatusBadge` / `ExpenseListRow` / `ExpenseDataTable` / `Field` / `FieldError` / `InlineAlert` / `EmptyState` / `ReceiptPreview` / `StickyActionBar` / `ConfirmDialog` / `SubmitButton` / `LoadingState`

### 4.3 lib

```text
lib/supabase/admin.ts          # SUPABASE_SECRET_KEY・server-only
lib/auth/get-current-profile.ts # getClaims/getUser + profiles
lib/auth/require-role.ts
lib/expenses/format.ts          # 金額・日付・申請番号表示
lib/expenses/labels.ts          # status / type 日本語ラベル
lib/storage/receipts.ts         # upload path生成・Signed URL・失敗時削除
lib/errors/map-auth-error.ts    # 生文字列をユーザー向けに変換
```

### 4.4 スタイル

- `app/globals.css`: UI仕様の CSS 変数を追加し、Tailwind theme に接続
- 必要なら `tailwind.config.ts` の color / radius を製品トークンへマップ

---

## 5. 変更予定ファイル

| ファイル | 変更内容 |
|---|---|
| `app/layout.tsx` | metadata日本語化、フォントスタック、ThemeProvider方針 |
| `app/globals.css` | 製品カラートークン |
| `tailwind.config.ts` | トークン接続、過剰 radius の抑制 |
| `proxy.ts` / `lib/supabase/proxy.ts` | 製品ルートの保護・ログイン済みリダイレクト調整（セッション更新ロジックは維持） |
| `components/login-form.tsx` | ログインID＋パスワード、リンク除去、リダイレクト先を役割別ホームへ |
| `app/auth/login/page.tsx` | 幅 400–440、影なし |
| `.env.example` | `SUPABASE_SECRET_KEY` を追記（値は書かない） |
| `components/ui/button.tsx` 等 | 高さ・radius・色を仕様へ |

既存スキーマの SQL / RLS / RPC / Storage ポリシーは**変更しない**。

---

## 6. 既存スキーマ（Source of Truth 要約）

変更・再設計・マイグレーション作成はしない。詳細はユーザー提供定義を正とする。

### 6.1 ENUM

- `app_role`: `applicant` / `admin` / `system_admin`
- `expense_application_type`: `advance` / `after`
- `expense_status`: `pending` / `approved` / `returned`
- `expense_event_type`: `submitted` / `resubmitted` / `approved` / `returned`

### 6.2 テーブル

- `profiles`
- `expense_categories`（初期9項目）
- `expense_applications`
- `expense_application_versions`
- `expense_events`

### 6.3 RPC

- `is_active_user()` / `is_admin()`
- `approve_expense_application(p_application_id, p_admin_note default null)`
- `return_expense_application(p_application_id, p_admin_note)` ※ note 必須
- `resubmit_expense_application(...)`

### 6.4 Storage

- Private bucket: `expense-receipts`
- パス: `{auth.uid()}/{randomUUID}/{safeFileName}`
- 想定: ≤10MB、jpeg/png/webp/pdf
- 表示はサーバー側 Signed URL

---

## 7. 認証実装計画

1. **セッション更新**: 現行 `proxy` + `updateSession` + `getClaims()` を維持
2. **身元確認**: 認可の入口で `getClaims()` または `getUser()` を使用。`getSession()` 単独信用禁止
3. **プロファイル**: `profiles` を `id = auth.uid()` で取得し、`role` / `is_active` / `display_name` / `login_id` をアプリ状態の正とする
4. **失効ユーザー**: `is_active = false` ならログイン後も業務画面へ進ませない（Server で遮断）
5. **ログインUI**: ログインID＋パスワード。製品に Sign up / Forgot / Magic Link を出さない
6. **ログイン後遷移**:
   - `applicant` → 申請者一覧
   - `admin` / `system_admin` → 管理者未確認一覧
7. **Admin Client**: `SUPABASE_SECRET_KEY` を使うクライアントは `server-only`。Browser に露出禁止

Auth はメール＋パスワード（現行 `signInWithPassword`）を前提に見えるが、UIラベルは「ログインID」。対応関係は §14 要確認事項。

---

## 8. 権限制御計画

### 8.1 役割分担

| 層 | 責任 |
|---|---|
| RLS | 行レベルの最終防衛（本人の申請のみ、admin は全件読取、anon 無権限） |
| Server Component / Layout | 未ログイン・非アクティブ・ロール不一致のリダイレクト |
| Server Action / Route Handler | 操作前に `getClaims`/`getUser` + `profiles.role` + 必要なら `is_admin()` RPC |
| UI | 導線の出し分けのみ。UI非表示を認可とみなさない |

### 8.2 画面アクセス

| ロール | 許可 |
|---|---|
| `applicant` | 申請者シェルのみ。`/admin/*` 禁止 |
| `admin` / `system_admin` | 管理者シェル。申請者画面への共用ダッシュボード化はしない（必要なら閲覧専用の明確な別仕様） |
| 非アクティブ | 全業務画面禁止 |

### 8.3 操作

| 操作 | 誰 | 手段 |
|---|---|---|
| 新規申請 INSERT | active 本人 | `expense_applications` INSERT（トリガーに委任する列は送らない／上書きしない） |
| 承認 | admin系 | `approve_expense_application` |
| 差し戻し | admin系 | `return_expense_application`（コメント必須） |
| 再申請 | 本人・returned | `resubmit_expense_application` |
| 領収書 Signed URL | 本人 or admin系 | サーバーのみ |

RLSに加えてサーバー側でも必ず確認する。

---

## 9. 画面 × 列の読み書きマップ

### 9.1 申請者一覧

**READ** `expense_applications`（RLSで本人分）:

表示: `status`, `category_name_snapshot`, `amount`, `expense_date`, `application_no`, `updated_at`, `admin_note`（差し戻し優先用）, `version`, `id`

集計: `returned` / `pending` / `approved` 件数

### 9.2 新規申請フォーム

**READ** `expense_categories`（`is_active=true`）: `id`, `code`, `name`, `sort_order`

**WRITE** Storage `expense-receipts`（必要な場合）→ path 確定後  
**INSERT** `expense_applications`:

送る列:

- `application_type`
- `category_id`
- `amount`
- `expense_date`
- `description`
- `after_reason`（after時）
- `receipt_path`（after必須、advance任意）

DBトリガーへ任せる（クライアントが権威を持たない）:

- `applicant_id`, `applicant_name_snapshot`, `category_name_snapshot`
- `application_no`, `status`, `version`
- `submitted_at` / `created_at` / `updated_at`
- `admin_note`, `reviewed_at`, `reviewed_by`

### 9.3 再申請フォーム

**READ** 対象行（本人・`returned`）: 現値の初期表示 + `admin_note`

**WRITE** 領収書が変わる場合は Storage アップロード  
**RPC** `resubmit_expense_application` に引数を渡す（アプリケーション列を直接 UPDATE しない）

### 9.4 申請者詳細

**READ** `expense_applications` 1件  
**READ** `expense_events`（操作履歴）  
**READ** 必要なら `expense_application_versions`  
**READ** Signed URL（`receipt_path`）

### 9.5 管理者一覧

**READ** 全 `expense_applications`（admin RLS）:

列: `version`（新規/再申請）, `applicant_name_snapshot`, `application_type`, `category_name_snapshot`, `expense_date`, `amount`, `status`, `submitted_at`, `id`

サマリー追加集計: pending件数、pendingかつ version>1、当月 approved 合計

### 9.6 管理者詳細

**READ** 申請1件 + `expense_events` + Signed URL  
**RPC** 承認 / 差し戻し（pending時）

書き込み列はRPC側（`status`, `admin_note`, `reviewed_at`, `reviewed_by`, events）。クライアントの直接 UPDATE はしない。

---

## 10. 申請処理計画

### 10.1 新規申請シーケンス

1. クライアント検証（必須・after制約・金額>0・ファイル型/サイズ）
2. 領収書がある場合: Storage へ upload（パス `{uid}/{uuid}/{safeName}`）
3. `expense_applications` INSERT（§9.2の列のみ）
4. INSERT失敗時: アップロード済みオブジェクトを削除して補償
5. 成功: 詳細または一覧へ。二重送信防止

### 10.2 承認

1. サーバーで admin 確認
2. `approve_expense_application(id, note?)`
3. 失敗（非pending等）をユーザー向けメッセージへマップ

### 10.3 差し戻し

1. コメント必須（UI + RPC）
2. ConfirmDialog
3. `return_expense_application(id, note)`

### 10.4 再申請

1. 本人・`returned` をサーバー再確認
2. 必要なら新領収書アップロード
3. `resubmit_expense_application(...)`
4. 失敗時の Storage 補償

履歴の正:

- 操作履歴 UI ← `expense_events`
- 版の中身 ← `expense_application_versions`

---

## 11. Storage 処理計画

Bucket: `expense-receipts`（Private）

1. **アップロード**: authenticated + active、自分の UID 配下のみ（Storage RLS）
2. **パス生成**: サーバーまたは信頼できるクライアント規則で `{auth.uid()}/{randomUUID}/{safeFileName}`。`safeFileName` は拡張子を維持し、パストラバーサル文字を除去
3. **表示**: Server Component / Action で短時間 Signed URL を発行。URLをDBに永続化しない
4. **権限**: 本人は自分のパス、admin系は全領収書（既存Storage RLS）
5. **失敗補償**: DB書き込み失敗時はオブジェクト削除
6. **Admin Client**: Signed URL 一括や例外処理が anon/publishable で不足する場合のみ `SUPABASE_SECRET_KEY`（server-only）

公開バケットは使わない。

---

## 12. UIコンポーネント実装順

1. デザイントークン（CSS変数 + Tailwind接続）
2. `Field` / `FieldError` / `SubmitButton` / `StatusBadge` / `InlineAlert` / `EmptyState` / `LoadingState`
3. ログイン画面の製品化
4. `getCurrentProfile` とロール分岐レイアウト（`AppShell` / `ApplicantHeader` / `AdminSidebar`）
5. `PageHeader` / `InlineSummary`
6. 申請者一覧（`ExpenseListRow`）
7. 申請フォーム + カテゴリ読取 + Storage
8. 申請者詳細 + `ReceiptPreview` + events
9. 管理者一覧（`ExpenseDataTable`）+ モバイル行レイアウト
10. 管理者詳細分割 + `StickyActionBar` + ConfirmDialog + 承認/差戻しRPC
11. 再申請フロー
12. スターター遺物の削除／遮断
13. `390 / 768 / 1440` 視覚監査（ui-spec §13）
14. `npm run lint` / `npm run build`

---

## 13. lint / build 確認

実装マイルストーン毎:

```bash
npm run lint
npm run build
```

認証・Cookie・`cacheComponents` との相性で Server Component の async 境界に注意する。

---

## 14. 手動確認項目

### 認証

- [ ] 未ログインで業務URL → `/auth/login`
- [ ] ログインID/パスワードで入場
- [ ] Sign up / Forgot がUIに出ない
- [ ] applicant が `/admin` に入れない
- [ ] admin が申請者シェルを常用しない
- [ ] `is_active=false` を遮断できる

### 申請者

- [ ] 新規申請が短時間で完了
- [ ] after で理由・領収書なしが送れない
- [ ] 一覧が行リスト（カード羅列でない）
- [ ] 差し戻しが優先表示され再申請できる
- [ ] 金額表示が仕様どおり

### 管理者

- [ ] 未確認がすぐ見つかる
- [ ] PC一覧が table、行クリックで詳細
- [ ] 詳細で領収書同時確認
- [ ] 承認 / 差し戻し（赤塗り差戻しボタンでない）
- [ ] StickyActionBar
- [ ] モバイルが横スクロールtableでない

### 技術

- [ ] Signed URL がクライアント秘密鍵なしで動く
- [ ] INSERT失敗時にゴミファイルが残らない
- [ ] エラーが生DB文字列でない

---

## 15. リスクと対策

| リスク | 対策 |
|---|---|
| `getSession()` 誤用 | ルール化。入口は `getClaims` / `getUser` + `profiles` |
| Storage成功・DB失敗 | 補償削除を Action 内で必ず実施 |
| 二重送信 | SubmitButton disabled + 可能なら冪等UI |
| スターターUIへの退行 | Cursor Rule + ui-spec 監査リスト |
| publishable key での Signed URL / 権限不足 | server-only Admin Client を限定利用 |
| `cacheComponents: true` と動的認証 | 動的データ境界を明示し、ビルドで検証 |
| ロールを JWT `user_metadata` に置く誘惑 | **禁止**。`profiles.role` を正（Supabaseセキュリティ指針） |

---

## 16. 要確認事項 → 確定仕様（実装反映済み）

以下は実装前に確定した回答。実装はこの方針に従う。

1. **login_id と Auth メール**  
   login_id はアプリの識別子。Auth メールは内部のみ。一致不要。ログインは Admin で `profiles.login_id` 完全一致 → `auth.admin.getUserById` → Server Client で `signInWithPassword`。login_id は trim + 小文字正規化。初版にユーザー管理画面なし。

2. **新規申請の versions / events**  
   DBトリガーが version=1 スナップショットと `submitted` を自動記録。アプリから重複 INSERT しない。再申請・承認・差し戻しの履歴も既存 RPC / トリガーのみ。

3. **再申請時の旧領収書**  
   差し替え時も旧ファイルは削除しない（監査のため）。補償削除は「新規アップロード後に INSERT / 再申請 RPC が失敗した」場合のみ。

4. **Signed URL**  
   通常閲覧は Cookie 対応 Server Client。Admin Client で RLS 回避しない。Admin Client の Storage 利用は補償削除などサーバー管理処理に限定。

5. **新規 INSERT 送信列**  
   `application_type` / `category_id` / `amount` / `expense_date` / `description` / `after_reason` / `receipt_path` のみ。採番・snapshot・status・version・タイムスタンプはトリガー任せ。

6. **last_login_at**  
   ログイン成功後に Admin Client で更新可。失敗してもログインは成功させ、安全なログのみ残す。

7. **スキーマ変更**  
   初版ではテーブル/列/ENUM/RPC/RLS/Storage/マイグレーションの変更を行わない。

補足（実装での扱い）:

- 事前申請は事後理由・領収書を UI 非表示（アップロードしない）
- `system_admin` は admin と同一シェル
- 今月承認額は `reviewed_at` の Asia/Tokyo 月次合計
- ユーザー作成は Dashboard 等の既存運用前提

---

## 17. この段階の完了条件

- [x] リポジトリ監査
- [x] `docs/ui-spec.md`
- [x] `docs/implementation-plan.md`
- [x] `.cursor/rules/regapro-expense-ui.mdc`
- [ ] アプリ本体実装（次フェーズ）
- [ ] DB/ENUM/RPC/RLS/Storage 変更（行わない）
