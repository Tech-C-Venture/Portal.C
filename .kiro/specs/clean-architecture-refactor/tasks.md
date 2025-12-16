# 実装計画

## 段階1: 基盤整備

- [ ] 1. Clean Architectureの基盤構造を構築する
- [ ] 1.1 (P) ディレクトリ構造を作成する
  - プロジェクトルートに`src/`ディレクトリを作成し、4つのレイヤーディレクトリ（domain/, application/, infrastructure/, presentation/）を配置する
  - 各レイヤー内に機能別サブディレクトリを作成する（domain/entities/, domain/value-objects/, application/use-cases/, application/ports/, application/dtos/, infrastructure/repositories/, infrastructure/database/, infrastructure/auth/, infrastructure/di/）
  - 既存の`app/`と`components/`ディレクトリはプレゼンテーション層として保持する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.2 (P) TypeScript設定とパスエイリアスを構成する
  - `tsconfig.json`にレイヤー別パスエイリアスを追加する（@/domain/, @/application/, @/infrastructure/, @/presentation/）
  - TypeScript strict modeが有効であることを確認する
  - レイヤー依存ルールを強制するためのコンパイラオプションを設定する
  - _Requirements: 1.7, 6.6, 6.7_

- [ ] 1.3 依存性注入メカニズムを実装する
  - 軽量DIコンテナを実装する（ioctopus風のインターフェースバインディングパターン）
  - 型安全な依存性登録と解決機能を提供する
  - ドメインモジュールファクトリーパターンを実装する
  - Next.js 15 Server Componentsとの互換性を確保する
  - _Requirements: 4.9, 6.5_

## 段階2: ドメイン層の構築

- [ ] 2. ビジネスロジックとエンティティを定義する
- [ ] 2.1 (P) Memberエンティティと値オブジェクトを実装する
  - Memberエンティティをイミュータブルなインターフェースとして定義する（id, name, email, studentId, enrollmentYear, isActive, status, skills, interests）
  - Email値オブジェクトをバリデーションロジック付きで実装する（正規表現によるメールアドレス形式検証）
  - StudentId値オブジェクトをバリデーションロジック付きで実装する（学籍番号形式検証）
  - 学年計算メソッド（calculateGrade）をエンティティ内に実装する
  - ステータス有効性チェックメソッド（isStatusValid）をエンティティ内に実装する（24時間制限）
  - types/index.tsの既存ビジネスロジックをMemberエンティティに移行する
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

- [ ] 2.2 (P) Eventエンティティと値オブジェクトを実装する
  - Eventエンティティをイミュータブルなインターフェースとして定義する（id, title, description, startDate, endDate, capacity, participantCount, location）
  - EventCapacity値オブジェクトを実装する（定員のバリデーション）
  - 定員チェックロジックをエンティティ内に実装する（participantCount ≤ capacity）
  - イベント日時のバリデーションを実装する（startDate < endDate）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

- [ ] 2.3 (P) Timetableエンティティを実装する
  - Timetableエンティティをイミュータブルなインターフェースとして定義する（id, memberId, dayOfWeek, period, courseName, classroom）
  - 時間割データのバリデーションロジックを実装する（dayOfWeek: 1-7, period: 1-6）
  - _Requirements: 2.1, 2.2, 2.7_

- [ ] 2.4 (P) ドメインレイヤーの独立性を検証する
  - ドメインレイヤーが外部ライブラリやフレームワークに依存していないことを確認する
  - アプリケーション層、インフラストラクチャ層、プレゼンテーション層へのインポートが存在しないことを検証する
  - _Requirements: 2.2, 2.6, 6.1_

## 段階3: アプリケーション層の構築

- [ ] 3. ユースケースとポートインターフェースを定義する
- [ ] 3.1 (P) リポジトリポートインターフェースを定義する
  - IMemberRepositoryインターフェースを定義する（findById, findAll, findByEmail, create, update, delete）
  - IEventRepositoryインターフェースを定義する（findById, findAll, create, update, delete, registerMember, unregisterMember, getParticipants）
  - ITimetableRepositoryインターフェースを定義する（findByMemberId, create, update, delete）
  - すべてのリポジトリメソッドがResult型を返すように定義する
  - _Requirements: 3.3, 3.5, 6.5_

