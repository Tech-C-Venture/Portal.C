# Portal.C - Tech.C Venture メンバー管理・イベント管理システム

Portal.Cは、Tech.C Ventureのメンバー管理とイベント管理を行うWebアプリケーションです。

## プロジェクト概要

技育プロジェクトVol.16で開発される、Tech.C Venture初の基盤システムです。イベント掲示板と参加者管理の機能を提供します。

## 主要機能

### 1. 認証・ログイン機能
- ZITADEL認証基盤を使用
- IDは運営側で登録
- ログイン後、イベント一覧画面に自動遷移

### 2. メンバープロフィール機能
- **学年自動計算機能**: 入学年度から現在の学年を自動計算
- **留年対応**: 留年フラグによる学年調整
- **今何してる？機能**: 24時間だけ表示されるステータス機能（Discordのステータスのようなもの）
- **スキル・興味タグ**: 登録と検索が可能
- **学校メールアドレス**: 公開情報
- **Gmailアドレス**: 非公開・管理画面のみ閲覧可能

### 3. 時間割閲覧機能
- 所属学年・所属専攻で絞り込み可能
- タグで紐付けてメンバーの時間割を閲覧可能

### 4. イベント管理機能
- イベント一覧の表示
- イベントへの参加表明

### 5. 管理者画面
- イベント登録
- IDごとの参加回数の管理
- 参加者管理
- ZITADELのadminロールを持つユーザーのみアクセス可能

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router)
- **バックエンド**: TypeScript
- **データベース**: Supabase (PostgreSQL)
- **認証基盤**: ZITADEL (NextAuth.js経由)
- **スタイリング**: Tailwind CSS
- **ホスティング**: Vercel

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/Tech-C-Venture/Portal.C.git
cd Portal.C
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
```

`.env`ファイルを編集し、以下の値を設定してください：
- `ZITADEL_ISSUER`: ZITADELインスタンスのURL
- `ZITADEL_CLIENT_ID`: ZITADELクライアントID
- `NEXTAUTH_SECRET`: ランダムな秘密鍵（`openssl rand -base64 32`で生成）
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー（管理操作用）

4. Supabaseのセットアップ

Supabase ダッシュボード（https://app.supabase.com）でプロジェクトを作成し、以下の手順でデータベースをセットアップしてください：

a. SQL Editorで`supabase/migrations/`内のマイグレーションファイルを順番に実行
   - `20241216000001_create_members_table.sql`
   - `20241216000002_create_tags_table.sql`
   - `20241216000003_create_events_table.sql`
   - `20241216000004_create_timetables_table.sql`

b. （オプション）型定義を再生成する場合：
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

5. 開発サーバーを起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ディレクトリ構造

```
Portal.C/
├── app/                    # Next.js App Router
│   ├── events/            # イベント一覧ページ
│   ├── members/           # メンバー一覧ページ
│   ├── profile/           # プロフィール編集ページ
│   ├── timetable/         # 時間割ページ
│   ├── admin/             # 管理画面
│   └── api/               # API Routes
│       └── auth/          # NextAuth認証エンドポイント
├── components/            # Reactコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                   # ユーティリティ関数
│   └── supabase/         # Supabaseクライアント
├── supabase/             # Supabase設定
│   └── migrations/       # データベースマイグレーション
├── types/                 # TypeScript型定義
│   └── database.types.ts # Supabase型定義
└── public/               # 静的ファイル
```

## データモデル

### Member（メンバー）
- 名前、学校メール、Gmailアドレス
- 入学年度、学年、留年フラグ
- 所属専攻
- スキル・興味タグ
- 現在のステータス（24時間限定）

### Event（イベント）
- タイトル、説明
- 日時、場所
- 定員
- 参加者リスト

### Timetable（時間割）
- 所属メンバー
- 学年、専攻
- 時間割スケジュール（曜日・時限・授業名）

## ドキュメント

プロジェクトの詳細なドキュメントはmdbookで管理されており、Cloudflare Pagesでホストされています。

### ドキュメントの閲覧

オンラインドキュメント: （デプロイ後のURLを設定）

### ローカルでドキュメントを閲覧

```bash
# mdbookをインストール（初回のみ）
cargo install mdbook

# ドキュメントをビルド
mdbook build

# ライブプレビューでドキュメントを表示
mdbook serve
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてドキュメントを閲覧できます。

### ドキュメントの構成

- **Getting Started**: 開発環境セットアップとオンボーディングガイド
- **Architecture**: Clean Architectureの設計詳細
- **Development Guide**: SDD（Spec-Driven Development）の使い方
- **Specification**: プロジェクトのSteeringとSpecs

詳細は `docs/` ディレクトリを参照してください。

## 開発

### ビルド
```bash
npm run build
```

### リント
```bash
npm run lint
```

## デプロイ

このプロジェクトはVercelでのデプロイを想定しています。

1. GitHubにプッシュ
2. Vercelにインポート
3. 環境変数を設定
4. デプロイ

## ライセンス

このプロジェクトは Tech.C Venture の内部プロジェクトです。

## 担当

- **認証基盤**: 木戸
- **プロジェクトリード**: Tech.C Venture

## 今後の予定

- ~~データベース統合（PostgreSQL / Supabase）~~ ✅ 完了
- ZITADEL認証基盤の統合
- リアルタイム通知機能
- カレンダー連携
- モバイルアプリ対応
