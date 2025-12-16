# cc-sdd 使い方ガイド

## cc-sddとは

cc-sdd（Spec-Driven Development）は、AI開発エージェント向けの仕様駆動開発フレームワークです。

**主な特徴:**
- 仕様優先保証: 要件と設計を事前に承認してから実装
- 並列実行対応: タスクを依存関係追跡付きで分解
- チームテンプレート: カスタマイズ可能なドキュメント形式
- プロジェクトメモリ: AIがアーキテクチャやパターンを記憶

**理念:**
"One command. Hours instead of weeks. Requirements → Design → Tasks → Implementation"

## 導入済み内容

### Claude Code用 (11コマンド)
`.claude/commands/kiro/` にコマンドを配置

### Claude Code Subagents用 (12コマンド + 9サブエージェント)
- コマンド: `.claude/commands/kiro/` (spec-quick.md追加)
- サブエージェント: `.claude/agents/kiro/` に9エージェント配置

### Codex CLI用 (11プロンプト)
`.codex/prompts/` にプロンプトを配置

### Cursor IDE用 (11コマンド)
`.cursor/commands/kiro/` にコマンドを配置

### Gemini CLI用 (11コマンド)
`.gemini/commands/kiro/` にコマンド（TOML形式）を配置

### GitHub Copilot用 (11プロンプト)
`.github/prompts/` にプロンプト（.prompt.md形式）を配置

### プロジェクトメモリ
- `CLAUDE.md` - Claude Code用のプロジェクト知識
- `AGENTS.md` - Codex CLI / Cursor IDE用のプロジェクト知識
- `GEMINI.md` - Gemini CLI用のプロジェクト知識

### 設定ファイル
`.kiro/settings/` に25ファイル
- テンプレート: `templates/specs/`, `templates/steering/`
- ルール: `rules/`

## 基本的な使い方

### Phase 0: プロジェクト知識の設定 (初回推奨)

プロジェクト全体の知識をAIに記憶させます。

**Claude Code / Claude Code Subagents:**
```bash
/kiro:steering
```

**Codex CLI:**
```bash
/prompts:kiro-steering
```

**Cursor IDE:**
```bash
/kiro/steering
```

**Gemini CLI:**
```bash
/kiro:steering
```

**GitHub Copilot:**
```bash
/kiro-steering
```

これにより `.kiro/steering/` に以下が作成されます:
- `product.md` - プロダクトの概要、目的、ユーザー
- `tech.md` - 技術スタック、アーキテクチャ
- `structure.md` - プロジェクト構造、命名規則

**カスタム設定の追加:**
```bash
# Claude Code / Claude Code Subagents
/kiro:steering-custom <設定名>

# Codex CLI
/prompts:kiro-steering-custom <設定名>

# Cursor IDE
/kiro/steering-custom <設定名>

# Gemini CLI
/kiro:steering-custom <設定名>

# GitHub Copilot
/kiro-steering-custom <設定名>
```

例: `/kiro:steering-custom api-standards`

## 開発ワークフロー

### Phase 1: 仕様策定

#### 1. 仕様の初期化
新しい機能の仕様を作成します。

**Claude Code:**
```bash
/kiro:spec-init "ユーザー認証機能を実装"
```

**Codex CLI:**
```bash
/prompts:kiro-spec-init "ユーザー認証機能を実装"
```

これにより `.kiro/specs/{feature-name}/` が作成され、`spec.json` が生成されます。

#### 2. 要件定義
EARS形式で要件を定義します。

**Claude Code:**
```bash
/kiro:spec-requirements {feature-name}
```

**Codex CLI:**
```bash
/prompts:kiro-spec-requirements {feature-name}
```

生成されるファイル: `requirements.md`

#### 3. ギャップ分析 (既存コードベースの場合)
既存のコードと新機能のギャップを分析します。

**Claude Code:**
```bash
/kiro:validate-gap {feature-name}
```

**Codex CLI:**
```bash
/prompts:kiro-validate-gap {feature-name}
```

