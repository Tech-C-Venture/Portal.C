# Specs

Specsは、個別の機能や変更に対する仕様書を管理します。各機能の要件定義、設計、タスク、実装状況を追跡します。

## アクティブな仕様

- [Clean Architecture Refactor](clean-architecture-refactor/README.md) - クリーンアーキテクチャへのリファクタリング

## Spec-Driven Development (SDD)

Portal.CではKiro-style Spec-Driven Developmentを採用しています。これにより、要件定義→設計→実装の流れが明確になり、AI支援開発が効率化されます。

### 基本フロー

1. **要件定義** (`/kiro:spec-requirements`)
   - 機能の要件を詳細に記述
   - EARS形式での要件記述

2. **ギャップ分析** (`/kiro:validate-gap`) - オプション
   - 既存コードベースとの整合性確認

3. **設計** (`/kiro:spec-design`)
   - アーキテクチャ設計
   - 技術選定
   - インターフェース定義

4. **タスク生成** (`/kiro:spec-tasks`)
   - 実装タスクの分解
   - 優先順位付け

5. **実装** (`/kiro:spec-impl`)
   - TDD方式での実装
   - タスク単位での進捗管理

6. **検証** (`/kiro:validate-impl`) - オプション
   - 要件との整合性確認

詳細は[SDD使用ガイド](../../development/cc-sdd-usage.md)を参照してください。

## 新しい仕様の作成

```bash
# 新しい機能の仕様初期化
/kiro:spec-init "機能の説明"

# 要件定義
/kiro:spec-requirements {feature-name}

# 設計
/kiro:spec-design {feature-name}

# タスク生成
/kiro:spec-tasks {feature-name}

# 実装
/kiro:spec-impl {feature-name} [task-numbers]
```
