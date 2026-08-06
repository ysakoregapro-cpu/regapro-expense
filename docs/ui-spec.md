# レガプロ経費申請 — UI仕様書

本書は株式会社レガプロ社内経費申請WebアプリのUI/UX設計の Source of Truth である。  
実装およびUI変更時は、必ず本書を参照すること。曖昧な「SaaS風」解釈は禁止する。

関連:

- 実装計画: [`docs/implementation-plan.md`](./implementation-plan.md)
- 永続ルール: [`.cursor/rules/regapro-expense-ui.mdc`](../.cursor/rules/regapro-expense-ui.mdc)
- バックエンド・スキーマ: Supabase上の既存ENUM/TABLE/RPC/RLS/Storage（変更しない）

---

## 1. デザインコンセプト

**落ち着いた日本企業向け業務SaaS。派手さではなく、処理速度・信頼感・判断しやすさを重視する。**

参考にするのはサービス外形ではなく、次の設計原則のみとする。

- 申請者と承認者の役割別最適化（同一ダッシュボード構造の使い回し禁止）
- 一覧での比較と判断のしやすさ
- 段階的な情報開示
- 証憑と申請内容の同時確認
- 色ではなく余白・整列・文字ウェイトによる階層
- 主要アクションの明確化
- 差し戻しなど対応が必要な状態の優先表示

視覚のトーンはニュートラルなグレー基盤に、Primary navy を業務アクションの軸として置く。紫・シアン・ネオン・グラデーション・ガラス・装飾ブロブは用いない。

---

## 2. 利用者別の優先タスク

### 2.1 applicant（申請者）

1. 新しい経費を短時間で申請する
2. 自分の申請状態を確認する
3. 差し戻された申請を修正して再申請する

情報構造は「自分の仕事」に最適化する。管理者向けの未確認件数テーブルや横断フィルタは置かない。

### 2.2 admin / system_admin（承認・システム管理者）

本UI上、両ロールは同じ管理者シェルを使用する（業務承認導線は `is_admin()` 相当）。

1. 未処理申請をすぐ発見する
2. 申請内容と領収書を同一画面で確認する
3. 少ない操作で承認または差し戻しする

申請者と同一のサマリー行リストを流用しない。PCではサイドバー＋データテーブルを基本とする。

> `system_admin` 固有のユーザー管理画面等は、現状スキーマに管理用RPCが無いため本仕様の必須画面には含めない。必要になれば別仕様として追加する。

---

## 3. デザイントークン

色は CSS 変数で管理する。コンポーネント内に hex を直接ばら撒かない。

### 3.1 色

| トークン | CSS変数案 | 値 |
|---|---|---|
| App background | `--app-bg` | `#F6F7F9` |
| Surface | `--surface` | `#FFFFFF` |
| Subtle surface | `--surface-subtle` | `#FAFBFC` |
| Primary text | `--text-primary` | `#17202A` |
| Secondary text | `--text-secondary` | `#667085` |
| Muted text | `--text-muted` | `#98A2B3` |
| Border | `--border` | `#E4E7EC` |
| Border strong | `--border-strong` | `#D0D5DD` |
| Primary navy | `--primary` | `#244566` |
| Primary hover | `--primary-hover` | `#1C3855` |
| Focus ring | `--focus-ring` | `#4B7398` |
| Approved text | `--status-approved-text` | `#256044` |
| Approved background | `--status-approved-bg` | `#EAF5EF` |
| Pending text | `--status-pending-text` | `#805600` |
| Pending background | `--status-pending-bg` | `#FFF7DF` |
| Returned text | `--status-returned-text` | `#9A3412` |
| Returned background | `--status-returned-bg` | `#FFF0E7` |
| Destructive text | `--destructive-text` | `#B42318` |
| Destructive background | `--destructive-bg` | `#FEECEB` |

### 3.2 角丸

| 対象 | 値 |
|---|---|
| Input / button | `6px` |
| 一般パネル | `8px` |
| Dialog / popover | `10px` |
| 12px超 | **原則禁止**（`rounded-2xl` / `rounded-3xl` 禁止） |

### 3.3 影

- 通常パネル・Header・table・form: **影なし**
- Dialog / popover / floating menu のみ、非常に薄い影を許可
- 区切りは余白、背景差、1px border、divider で表現
- `shadow-md` / `shadow-lg` の常用禁止

### 3.4 余白（4px単位）

