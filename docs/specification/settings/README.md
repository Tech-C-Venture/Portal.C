# Settings

`.kiro/settings/`は、Spec-Driven Development (SDD)フレームワークの設定ファイルを管理します。これらの設定は、AI開発エージェント（Claude Code、Cursor、Codex、Geminiなど）がプロジェクトの標準に沿った開発を行うためのルールとテンプレートを定義しています。

## 構成

### Rules
開発プロセスにおける各フェーズのルールと原則を定義

- [Design Discovery (Full)](rules/design-discovery-full.md) - 完全版の設計発見プロセス
- [Design Discovery (Light)](rules/design-discovery-light.md) - 軽量版の設計発見プロセス
- [Design Principles](rules/design-principles.md) - 設計の原則
- [Design Review](rules/design-review.md) - 設計レビューのガイドライン
- [EARS Format](rules/ears-format.md) - 要件記述フォーマット
- [Gap Analysis](rules/gap-analysis.md) - ギャップ分析の手法
- [Steering Principles](rules/steering-principles.md) - ステアリングの原則
- [Tasks Generation](rules/tasks-generation.md) - タスク生成のルール
- [Tasks Parallel Analysis](rules/tasks-parallel-analysis.md) - タスク並列分析

### Templates
仕様書やステアリング文書のテンプレート

#### Specs Templates
- [Design Template](templates/specs/design.md) - 設計書テンプレート
- [Requirements Template](templates/specs/requirements.md) - 要件定義テンプレート
- [Requirements Init Template](templates/specs/requirements-init.md) - 要件初期化テンプレート
- [Research Template](templates/specs/research.md) - 調査テンプレート
- [Tasks Template](templates/specs/tasks.md) - タスクテンプレート

#### Steering Templates
- [Product Template](templates/steering/product.md) - プロダクトステアリングテンプレート
- [Tech Template](templates/steering/tech.md) - 技術ステアリングテンプレート
- [Structure Template](templates/steering/structure.md) - 構造ステアリングテンプレート

#### Custom Steering Templates
- [API Standards](templates/steering-custom/api-standards.md) - API標準テンプレート
- [Authentication](templates/steering-custom/authentication.md) - 認証テンプレート
- [Database](templates/steering-custom/database.md) - データベーステンプレート
- [Deployment](templates/steering-custom/deployment.md) - デプロイテンプレート
- [Error Handling](templates/steering-custom/error-handling.md) - エラーハンドリングテンプレート
- [Security](templates/steering-custom/security.md) - セキュリティテンプレート
- [Testing](templates/steering-custom/testing.md) - テストテンプレート

## 使用方法

これらの設定ファイルは、以下のAI開発ツールで使用されます：

- **Claude Code** (`.claude/commands/kiro/`, `.claude/agents/kiro/`)
- **Cursor IDE** (`.cursor/commands/kiro/`)
- **Codex CLI** (`.codex/prompts/`)
- **Gemini CLI** (`.gemini/commands/kiro/`)
- **GitHub Copilot** (`.github/prompts/`)

各ツールは、これらの設定を参照して一貫した開発プロセスを実現します。
