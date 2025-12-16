# Templates

SDDフレームワークで使用する各種ドキュメントテンプレートです。これらのテンプレートを使用することで、一貫性のある仕様書とステアリング文書を作成できます。

## Specs Templates

新機能や変更の仕様書を作成するためのテンプレート群です。

- **[Design Template](specs/design.md)**: アーキテクチャ設計書のテンプレート
- **[Requirements Template](specs/requirements.md)**: 要件定義書のテンプレート
- **[Requirements Init Template](specs/requirements-init.md)**: 要件初期化のテンプレート
- **[Research Template](specs/research.md)**: 技術調査レポートのテンプレート
- **[Tasks Template](specs/tasks.md)**: 実装タスクリストのテンプレート

## Steering Templates

プロジェクト全体のガイドラインを定義するためのテンプレート群です。

- **[Product Template](steering/product.md)**: プロダクト要件とビジネスルールのテンプレート
- **[Tech Template](steering/tech.md)**: 技術スタックと技術的制約のテンプレート
- **[Structure Template](steering/structure.md)**: プロジェクト構造とアーキテクチャ原則のテンプレート

## Custom Steering Templates

特定のドメインに特化したステアリングテンプレート群です。

- **[API Standards](steering-custom/api-standards.md)**: API設計標準
- **[Authentication](steering-custom/authentication.md)**: 認証・認可の方針
- **[Database](steering-custom/database.md)**: データベース設計指針
- **[Deployment](steering-custom/deployment.md)**: デプロイ戦略
- **[Error Handling](steering-custom/error-handling.md)**: エラーハンドリング規約
- **[Security](steering-custom/security.md)**: セキュリティガイドライン
- **[Testing](steering-custom/testing.md)**: テスト戦略

## 使用方法

1. 適切なテンプレートを選択
2. プロジェクト固有の情報で埋める
3. `.kiro/steering/`または`.kiro/specs/`に保存
4. AI開発エージェントがこれらを参照して開発を進める
