# Tasks

## 実装タスク

1. Web App Manifestを追加する
   - `app/manifest.ts`を作成し、`name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, `icons`を定義する
   - `public/icons/`に`icon-192.png`と`icon-512.png`を配置する

2. Service Workerを実装する
   - `public/sw.js`を作成し、アプリシェル/静的アセットをキャッシュする
   - キャッシュバージョンを定義し、更新時に古いキャッシュを削除する

3. Service Worker登録コンポーネントを追加する
   - `components/PwaRegister.tsx`を作成して`navigator.serviceWorker.register`を実装する
   - 開発環境では登録しないガードを追加する

4. レイアウトにPWA設定を追加する
   - `app/layout.tsx`へ`PwaRegister`を組み込み、`themeColor`メタデータを設定する

## 検証タスク

1. `manifest.webmanifest`が配信されることを確認する
2. ブラウザでPWAとしてインストール候補に出ることを確認する
3. Service Workerが登録され、キャッシュが作成されることを確認する
4. オフライン時にキャッシュ済みアセットが表示されることを確認する
