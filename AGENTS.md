<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UIデザインシステム絶対死守ルール (FleaScript)

FleaScriptは「オーガニック・スローライフ（Kinfolkスタイル）」のデザインコンセプト（テラコッタ＆セージとアースカラー）をベースに構築されています。
開発時におけるアドホックなカラーのハードコードや適当なスタイリングはコンセプト崩壊を招くため、以下の制約を厳格に遵守すること。

1. **Tailwindデフォルトの汎用カラー（`bg-amber-100`, `text-purple-600`, `border-blue-200` 等）の直接使用は原則禁止とする。**
2. 全てのUIコンポーネントは、`globals.css` に定義されテーママッピングされている **CSSカラー変数（`var(--color-...)`）を必ず使用してスタイリングすること。**
   * プライマリアクセント / ブランド: `var(--color-brand)` (テラコッタ・レンガ色)
   * セカンダリアクセント: `var(--color-accent)` (セージグリーン)
   * 成功ステータス / 売却済: `var(--color-success)` (ディープオリーブ)
   * 成功背景: `var(--color-success-bg)` (淡いオリーブ)
   * 警告 / 注意: `var(--color-warning)` (マスタード)
   * 警告背景: `var(--color-warning-bg)` (淡いマスタード)
   * エラー / 危険: `var(--color-danger)` (ダスティモーブ)
   * 危険背景: `var(--color-danger-bg)` (淡いダスティモーブ)
   * インフォ / サブステータス: `var(--color-info)` (スレートブルー)
   * 背景色: `var(--color-bg-base)` (エクリュ), `var(--color-bg-surface)` (白)
   * テキスト色: `var(--color-text-primary)` (チャコールグレー), `var(--color-text-secondary)` (stone-500相当)
3. アイコン等は Lucide を使用し、色指定には上記 CSS 変数を指定するか、Tailwindのテーママッピングクラス（`text-[var(--color-brand)]` 等）を直接指定すること。
4. テーマエンジン（`sunset` 等への切り替え）が稼働した際にも、CSS変数（`var(--color-...)`）を用いていれば、自動的に切り替わった配色が適用されます。アドホックなハードコードはこのテーマ切り替えを完全に破壊するため禁止します。