- [ ] 3.2 (P) DTOを定義する
  - MemberDTOを定義する（シリアライズ可能な型のみ、Date→ISO文字列変換）
  - EventDTOを定義する（シリアライズ可能な型のみ）
  - TimetableDTOを定義する（シリアライズ可能な型のみ）
  - Server ComponentsとClient Components間のデータ転送に適した形式にする
  - _Requirements: 3.4_

- [ ] 3.3 Memberプロフィール取得ユースケースを実装する
  - GetMemberProfileUseCaseクラスを実装する（execute()メソッド）
  - IMemberRepositoryを依存性として受け取る
  - メンバープロフィールを取得し、学年計算とステータス有効性チェックを適用する
  - ドメインエンティティをMemberDTOに変換する
  - エラーハンドリングを実装する（MemberNotFoundError, RepositoryError）
  - _Requirements: 3.1, 3.2, 3.6, 3.7_

- [ ] 3.4 イベント参加登録ユースケースを実装する
  - RegisterForEventUseCaseクラスを実装する（execute()メソッド）
  - IEventRepositoryを依存性として受け取る
  - ビジネスルール検証を実装する（定員チェック、重複チェック）
  - トランザクション境界を定義する
  - エラーハンドリングを実装する（EventFullError, AlreadyRegisteredError, RepositoryError）
  - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8_

- [ ] 3.5 (P) 追加のユースケースを実装する
  - UpdateMemberProfileUseCaseを実装する（プロフィール更新）
  - GetEventListUseCaseを実装する（イベント一覧取得）
  - GetTimetableUseCaseを実装する（時間割取得）
  - CreateEventUseCaseを実装する（管理者向けイベント作成）
  - 各ユースケースにトランザクション境界とエラーハンドリングを定義する
  - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8_

- [ ] 3.6 (P) アプリケーション層の依存性ルールを検証する
  - アプリケーション層がドメイン層のみに依存していることを確認する
  - インフラストラクチャ層やプレゼンテーション層への直接依存が存在しないことを検証する
  - _Requirements: 3.5, 6.2_

## 段階4: インフラストラクチャ層の構築

- [ ] 4. リポジトリ実装とデータマッパーを構築する
- [ ] 4.1 Supabaseクライアント設定を整備する
  - DatabaseClientクラスを実装する（getServerClient(), getAdminClient()）
  - 既存のlib/supabase/配下のクライアントをアダプターとして活用する
  - 環境変数の検証ロジックを実装する（起動時）
  - RLS（Row Level Security）統合を確保する
  - _Requirements: 4.3_

- [ ] 4.2 SupabaseMemberRepositoryを実装する
  - IMemberRepositoryインターフェースを実装する
  - Supabaseクライアントを使用してCRUD操作を実装する
  - データマッパーを実装する（DB型→Memberエンティティ、Memberエンティティ→DB型）
  - Result型を使用したエラーハンドリングを実装する
  - RLSポリシーを尊重したクエリを実装する
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

- [ ] 4.3 SupabaseEventRepositoryを実装する
  - IEventRepositoryインターフェースを実装する
  - Supabaseクライアントを使用してCRUD操作を実装する
  - データマッパーを実装する（DB型→Eventエンティティ、Eventエンティティ→DB型）
  - Result型を使用したエラーハンドリングを実装する
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

- [ ] 4.4 PostgreSQL関数によるトランザクション処理を実装する
  - register_for_event PostgreSQL関数を作成する（参加登録のトランザクション処理）
  - 定員チェックロジックをPostgreSQL関数内に実装する
  - participationsテーブルへのINSERTとeventsテーブルのUPDATEを原子的に実行する
  - unregister_from_event PostgreSQL関数を作成する（参加解除のトランザクション処理）
  - SupabaseEventRepositoryからRPC経由でPostgreSQL関数を呼び出す実装を追加する
  - _Requirements: 3.8, 4.1, 4.2_

