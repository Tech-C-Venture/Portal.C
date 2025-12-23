# Design Document

## 概要

Portal.Cに基本的なPWA対応を追加する。Next.js 15 App Routerの標準機構を利用してWeb App Manifestを提供し、Service Workerを最小構成で登録する。オフライン対応はアプリシェル/静的アセットのキャッシュに限定し、動的データの同期やプッシュ通知は行わない。

## 目的とスコープ

- PWAとしてインストール可能な最小要件を満たす
- ManifestとService Workerを追加する
- 既存UI/機能を変更しない

## アーキテクチャ

### マニフェスト

- Next.jsの`app/manifest.ts`を使用して`manifest.webmanifest`を自動生成する
- `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, `icons`を指定する
- アイコンは`public/`配下に配置し、Manifestから参照する

### Service Worker

- `public/sw.js`に最小のキャッシュ戦略を実装
- インストール時に静的アセット（アプリシェル）を事前キャッシュ
- フェッチ時はキャッシュ優先（Cache First）でヒットしない場合はネットワーク
- 失敗時のフォールバックはスコープ外

### 登録

- `components/`にクライアントコンポーネント`PwaRegister.tsx`を追加
- `app/layout.tsx`に配置し、ブラウザでService Workerを登録する
- HTTPS環境でのみ登録し、開発環境では登録しない

### メタデータ

- `app/layout.tsx`の`metadata`に`themeColor`を設定
- `manifest`のリンクはNext.jsが`app/manifest.ts`から自動挿入

## 実装詳細

### 新規/変更ファイル

- `app/manifest.ts`: Web App Manifest定義
- `public/icons/icon-192.png`, `public/icons/icon-512.png`: PWAアイコン
- `public/sw.js`: Service Worker
- `components/PwaRegister.tsx`: Service Worker登録用クライアントコンポーネント
- `app/layout.tsx`: PWA登録コンポーネントの挿入と`themeColor`メタの追加

### Service Workerのキャッシュ対象

- `/_next/static/`配下
- `/`（ホーム）
- `favicon`/`icons`等の静的アセット

※ 明示的なキャッシュ対象は最小構成に留め、必要に応じて拡張する

## テスト方針

- ブラウザでPWAインストール候補として表示されること
- `manifest.webmanifest`が正しく配信されること
- Service Workerが登録され、Applicationタブで稼働していること
- オフライン時にキャッシュ済みアセットが表示されること

## リスクと対応

- **キャッシュ不整合**: 変更時に古いアセットが残る可能性 → Service Workerでキャッシュバージョンを定義し、更新時に破棄する
- **開発時のSW干渉**: 開発環境での更新が反映されない → 開発環境では登録しない

## 変更履歴

- 2025-12-23: 初版作成