#### 4. 設計
アーキテクチャ設計を作成します（Mermaid図を含む）。

**Claude Code:**
```bash
/kiro:spec-design {feature-name}
# 自動承認の場合
/kiro:spec-design {feature-name} -y
```

**Codex CLI:**
```bash
/prompts:kiro-spec-design {feature-name}
# 自動承認の場合
/prompts:kiro-spec-design {feature-name} -y
```

生成されるファイル: `design.md`

#### 5. 設計レビュー (オプション)
設計の妥当性を検証します。

**Claude Code:**
```bash
/kiro:validate-design {feature-name}
```

**Codex CLI:**
```bash
/prompts:kiro-validate-design {feature-name}
```

#### 6. タスク分解
実装タスクを依存関係付きで分解します。

**Claude Code:**
```bash
/kiro:spec-tasks {feature-name}
# 自動承認の場合
/kiro:spec-tasks {feature-name} -y
```

**Codex CLI:**
```bash
/prompts:kiro-spec-tasks {feature-name}
# 自動承認の場合
/prompts:kiro-spec-tasks {feature-name} -y
```

生成されるファイル: `tasks.md`

### Phase 2: 実装

#### 7. 実装
タスクを実装します。

**Claude Code:**
```bash
# すべてのタスクを実装
/kiro:spec-impl {feature-name}

# 特定のタスクを実装
/kiro:spec-impl {feature-name} task-1 task-3
```

**Codex CLI:**
```bash
# すべてのタスクを実装
/prompts:kiro-spec-impl {feature-name}

# 特定のタスクを実装
/prompts:kiro-spec-impl {feature-name} task-1 task-3
```

#### 8. 実装検証 (オプション)
実装の妥当性を検証します。

**Claude Code:**
```bash
/kiro:validate-impl {feature-name}
```

**Codex CLI:**
```bash
/prompts:kiro-validate-impl {feature-name}
```

### 進捗確認

いつでも仕様の進捗を確認できます。

**Claude Code:**
```bash
/kiro:spec-status {feature-name}
```

**Codex CLI:**
```bash
/prompts:kiro-spec-status {feature-name}
```

## コマンド一覧

### Claude Code用コマンド

| コマンド | 説明 |
|---------|------|
| `/kiro:steering` | プロジェクト知識を作成・更新 |
| `/kiro:steering-custom` | カスタム設定を作成 |
| `/kiro:spec-init` | 新規仕様を初期化 |
| `/kiro:spec-requirements` | 要件定義を作成 |
| `/kiro:validate-gap` | ギャップ分析を実行 |
| `/kiro:spec-design` | 設計書を作成 |
| `/kiro:validate-design` | 設計をレビュー |
| `/kiro:spec-tasks` | タスクを分解 |
| `/kiro:spec-impl` | タスクを実装 |
| `/kiro:validate-impl` | 実装を検証 |
| `/kiro:spec-status` | 進捗を確認 |

### Claude Code Subagents用コマンド

Claude Code Subagentsでは、通常のコマンド11個に加えて、クイックスタート用のコマンドが追加されています。

| コマンド | 説明 |
|---------|------|
| `/kiro:spec-quick` | **新規**: 仕様を迅速に作成（サブエージェント使用） |
| `/kiro:steering` | プロジェクト知識を作成・更新 |
| `/kiro:steering-custom` | カスタム設定を作成 |
| `/kiro:spec-init` | 新規仕様を初期化 |
| `/kiro:spec-requirements` | 要件定義を作成 |
| `/kiro:validate-gap` | ギャップ分析を実行 |
| `/kiro:spec-design` | 設計書を作成 |
| `/kiro:validate-design` | 設計をレビュー |
| `/kiro:spec-tasks` | タスクを分解 |
| `/kiro:spec-impl` | タスクを実装 |
| `/kiro:validate-impl` | 実装を検証 |
| `/kiro:spec-status` | 進捗を確認 |

**サブエージェント**: `.claude/agents/kiro/` に9つのエージェントが配置されています。