許可スケール: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`

理由のない `p-8`・`py-12`・`gap-8` の連発は禁止。画面内の主余白は `16〜24`、セクション間は `24〜32` を目安とする。

### 3.5 高さ

| 要素 | 値 |
|---|---|
| PC button | `40px` |
| Mobile primary button | `44px` 以上 |
| Input | `42〜44px` |
| Table row | `48〜56px` |
| Header | `56px` 前後 |
| 管理サイドバー幅 | `208〜224px` |

### 3.6 タイポグラフィ

```text
font-family:
  Geist Sans,
  Inter,
  "Noto Sans JP",
  "Yu Gothic UI",
  "Hiragino Kaku Gothic ProN",
  sans-serif;
```

| 用途 | サイズ |
|---|---|
| 画面タイトル | `24〜28px`（`text-4xl` 以上禁止） |
| セクションタイトル | `16〜18px` |
| 本文 | `14px` |
| 補助情報 | `12〜13px` |
| テーブル | `13〜14px` |

金額:

- `text-align: right`
- `font-variant-numeric: tabular-nums`
- 3桁カンマ
- 「円」表示
- **金額全体への `font-mono` 適用禁止**
- 等幅は申請番号（`application_no`）のみ許可

---

## 4. 禁止UI一覧

次を実装してはならない。

1. 大きなKPIカードを3〜4枚並べるダッシュボード
2. 影付き白い長方形カードの等間隔羅列
3. すべての情報をカードで囲う構成
4. `rounded-2xl` / `rounded-3xl` の多用
5. `shadow-md` / `shadow-lg` の常用
6. 紫・シアン・ネオン系中心の配色
7. グラデーション
8. ガラスモーフィズム
9. 背景の装飾用ブロブ
10. 巨大なアイコン入りKPIパネル
11. 業務に不要なヒーローコピー
12. 「おかえりなさい」「今日も頑張りましょう」等の装飾文
13. `text-4xl` 以上の巨大ページタイトル
14. 情報密度が低くスクロールだけが増えるUI
15. PC版一覧のカード縦並び
16. モバイルでPCテーブルをそのまま横スクロール
17. すべてのボタンを同じ強さ・同じ色で表示
18. 全画面共通で `max-w-5xl` を使うこと
19. 金額全体への開発者向け `font-mono`
20. 無目的な汎用 `Card` コンポーネントの量産

---

## 5. 画面一覧と最大幅

| 画面 | 想定ルート（案） | 最大幅 / レイアウト |
|---|---|---|
| ログイン | `/login` | フォーム幅 `400〜440px` |
| 申請者一覧 | `/app` または `/expenses` | `960〜1080px` |
| 新規申請 / 再申請フォーム | `/expenses/new`, `/expenses/[id]/edit` | `720〜800px` |
| 申請者詳細 | `/expenses/[id]` | `960〜1080px` |
| 管理者未確認一覧 | `/admin/pending` | サイドバー＋本文（本文 `~1280px` または利用可能幅） |
| 管理者全申請 | `/admin/expenses` | 同上 |
| 管理者詳細 | `/admin/expenses/[id]` | サイドバー＋分割詳細（本文を `max-w-5xl` に押し込まない） |

ルート最終パスは実装済みの `/login` / `/app` / `/admin` 系に従う。スターターの `/protected` / `/auth/sign-up` 等は製品から撤去済み。

---

## 6. 全画面ワイヤーフレーム

記法: `[ ]` は領域、`→` は主要導線。ASCIIは情報構造の固定用であり、装飾の指示ではない。

### 6.1 ログイン

```text
[ app-bg 全面 ]
        ┌─────────────────────────┐  400–440px
        │ レガプロ経費申請          │  小さなアプリ名
        │                         │
        │ ログインID  [________]  │  label常時表示
        │ パスワード  [________]  │
        │                         │
        │ [ ログイン ]            │  Primary CTA のみ
        └─────────────────────────┘
```

要件:

- 背景は薄いニュートラルグレー（`--app-bg`）
- 白い面を使う場合も影なし。薄い境界線または余白で分離
- Sign up / Forgot password / Magic Link **非表示**
- 主要CTAはログイン1つ

### 6.2 申請者 — 一覧

```text
[ PageHeader: 経費申請          [新規申請] ]
[ InlineSummary: 要対応 N｜確認待ち N｜承認済み N ]
[ 差し戻しがある場合のみ InlineAlert（修正依頼） ]

