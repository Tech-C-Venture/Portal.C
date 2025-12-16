# ドキュメントセットアップガイド

このドキュメントは、Portal.Cのドキュメントシステムのセットアップと管理方法を説明します。

## 前提条件

- Rust（mdbookのインストールに必要）
- Cloudflare アカウント（デプロイに必要）
- GitHub リポジトリへのアクセス権限

## ローカル環境でのドキュメント管理

### mdbookのインストール

```bash
# Rustがインストールされていない場合
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# mdbookのインストール
cargo install mdbook
```

### ドキュメントのビルド

```bash
# ドキュメントをビルド
mdbook build

# 出力は book/ ディレクトリに生成されます
```

### ライブプレビュー

```bash
# ライブプレビューサーバーを起動
mdbook serve

# デフォルトでは http://localhost:3000 で閲覧可能
# ファイルを編集すると自動的に再ビルド・リロードされます
```

## ドキュメント構成

```
docs/
├── README.md                           # Introduction
├── SUMMARY.md                          # 目次（重要！）
├── getting-started/
│   └── onboarding.md                   # オンボーディングガイド
├── architecture/
│   ├── architecture.md                 # アーキテクチャ設計
│   └── migration-plan.md               # マイグレーション計画
├── development/
│   └── agents.md                       # AGENTS設定
└── specification/
    ├── steering/                       # プロジェクトガイドライン
    │   ├── README.md
    │   ├── product.md
    │   ├── tech.md
    │   └── structure.md
    └── specs/                          # 機能仕様書
        ├── README.md
        └── clean-architecture-refactor/
            ├── README.md
            ├── requirements.md
            ├── design.md
            ├── tasks.md
            ├── research.md
            └── gap-analysis.md
```

## 新しいドキュメントの追加

1. `docs/` ディレクトリに新しい `.md` ファイルを作成
2. `docs/SUMMARY.md` に新しいページへのリンクを追加

例：
```markdown
# Summary

[Introduction](README.md)

# Getting Started
- [新しいページ](getting-started/new-page.md)
```

## Cloudflare Pagesへのデプロイ

### 初回セットアップ

1. Cloudflare ダッシュボードにログイン
2. Pages > Create a project を選択
3. GitHubリポジトリを接続
4. ビルド設定:
   - **Build command**: `mdbook build`
   - **Build output directory**: `book`
   - **Root directory**: `/`

### GitHub Secretsの設定

以下のシークレットをGitHubリポジトリに設定してください：

1. `CLOUDFLARE_API_TOKEN`: Cloudflare API トークン
   - Cloudflare Dashboard > My Profile > API Tokens
   - "Edit Cloudflare Workers" テンプレートを使用

2. `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウントID
   - Cloudflare Dashboard > Workers & Pages > Overview で確認

### 自動デプロイ

`docs/` ディレクトリまたは `book.toml` が更新されると、GitHub Actionsが自動的にトリガーされ、Cloudflare Pagesにデプロイされます。

ワークフロー: `.github/workflows/deploy-docs.yml`

## トラブルシューティング

### mdbookがインストールできない

**原因**: Rustがインストールされていない

**解決方法**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
cargo install mdbook
```

### ビルドエラー: ファイルが見つからない

**原因**: `SUMMARY.md` で参照されているファイルが存在しない

**解決方法**:
- `SUMMARY.md` で参照されているすべてのファイルが存在するか確認
- または `book.toml` で `create-missing = true` を設定（既に設定済み）

### GitHub Actionsデプロイエラー

**原因**: Cloudflare API トークンまたはアカウントIDが正しくない

**解決方法**:
1. GitHubリポジトリの Settings > Secrets and variables > Actions を確認
2. `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が正しく設定されているか確認

## ドキュメント更新のワークフロー

1. ローカルでドキュメントを編集
   ```bash
   mdbook serve
   ```

2. ブラウザでプレビューを確認

3. 変更をコミット
   ```bash
   git add docs/
   git commit -m "docs: ドキュメントを更新"
   git push
   ```

4. GitHub Actionsが自動的にビルド・デプロイを実行

## 参考リンク

- [mdBook公式ドキュメント](https://rust-lang.github.io/mdBook/)
- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