### Codex CLI用コマンド

Codex CLIでは、すべてのコマンドが `/prompts:kiro-*` 形式になります。

| コマンド | 説明 |
|---------|------|
| `/prompts:kiro-steering` | プロジェクト知識を作成・更新 |
| `/prompts:kiro-steering-custom` | カスタム設定を作成 |
| `/prompts:kiro-spec-init` | 新規仕様を初期化 |
| `/prompts:kiro-spec-requirements` | 要件定義を作成 |
| `/prompts:kiro-validate-gap` | ギャップ分析を実行 |
| `/prompts:kiro-spec-design` | 設計書を作成 |
| `/prompts:kiro-validate-design` | 設計をレビュー |
| `/prompts:kiro-spec-tasks` | タスクを分解 |
| `/prompts:kiro-spec-impl` | タスクを実装 |
| `/prompts:kiro-validate-impl` | 実装を検証 |
| `/prompts:kiro-spec-status` | 進捗を確認 |

### Cursor IDE用コマンド

Cursor IDEでは、すべてのコマンドが `/kiro/*` 形式になります。

| コマンド | 説明 |
|---------|------|
| `/kiro/steering` | プロジェクト知識を作成・更新 |
| `/kiro/steering-custom` | カスタム設定を作成 |
| `/kiro/spec-init` | 新規仕様を初期化 |
| `/kiro/spec-requirements` | 要件定義を作成 |
| `/kiro/validate-gap` | ギャップ分析を実行 |
| `/kiro/spec-design` | 設計書を作成 |
| `/kiro/validate-design` | 設計をレビュー |
| `/kiro/spec-tasks` | タスクを分解 |
| `/kiro/spec-impl` | タスクを実装 |
| `/kiro/validate-impl` | 実装を検証 |
| `/kiro/spec-status` | 進捗を確認 |

### Gemini CLI用コマンド

Gemini CLIでは、すべてのコマンドが `/kiro:*` 形式になります（TOML設定ファイル使用）。

| コマンド | 説明 |
|---------|------|
| `/kiro:steering` | プロジェクト知識を作成・更新 |
| `/kiro:steering-custom` | カスタム設定を作成 |
| `/kiro:spec-init` | 新規仕様を初期化 |
| `/kiro:spec-requirements` | 要件定義を作成 |
| `/kiro:validate-gap` | ギャップ分析を実行 |
| `/kiro:spec-design` | 設計書を作成 |
| `/kiro:validate-design` | 設計をレビュー |
| `/kiro:spec-tasks` | タスクを分解 |
| `/kiro:spec-impl` | タスクを実装 |
| `/kiro:validate-impl` | 実装を検証 |
| `/kiro:spec-status` | 進捗を確認 |

### GitHub Copilot用コマンド

GitHub Copilotでは、すべてのコマンドが `/kiro-*` 形式になります（.prompt.md形式）。

| コマンド | 説明 |
|---------|------|
| `/kiro-steering` | プロジェクト知識を作成・更新 |
| `/kiro-steering-custom` | カスタム設定を作成 |
| `/kiro-spec-init` | 新規仕様を初期化 |
| `/kiro-spec-requirements` | 要件定義を作成 |
| `/kiro-validate-gap` | ギャップ分析を実行 |
| `/kiro-spec-design` | 設計書を作成 |
| `/kiro-validate-design` | 設計をレビュー |
| `/kiro-spec-tasks` | タスクを分解 |
| `/kiro-spec-impl` | タスクを実装 |
| `/kiro-validate-impl` | 実装を検証 |
| `/kiro-spec-status` | 進捗を確認 |

## コマンドフォーマット対応表

各AIツールでのコマンド形式の違い:

