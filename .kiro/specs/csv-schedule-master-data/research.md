# Research & Design Decisions

## Summary
- **Feature**: `csv-schedule-master-data`
- **Discovery Scope**: Extension（既存の管理者時間割ページへのCSV機能追加）
- **Key Findings**:
  - CSVダウンロードはAPI Route Handler（`/api/admin/csv/...`）で実装し、ファイルレスポンスを返す方式が最適
  - CSVアップロードはServer Actionsで実装し、Firestoreバッチ操作でアトミックな一括上書きを実現可能
  - 外部CSVライブラリは不要。データ構造がシンプル（フラットなカラム、ネストなし）のため、ネイティブ文字列操作で十分

## Research Log

### CSVダウンロード方式
- **Context**: Next.js 15でCSVファイルをダウンロードさせる方法の選定
- **Findings**:
  - Server Actionsはファイルレスポンスを返せない（シリアライズ可能な値のみ）
  - Route Handlers（`/api/...`）で `new Response()` を使い、Content-Type/Content-Dispositionヘッダーでファイルダウンロードを実現
  - クライアント側はリンクまたは`window.location.href`でダウンロード開始
- **Implications**: ダウンロード機能はAPI Route Handler、アップロード機能はServer Actionで実装を分離

### CSVアップロード・一括上書き方式
- **Context**: Firestoreで既存データ全削除→新規一括登録をアトミックに実行する方法
- **Findings**:
  - Firestoreバッチ書き込みは1バッチ最大500操作（delete + set両方含む）
  - 共通時間割データは学年×専攻×曜日×時限の組み合わせで、現実的に数百件程度
  - 時間帯マスターは最大10件程度
  - `runTransaction` または `batch` でアトミック操作可能
  - 500件超の場合は複数バッチに分割が必要だが、現実的にはほぼ不要
- **Implications**: 単一Firestoreバッチで全削除→全登録を実行。安全マージンとして500件超時の分割ロジックも設計に含める

### UTF-8 BOM対応
- **Context**: 日本語CSVのExcel互換性
- **Findings**:
  - UTF-8 BOM（`\uFEFF`）をファイル先頭に付与することでExcelが正しくUTF-8として認識
  - アップロード時はBOM有無両方を受け入れる（先頭3バイトが`0xEF 0xBB 0xBF`の場合にストリップ）
- **Implications**: ダウンロード時BOM付与、アップロード時BOM除去の双方向対応

### 認証パターン
- **Context**: 既存の管理者認証パターンの確認
- **Findings**:
  - API Route: `isAdmin()` を呼び出し、falseの場合は `Response` でエラーを返す
  - Server Actions: `isAdmin()` でチェック後、FormStateでエラーを返す
  - Admin Layout: `isAdmin()` でリダイレクト制御
- **Implications**: 既存パターンを踏襲。API RouteではHTTP 403、Server Actionsではエラーメッセージで返却

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| API Route + Server Action分離 | DLはRoute Handler、ULはServer Action | Next.jsの設計思想に合致、既存パターンと整合 | 2つの実装パターンが混在 | 採用：理由は各操作の特性に最適 |
| 全てAPI Route | DL/ULともRoute Handler | 統一的なAPI設計 | Server Actionsの利点（型安全、revalidate）を活かせない | 不採用 |
| 全てServer Action | DL/ULともServer Action | 統一的 | ファイルダウンロードにはBlob変換が必要で複雑化 | 不採用 |

## Design Decisions

### Decision: CSVパース・生成をライブラリなしで実装
- **Context**: CSVの解析・生成に外部ライブラリを使うか否か
- **Alternatives Considered**:
  1. papa-parse — 高機能CSVパーサー
  2. ネイティブ文字列操作 — 依存なし
- **Selected Approach**: ネイティブ文字列操作
- **Rationale**: データがフラットでシンプル（最大7カラム、日本語テキストのみ）。フィールド内カンマや改行の可能性が極めて低い。依存関係の追加を最小限に保つプロジェクト方針に合致
- **Trade-offs**: エッジケース対応が限定的だが、管理者が作成するCSVで問題になる可能性は低い
- **Follow-up**: ダブルクォート囲みの基本対応は実装する

### Decision: Firestoreバッチによるアトミック上書き
- **Context**: 一括上書きの整合性保証
- **Selected Approach**: 単一バッチで全delete→全setを実行
- **Rationale**: 共通時間割は数百件、時間帯マスターは~10件。500操作制限内に十分収まる
- **Trade-offs**: 500件超の場合は完全なアトミック性を保証できないが、現実的に発生しない

## Risks & Mitigations
- Firestoreバッチ500件制限超過 → 複数バッチ分割ロジックで対応、エラー時は部分コミットを防止
- 不正なCSVによるデータ破壊 → バリデーション通過後にのみバッチ実行、エラー時は全件ロールバック
- 大容量ファイルアップロード → ファイルサイズ上限チェック（1MB程度）で防御