- [ ] 4.5 (P) SupabaseTimetableRepositoryを実装する
  - ITimetableRepositoryインターフェースを実装する
  - Supabaseクライアントを使用してCRUD操作を実装する
  - データマッパーを実装する（DB型→Timetableエンティティ、Timetableエンティティ→DB型）
  - Result型を使用したエラーハンドリングを実装する
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

- [ ] 4.6 (P) AuthProviderを実装する
  - IAuthServiceインターフェースを定義する（getCurrentUser, hasRole, signIn, signOut）
  - 既存のlib/auth-options.tsを活用してAuthProviderを実装する
  - NextAuth.jsのgetServerSession()を使用してユーザー情報を取得する
  - JWTからロール情報を抽出するロジックを実装する
  - _Requirements: 4.4_

- [ ] 4.7 (P) DIコンテナへの依存性登録を実装する
  - memberModuleファクトリーを実装する（IMemberRepository→SupabaseMemberRepository）
  - eventModuleファクトリーを実装する（IEventRepository→SupabaseEventRepository）
  - timetableModuleファクトリーを実装する（ITimetableRepository→SupabaseTimetableRepository）
  - authModuleファクトリーを実装する（IAuthService→AuthProvider）
  - シングルトンインスタンスの登録と再利用を実装する
  - _Requirements: 4.9_

- [ ] 4.8 (P) インフラストラクチャ層の依存性ルールを検証する
  - インフラストラクチャ層がプレゼンテーション層に依存していないことを確認する
  - アプリケーション層とドメイン層への依存のみが許可されていることを検証する
  - _Requirements: 6.3_

## 段階5: プレゼンテーション層統合（パイロット機能）

- [ ] 5. メンバー一覧ページをClean Architectureに統合する
- [ ] 5.1 Server Actionsを実装する
  - getMemberProfile Server Actionを実装する（GetMemberProfileUseCaseを呼び出す）
  - getMemberList Server Actionを実装する（メンバー一覧取得）
  - DIContainerを初期化してユースケースを解決する
  - Result型からHTTPレスポンスまたはDTOへの変換を実装する
  - Next.js 15のエラーハンドリングと統合する
  - _Requirements: 5.5, 5.7, 5.9_

- [ ] 5.2 メンバー一覧ページをリファクタリングする
  - app/members/page.tsxをServer Componentとしてリファクタリングする
  - Server ActionsからMemberDTOを取得する
  - 既存のUIコンポーネント（Spindle UI）をそのまま活用する
  - エラー表示を統一されたエラーUIコンポーネントで実装する
  - _Requirements: 5.1, 5.3, 5.8, 7.7_

- [ ] 5.3 パイロット機能の動作検証とリグレッションテストを実施する
  - メンバー一覧ページが正常に表示されることを確認する
  - 学年計算が正しく動作することを確認する
  - ステータス有効性チェックが正しく動作することを確認する
  - 既存の他のページが破壊されていないことを確認する
  - パフォーマンス劣化がないことを確認する
  - _Requirements: 7.7, 7.8, 9.4_

## 段階6: 全機能移行

- [ ] 6. 残りの機能をClean Architectureに移行する
- [ ] 6.1 イベント機能を移行する
  - registerForEvent Server Actionを実装する（RegisterForEventUseCaseを呼び出す）
  - app/events/page.tsxをリファクタリングする（イベント一覧表示）
  - EventRegistrationButtonコンポーネントをClient Componentとしてリファクタリングする
  - エラーハンドリングとローディング状態を実装する
  - イベント参加登録フローが正常に動作することを確認する
  - _Requirements: 5.1, 5.2, 5.4, 5.7, 5.8, 7.2, 7.7_

- [ ] 6.2 タイムテーブル機能を移行する
  - getTimetable Server Actionを実装する（GetTimetableUseCaseを呼び出す）
  - app/timetable/page.tsxをリファクタリングする
  - 学年・学部フィルタリング機能を実装する
  - タイムテーブル表示が正常に動作することを確認する
  - _Requirements: 5.1, 5.3, 5.7, 7.3, 7.7_