行リスト（divider、カード羅列禁止）
┌──────────────────────────────────────────────────────┐
│ Status │ 項目 │ 金額(右) │ 日付 │ 申請番号 │ 更新     │
├──────────────────────────────────────────────────────┤
│ …                                                    │
└──────────────────────────────────────────────────────┘
```

- 差し戻し（`returned`）はサマリー直後と一覧上位で優先表示
- 「要対応」= `returned` 件数
- 「確認待ち」= `pending` 件数
- 「承認済み」= `approved` 件数

### 6.3 申請者 — 新規申請 / 再申請フォーム

```text
[ PageHeader: 新規申請 / 修正して再申請 ]

申請区分 *        (advance / after)
経費項目 *        (expense_categories)
金額 * ｜ 日付 *  (PCのみ2カラム)
内容・目的 *
事後になった理由   (after時必須)
領収書             (after時必須 / advanceは任意)

[ 戻る(弱) ]              [ 申請する(Primary) ]
```

再申請（`status=returned`）時:

- 上部に管理者コメント（`admin_note`）を InlineAlert で明示
- 左端 3〜4px の returned アクセント
- 主要CTA文言は「修正して再申請」
- 画面全体を赤くしない

### 6.4 申請者 — 詳細

```text
[ StatusBadge + 申請番号 + 金額 ]
[ 申請情報（区分・項目・日付） ]
[ 内容・目的 / 事後理由 ]
[ 領収書プレビュー（Signed URL） ]
[ 操作履歴（expense_events） ]
※ returned の場合 Sticky ではなく主要位置に [修正して再申請]
```

### 6.5 管理者 — シェル

```text
┌──────────┬───────────────────────────────────────────┐
│ Sidebar  │ AdminHeader + PageHeader + InlineSummary  │
│ 208–224  │                                           │
│ アプリ名  │ メイン（一覧 or 詳細）                      │
│ 未確認申請│                                           │
│ 全申請   │                                           │
└──────────┴───────────────────────────────────────────┘
```

サイドバー:

- 大きなアイコンタイル禁止
- 選択状態は薄い背景＋左側アクセント（Primary navy）
- 必要最小限の項目のみ

サマリー例（KPIカード禁止）:

`未確認 5件　再申請 2件　今月承認額 186,000円`

- 未確認: `status=pending`
- 再申請: `status=pending` かつ `version > 1`
- 今月承認額: 当月 `approved` の `amount` 合計（表示用集計）

### 6.6 管理者 — 一覧（table）

必須列:

| 列 | データ根拠 |
|---|---|
| 新規／再申請 | `version === 1` → 新規 / `version > 1` → 再申請 |
| 申請者 | `applicant_name_snapshot` |
| 事前／事後 | `application_type`（advance / after） |
| 経費項目 | `category_name_snapshot` |
| 日付 | `expense_date` |
| 金額 | `amount` |
| ステータス | `status` |
| 受付日時 | `submitted_at` |

- 行全体クリックで詳細へ
- 行内に複数操作ボタンを並べない

### 6.7 管理者 — 詳細（分割）

PC:

```text
左 62–68%                      右 32–38%
[ 申請情報 / 内容 / 事後理由 ]   [ 領収書プレビュー ]
[ 操作履歴 expense_events ]     [ （必要ならバージョン） ]

