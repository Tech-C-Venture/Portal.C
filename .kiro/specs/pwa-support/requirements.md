# Requirements Document

## 導入

本ドキュメントは、Portal.Cに基本的なPWA対応を追加するための要件を定義します。目的は、モバイル/デスクトップブラウザでインストール可能にし、PWAとして認識される最小限の構成（Web App ManifestとService Worker）を提供することです。オフライン完全対応やプッシュ通知などの高度な機能は本フェーズの範囲外とします。

## Requirements

### Requirement 1: Web App Manifestの提供

**Objective:** ユーザーとして、Portal.Cをアプリのようにインストールできるようにするため、ブラウザが認識できるWeb App Manifestが欲しい。

#### Acceptance Criteria

1. The Portal.C shall `manifest.webmanifest`を配信する
2. The Portal.C shall `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, `icons`をManifestに含める
3. The Portal.C shall 192x192および512x512のアイコンを提供する
4. When ブラウザがManifestを読み込む場合、the Portal.C shall インストール候補として認識される

### Requirement 2: Service Workerの登録

**Objective:** ユーザーとして、PWAとしてインストールできる要件を満たすため、Service Workerが登録されていることを期待する。

#### Acceptance Criteria

1. The Portal.C shall Service Workerを登録する
2. The Portal.C shall Service Workerでアプリシェル/静的アセットをキャッシュする
3. When オフライン状態でキャッシュ済みアセットへアクセスする場合、the Portal.C shall 表示を維持する

### Requirement 3: メタデータの追加

**Objective:** ユーザーとして、ブラウザがPWAとして認識できるよう、必要なメタデータが設定されていることを期待する。

#### Acceptance Criteria

1. The Portal.C shall `manifest`へのリンクをHTMLメタデータとして設定する
2. The Portal.C shall `theme-color`をHTMLメタデータとして設定する

## Out of Scope

- プッシュ通知
- バックグラウンド同期
- 動的データのオフライン同期
- PWA向け専用UI/画面の追加