- [ ] 6.3 管理機能を移行する
  - createEvent Server Actionを実装する（CreateEventUseCaseを呼び出す）
  - app/admin/page.tsxをリファクタリングする
  - ロールベースアクセス制御（adminロール）を統合する
  - イベント作成、メンバー管理機能が正常に動作することを確認する
  - _Requirements: 5.1, 5.7, 7.4, 7.5, 7.7_

- [ ] 6.4 プロフィール編集機能を移行する
  - updateMemberProfile Server Actionを実装する（UpdateMemberProfileUseCaseを呼び出す）
  - app/profile/page.tsxをリファクタリングする
  - プロフィール編集フォームとバリデーションを実装する
  - ステータス更新（24時間制限）が正常に動作することを確認する
  - _Requirements: 5.1, 5.7, 7.1, 7.7_

- [ ] 6.5 既存コードのクリーンアップを実施する
  - lib/とtypes/ディレクトリから移行済みのコードを削除する
  - 未使用のインポートと型定義を削除する
  - すべてのインポートパスを新しいレイヤー構造に更新する
  - TypeScriptコンパイルエラーがないことを確認する
  - _Requirements: 1.6, 9.8_

- [ ] 6.6 全機能のリグレッションテストを実施する
  - すべての既存ページとルートが正常にアクセス可能であることを確認する
  - すべての既存ユーザーフローがリファクタリング前と同一の結果を提供することを確認する
  - Spindle UIコンポーネントのデザインが維持されていることを確認する
  - パフォーマンス劣化がないことを確認する
  - _Requirements: 7.6, 7.7, 7.8, 9.4_

## 段階7: テストとドキュメント

- [ ] 7. テスト基盤とドキュメントを整備する
- [ ] 7.1 (P) テストフレームワークを設定する
  - Jest/Vitestを導入する（Next.js 15との互換性を考慮）
  - テストランナーとカバレッジツールを設定する
  - ドメイン層、アプリケーション層、インフラストラクチャ層用のテスト環境を構築する
  - _Requirements: 8.6, 8.7_

- [ ] 7.2 (P) ドメイン層のユニットテストを実装する
  - MemberエンティティのcalculateGrade()メソッドのテストを実装する
  - MemberエンティティのisStatusValid()メソッドのテストを実装する
  - Email値オブジェクトのバリデーションテストを実装する
  - StudentId値オブジェクトのバリデーションテストを実装する
  - Eventエンティティの定員チェックロジックのテストを実装する
  - _Requirements: 8.1, 8.8_

- [ ] 7.3 (P) アプリケーション層のユニットテストを実装する
  - GetMemberProfileUseCaseのテストを実装する（モックリポジトリを使用）
  - RegisterForEventUseCaseのテストを実装する（モックリポジトリを使用）
  - DTOからエンティティへの変換ロジックのテストを実装する
  - エラーハンドリングのテストを実装する
  - _Requirements: 8.2, 8.5, 8.8_

- [ ] 7.4 (P) インフラストラクチャ層の統合テストを実装する
  - SupabaseMemberRepositoryのfindById()メソッドのテストを実装する（実データベース使用）
  - SupabaseEventRepositoryのregisterMember()メソッドのテストを実装する（実データベース、RPC関数）
  - データマッパーの変換ロジックのテストを実装する（DB型↔ドメインエンティティ）
  - _Requirements: 8.3_

- [ ] 7.5 (P) プレゼンテーション層の統合テストを実装する
  - Server Actionsの呼び出しとレスポンスのテストを実装する
  - Server ComponentsとClient Componentsの統合テストを実装する
  - エラー表示のテストを実装する
  - _Requirements: 8.3_

- [ ] 7.6 (P) E2Eテストを実装する
  - メンバープロフィール表示フローのE2Eテストを実装する
  - イベント参加登録フローのE2Eテストを実装する
  - 管理者によるイベント作成フローのE2Eテストを実装する
  - メンバー一覧表示とフィルタリングのE2Eテストを実装する
  - タイムテーブル表示とフィルタリングのE2Eテストを実装する
  - _Requirements: 7.7, 7.8_

- [ ] 7.7 (P) テストカバレッジを検証する
  - ドメイン層、アプリケーション層のテストカバレッジが80%以上であることを確認する
  - カバレッジレポートを生成する
  - カバレッジが不足している箇所を特定して追加テストを実装する
  - _Requirements: 8.7_