| 機能 | Claude Code | Claude Code Subagents | Codex CLI | Cursor IDE | Gemini CLI | GitHub Copilot |
|------|-------------|----------------------|-----------|------------|------------|----------------|
| Steering | `/kiro:steering` | `/kiro:steering` | `/prompts:kiro-steering` | `/kiro/steering` | `/kiro:steering` | `/kiro-steering` |
| Spec Init | `/kiro:spec-init` | `/kiro:spec-init` | `/prompts:kiro-spec-init` | `/kiro/spec-init` | `/kiro:spec-init` | `/kiro-spec-init` |
| Quick Spec | - | `/kiro:spec-quick` | - | - | - | - |

## ディレクトリ構造

```
.
├── .claude/
│   ├── agents/
│   │   └── kiro/          # Claude Code Subagents (9エージェント)
│   └── commands/
│       └── kiro/          # Claude Code用コマンド (12コマンド)
├── .codex/
│   └── prompts/           # Codex CLI用プロンプト (11プロンプト)
├── .cursor/
│   └── commands/
│       └── kiro/          # Cursor IDE用コマンド (11コマンド)
├── .gemini/
│   └── commands/
│       └── kiro/          # Gemini CLI用コマンド (11 TOMLファイル)
├── .github/
│   └── prompts/           # GitHub Copilot用プロンプト (11 .prompt.mdファイル)
├── .kiro/
│   ├── settings/
│   │   ├── rules/         # 開発ルール
│   │   └── templates/     # テンプレート
│   ├── steering/          # プロジェクト知識
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   └── specs/             # 機能仕様
│       └── {feature-name}/
│           ├── spec.json
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── docs/
│   └── cc-sdd-usage.md    # このドキュメント
├── CLAUDE.md              # Claude Code用プロジェクトメモリ
├── AGENTS.md              # Codex CLI / Cursor IDE用プロジェクトメモリ
└── GEMINI.md              # Gemini CLI用プロジェクトメモリ
```

## 開発のベストプラクティス

### 1. 3段階承認ワークフロー
- Requirements → Design → Tasks → Implementation
- 各フェーズで人間のレビューを推奨
- `-y` フラグは慎重に使用

### 2. Steeringの定期更新
- プロジェクトの進化に合わせて `.kiro/steering/` を更新
- 新しいパターンや標準を追加

### 3. テンプレートのカスタマイズ
- `.kiro/settings/templates/` を編集
- チーム独自の開発プロセスに適合

### 4. 並列実行
- タスクの依存関係を活用
- 独立したタスクを並列で実装可能

## トラブルシューティング

### Codex CLIでプロンプトが表示されない場合

Codexの場合、プロンプトをグローバルディレクトリに移動する必要があります:

```bash
mkdir -p ~/.codex/prompts \
  && cp -Ri ./.codex/prompts/ ~/.codex/prompts/ \
  && printf '\n==== COPY PHASE DONE ====\n' \
  && printf 'Remove original ./.codex/prompts ? [y/N]: ' \
  && IFS= read -r a \
  && case "$a" in [yY]) rm -rf ./.codex/prompts && echo 'Removed.' ;; *) echo 'Kept original.' ;; esac
```

### 既存ファイルの上書き

初期セットアップでは既存ファイルは保持されます。上書きする場合:

```bash
# Claude Code
npx cc-sdd@latest --claude --overwrite=force

# Codex CLI
npx cc-sdd@latest --codex --overwrite=force
```

## 参考リンク

- [cc-sdd GitHub リポジトリ](https://github.com/gotalab/cc-sdd)
- プロジェクトメモリ: `CLAUDE.md` (Claude Code) / `AGENTS.md` (Codex CLI)

## 推奨モデル

### Claude Code
- Claude 4.5 Sonnet 以降

### Claude Code Subagents
- Claude 4.5 Sonnet 以降

### Codex CLI
- gpt-5.1-codex medium/high
- gpt-5.1 medium/high

### Cursor IDE
- Claude 4.5 Sonnet thinking mode 以降
- gpt-5.1-codex medium/high
- gpt-5.1 medium/high

### Gemini CLI
- Gemini 2.5 Pro 以降

### GitHub Copilot
- Claude 4.5 Sonnet thinking mode 以降
- gpt-5.1-codex medium/high
- gpt-5.1 medium/high