[ StickyActionBar: 戻る | 差し戻し | 承認 ]
```

スマホ（縦順）:

1. ステータスと申請概要  
2. 申請内容  
3. 領収書  
4. 操作履歴  
5. 固定された承認／差し戻し操作  

アクション強度:

| 操作 | 強度 |
|---|---|
| 承認 | Primary |
| 差し戻し | Secondary / warning（赤塗り破壊的ボタンにしない） |
| 戻る | Tertiary |

差し戻し時はコメント必須（`return_expense_application` の `p_admin_note`）。ConfirmDialog で確認する。

---

## 7. PC / タブレット / モバイルの変化

監査サイズ:

| 名称 | サイズ | 位置づけ |
|---|---|---|
| Mobile | `390 × 844` | 申請者の主要利用＋管理者の出先確認 |
| Tablet | `768 × 1024` | 中間。管理者サイドバーの折りたたみ判断点 |
| Desktop | `1440 × 900` | 管理者の主戦場。table＋分割詳細 |

### 7.1 ブレークポイント方針

既存 Tailwind デフォルトを利用する想定:

- `< md` (~768未満): モバイルレイアウト
- `md`〜`lg` 未満: タブレット
- `lg` 以上 (~1024+): デスクトップ（管理者サイドバー常時）

### 7.2 何が変化するか

| 要素 | 390 | 768 | 1440 |
|---|---|---|---|
| 申請者一覧 | 2段行（上: 状態・項目・金額 / 下: 日付・申請番号）。行タップ。divider。カード影なし | 1行寄りに情報追加可 | フル1行列 |
| 管理者一覧 | table禁止。密度の高い行レイアウトへ変形 | 行レイアウトまたは簡略table | table必須 |
| 管理者シェル | サイドバーはドロワー／上部ナビ | 折りたたみ可 | 左固定 208–224px |
| 申請フォーム | 全1カラム。Primary CTA 44px+ | 金額・日付を2カラム開始可 | 金額・日付のみ2カラム。幅 720–800 |
| 管理者詳細 | 縦積み＋下部固定アクション | 縦積み〜弱い2カラム | 左右分割 62–68 / 32–38 ＋ sticky bar |
| ページ最大幅 | 画面幅−水平padding | 申請者は 960 上限付近 | 管理者は ~1280 または利用可能幅 |

モバイルで PC table を横スクロールさせないこと。

---

## 8. 状態別表示

`StatusBadge`（小さく、補助情報）:

| status | 見た目 | ラベル案 |
|---|---|---|
| `pending` | 淡いアンバー背景 / 濃い茶文字 | 確認待ち |
| `approved` | 淡いグリーン背景 / 濃いグリーン文字 | 承認済み |
| `returned` | 淡い赤橙背景 / 濃い赤橙文字 | 差し戻し |

追加バッジ:

| 意味 | 表示 |
|---|---|
| 新規 | `version === 1` |
| 再申請 | `version > 1` |
| 事前 | `advance` |
| 事後 | `after` |

差し戻し優先:

- 申請者: サマリー直下の対応依頼＋一覧での視覚優先（アクセントバー可）
- 管理者: 未確認一覧で再申請を識別可能に（列「新規／再申請」）

色だけで状態を伝えない。必ずテキストラベルを併記する。

純粋な赤（`--destructive-*`）は削除・重大エラー・処理失敗に残す。差し戻しUI全面には使わない。

---

## 9. フォーム設計

### 9.1 フィールドとDB対応

| UI項目 | 列 / 引数 | 必須 |
|---|---|---|
| 申請区分 | `application_type` (`advance` / `after`) | 必須 |
| 経費項目 | `category_id`（表示は `name`） | 必須 |
| 金額 | `amount`（正の整数円） | 必須・`> 0` |
| 日付 | `expense_date` | 必須 |
| 内容・目的 | `description` | 必須・空文字不可 |
| 事後理由 | `after_reason` | `after` のとき必須 |
| 領収書 | `receipt_path` | `after` のとき必須。`advance` は任意 |

新規申請は `expense_applications` へ INSERT。次は DBトリガー `prepare_expense_application()` に任せる:

- `applicant_id` / `applicant_name_snapshot` / `category_name_snapshot`
- `application_no`（`EXP-YYYYMM-000001`）
- `status=pending` / `version=1` / タイムスタンプ初期化

再申請は `resubmit_expense_application` RPC。画面は同一フォーム構造、CTA文言のみ変更。

### 9.2 UXルール

- ラベル常時表示。placeholderだけで項目名を表さない
- 必須明示
- 入力補助は必要な項目のみ（例: 事後理由、領収書形式）
- エラーは該当欄直下（`FieldError`）。DB生文字列をそのまま出さない
- 送信中は二重送信防止（`SubmitButton` disabled）
- 主要CTAは1つ。キャンセル／戻るは弱いアクション
- フォーム全体を巨大カードで囲まない。必要なら surface＋薄い境界線のみ

### 9.3 領収書アップロードUI

- 対応: JPEG / PNG / WebP / PDF、最大 10MB（Storage想定制約）
- 選択後にローカルファイル名と種別を表示
- プレビュー可能なものは小さいプレビューを許可（巨大ヒーロー化しない）
- アップロード失敗・申請失敗時のメッセージは短く業務用語で

---

## 10. 詳細画面設計

### 10.1 共通表示項目

- 申請番号（等幅）: `application_no`
- ステータス: `status`
- 申請者名: `applicant_name_snapshot`（管理者詳細で必須）
- 申請区分: `application_type`
- 経費項目: `category_name_snapshot`
- 金額: `amount`
- 経費日: `expense_date`
- 内容: `description`
- 事後理由: `after_reason`（ある場合）
- 管理者コメント: `admin_note`（returned / 履歴上必要な場合）
- 受付: `submitted_at`
- 審査: `reviewed_at`（ある場合）
- バージョン: `version`

### 10.2 操作履歴

`expense_events` を `created_at` 昇順または降順で一覧:

| event_type | 表示ラベル案 |
|---|---|
| `submitted` | 申請 |
| `resubmitted` | 再申請 |
| `approved` | 承認 |
| `returned` | 差し戻し |

`note` がある場合（差し戻しコメント等）は履歴行内に表示。

### 10.3 領収書

- `receipt_path` あり: サーバー発行 Signed URL で同一画面内プレビュー（画像 / PDF）
- なし: 「領収書なし」の短文（after では通常発生しない想定）
- 別画面必須の構成は禁止

### 10.4 StickyActionBar（管理者・pending時）

スクロール中も利用可能。モバイルは画面下部固定。承認・差し戻し・戻るの強度ルールは §6.7。

---

## 11. 主要コンポーネント一覧

無目的な汎用 Card は作らない。用途が説明できない `Card` は禁止。

| コンポーネント | 用途 |
|---|---|
| `AppShell` | 認証後の土台（背景色・最小フレーム） |
| `ApplicantHeader` | 申請者向けヘッダー（ログアウト等） |
| `AdminSidebar` | 管理者左ナビ（208–224px） |
| `AdminHeader` | 管理者上部（ユーザー表示・ログアウト） |
| `PageHeader` | タイトル＋右側主要アクション枠 |
| `InlineSummary` | 1行の件数サマリー（KPIカード禁止） |
| `StatusBadge` | pending / approved / returned |
| `ExpenseListRow` | 申請者向けコンパクト行 |
| `ExpenseDataTable` | 管理者PC向け table |
| `Field` | label＋control＋補助文の束 |
| `FieldError` | 欄直下エラー |
| `InlineAlert` | 差し戻しコメント等の通知帯（全面赤禁止） |
| `EmptyState` | 短い説明＋必要なCTAのみ（大きなイラスト禁止） |
| `ReceiptPreview` | 画像/PDFプレビュー |
| `StickyActionBar` | 承認操作の固定バー |
| `ConfirmDialog` | 承認・差し戻し確認（Escapeで閉じる） |
| `SubmitButton` | 送信・二重送信防止 |
| `LoadingState` | 一覧・詳細の読み込み骨格またはテキスト |

既存 shadcn の `Button` / `Input` / `Label` / `Badge` 等はトークンに合わせて調整して再利用してよい。見た目が本仕様と衝突する場合は仕様を優先する。

---

## 12. アクセシビリティ

- キーボード操作可能
- visible focus ring（`--focus-ring`）
- `label` と `input` を関連付け
- icon-only ボタンに `aria-label`
- 色だけで状態を表現しない
- 主要テキストは十分なコントラスト
- モバイルタップ領域おおよそ 44px
- hover だけに依存しない
- Dialog は Escape で閉じられる
- 処理中 button は disabled
- エラーを DB / Auth 生文字列のまま表示しない
- 空状態は短い説明と必要な CTA のみ

---

## 13. 実装後の視覚監査項目

実装完了後、次を `390 / 768 / 1440` で確認する。

- [ ] KPIカードダッシュボードになっていない
- [ ] 申請者と管理者でレイアウト構造が異なる
- [ ] 管理者PC一覧が table である
- [ ] モバイル一覧が横スクロール table になっていない
- [ ] 差し戻しが優先表示され、画面全体が赤くない
- [ ] 管理者詳細で領収書が同一画面にある
- [ ] StickyActionBar が pending 詳細で機能する
- [ ] 金額が右揃え・tabular-nums・カンマ・円
- [ ] 申請番号のみ等幅
- [ ] 角丸が 12px 以下、常用シャドウがない
- [ ] グラデーション・紫系・ガラスがない
- [ ] ログインに Sign up / Forgot が出ていない
- [ ] 画面最大幅が役割ごとに守られている
- [ ] focus ring が見える
- [ ] 空状態がイラスト肥大化していない
- [ ] 「おかえりなさい」系コピーがない
- [ ] `text-4xl` 以上のタイトルがない

---

## 14. コピー（文言）方針

- 業務用語を優先（申請、差し戻し、承認、確認待ち）
- 装飾的な歓迎文・モチベーション文は禁止
- エラーは利用者向けに言い換える（例: 「ログインできませんでした」）
- 空状態例:「申請はまだありません」「未確認の申請はありません」