- [ ] 7.8 (P) アーキテクチャドキュメントを作成する
  - Clean Architectureの各レイヤーの責務と依存性ルールを説明するドキュメントを作成する
  - 新しいユースケースを追加する際の開発ガイドラインとコード例を作成する
  - リポジトリインターフェースと実装の追加方法を説明するドキュメントを作成する
  - ディレクトリ構造とファイル配置規則を説明するREADMEを各レイヤーディレクトリに配置する
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 7.9 (P) 開発者オンボーディングガイドを作成する
  - 新しい開発者向けのアーキテクチャ概要ドキュメントを作成する
  - コード生成スクリプトまたはテンプレートを作成する（新しいエンティティ、ユースケース、リポジトリの作成を支援）
  - Steering Context（.kiro/steering/）を更新して新しいアーキテクチャパターンを反映する
  - _Requirements: 10.5, 10.6, 10.7_

## タスク実行ノート

### 段階的実装の重要事項

**段階1-4: レイヤー構築**
- 各段階完了時にビルドエラーがないことを確認する
- TypeScript型エラーがないことを確認する
- 段階4完了時点でリポジトリの統合テストを実施する

**段階5: パイロット統合**
- メンバー一覧ページを最初のパイロット機能として選定した理由は、シンプルなCRUD操作であり、既存のUIコンポーネントを活用可能なため
- パイロット機能の動作確認とフィードバック収集が重要
- 既存機能を破壊しないことを最優先にする

**段階6: 全機能移行**
- 各機能の移行後に動作確認を実施する
- リグレッションテストを実施して既存機能が破壊されていないことを確認する
- 必要に応じてロールバック可能な状態を維持する（Gitブランチ戦略）

**段階7: テストとドキュメント**
- テストカバレッジ80%以上を目標とする
- ドキュメントは開発者体験の向上に直結するため、わかりやすさを重視する
- コード生成テンプレートは将来の機能追加を容易にする

### 並列実行可能なタスク

以下のタスクは `(P)` マーカーで並列実行可能と識別されている:
- 段階1: 1.1と1.2は並列可能（ディレクトリ作成とtsconfig設定は独立）
- 段階2: 2.1, 2.2, 2.3, 2.4は並列可能（異なるエンティティと値オブジェクト）
- 段階3: 3.1と3.2は並列可能（ポートインターフェースとDTO定義は独立）、3.5と3.6は並列可能
- 段階4: 4.5, 4.6, 4.7, 4.8は並列可能（異なるリポジトリと認証プロバイダー）
- 段階7: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9はすべて並列可能（異なるテストタイプとドキュメント）

### トランザクション処理の実装

- イベント参加登録（段階4.4）はPostgreSQL関数によるトランザクション処理を使用する
- SupabaseのRPC経由でPostgreSQL関数を呼び出し、原子性を保証する
- ビジネスルール検証（定員チェック、重複チェック）はPostgreSQL関数内で実施する

### エラーハンドリングの統一

- すべてのレイヤーでResult型を使用する
- ドメインエラー、アプリケーションエラー、インフラストラクチャエラー、システムエラーを明確に分類する
- Server Actionsでエラーを適切にキャッチし、ユーザーに適切なエラーメッセージを表示する

### 依存性ルールの厳格な遵守

- ドメイン層: 他のいずれのレイヤーにも依存しない
- アプリケーション層: ドメイン層のみに依存
- インフラストラクチャ層: アプリケーション層とドメイン層に依存可能
- プレゼンテーション層: アプリケーション層とドメイン層に依存可能（インフラストラクチャ層の具体的実装には依存しない）

### 既存機能の完全保持

- リファクタリング後もすべての既存機能が正常に動作することを保証する
- ユーザー体験を損なわないことを最優先にする
- 各段階でリグレッションテストを実施する

---

**生成日**: 2025-12-16
**要件カバレッジ**: 全10要件（1-10）の受入基準を完全にカバー
**タスク総数**: 主要タスク7個、サブタスク46個
**想定工数**: 3-4週間（約26-41日、1人フルタイム換算）
