---
ticket_id: "TASK-BE-02-error-handling"
status: "done"
assignee: "gemini-worker"
created_by: "gemini-worker"
created_at: "2026-07-02"
---

## 1. 目的・背景

OpenAI APIのレートリミット（429エラー/insufficient_quota）に対するロバストネスを確保するため、例外処理を実装する。
また、開発者向けにより解像度の高いエラー情報を提供できるよう、DevModeに連動したメッセージ出し分けを行う。

## 2. 受け入れ条件（Definition of Done）

- [x] OpenAIからの429エラーまたは `insufficient_quota` を検知する。
- [x] 一般ユーザーに対しては503ステータスと「現在、アクセスが集中しており商品説明の生成を一時停止しています。しばらく経ってから再度お試しください。」を返却する。
- [x] DevMode有効時は、503ステータスと生のエラーメッセージ（`[DevMode] Quota Exceeded (429): ...`）を返却する。

## 3. 技術仕様

- `src/app/api/generate/route.ts` 内の `catch` ブロックを改修。
- `isDevMode` のスコープを `try` ブロック外へ移動。

## 4. 影響範囲・注意点

- 変更予定ファイル: `src/app/api/generate/route.ts`
- 依存関係: なし

## 5. テスト方法

（手動によるソースコード・ロジック確認にて担保）

## 6. 完了報告欄（Gemini Worker記入）

- 完了日: 2026-07-02
- コミットハッシュ: （未コミット）
- 発見したGotchas: `isDevMode` 変数のスコープが `try` ブロック内に閉じ込められていたため、`catch` ブロックから参照できるよう外側に引き上げる必要があった。
