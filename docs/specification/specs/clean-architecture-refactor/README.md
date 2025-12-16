# Clean Architecture Refactor

Portal.CをClean Architectureパターンに基づいてリファクタリングするための仕様書です。

## 概要

既存のコードベースを、保守性と拡張性に優れたClean Architectureパターンに移行します。これにより、ビジネスロジックと外部依存を明確に分離し、テスタビリティを向上させます。

## ドキュメント

- [Requirements](requirements.md) - 要件定義（EARS形式）
- [Design](design.md) - アーキテクチャ設計の詳細
- [Tasks](tasks.md) - 実装タスクの一覧
- [Research](research.md) - 技術調査とアーキテクチャ分析
- [Gap Analysis](gap-analysis.md) - 既存コードとのギャップ分析

## 進捗確認

```bash
/kiro:spec-status clean-architecture-refactor
```

## アーキテクチャ構造

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                 │
│  (app/, components/ - Next.js App Router)   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│   (use-cases/, ports/, dtos/, mappers/)     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Infrastructure Layer               │
│ (repositories/, database/, auth/, di/)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            Domain Layer                     │
│       (entities/, value-objects/)           │
└─────────────────────────────────────────────┘
```

## 依存性ルール

内側の層は外側の層に依存しません：

- **Domain Layer**: ビジネスロジック、外部依存なし
- **Application Layer**: ユースケース、Domainのみに依存
- **Infrastructure Layer**: 外部サービス統合（DB、認証等）
- **Presentation Layer**: UI、Application/Domainに依存

詳細は[Design](design.md)を参照してください。
