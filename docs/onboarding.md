# Portal.C 開発者オンボーディング（Clean Architecture版）

## 目的
- レイヤー責務と依存ルールを理解したうえで、最短で開発を開始するためのガイド。

## 必須コマンド
- 開発: `npm run dev`
- 型・Lint: `npm run lint` / `npm run test:arch`
- テスト: `npm test` / `npm run test:coverage`

## レイヤー概要
- Domain: ビジネスルールのみ。外部依存なし。`@/domain/*`
- Application: ユースケースとポート。Domainのみに依存。`@/application/*`
- Infrastructure: DB/認証など実装。App/Domainに依存可。`@/infrastructure/*`
- Presentation: Next.jsページ/Server Actions/UI。App/Domainに依存可、Infraへの直接依存は禁止。`app/*`, `@/presentation/*`

## 進め方（タスク駆動）
1. 仕様・タスク確認: `.kiro/specs/clean-architecture-refactor/*`
2. TDDで実装: まずテスト追加 → 最小実装 → リファクタ → 全テスト
3. 依存ルール確認: `npm run test:arch` で境界違反を検出

## ロールバックとブランチ戦略
- 段階ごとにブランチを切り、マージ前に `npm test` / `npm run test:arch` を実行。
- 問題があれば前段階ブランチへ戻し、再適用する。

## よくある落とし穴
- PresentationからInfra実装を直接importしない（Server Action経由でUseCaseを呼ぶ）。
- Domainで外部ライブラリを使わない。
- DTOはシリアライズ可能な型に限定する。
