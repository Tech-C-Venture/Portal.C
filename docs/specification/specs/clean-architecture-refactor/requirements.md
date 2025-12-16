# Requirements Document

## 導入

本ドキュメントは、Portal.CをスタンダードなNext.jsアーキテクチャからClean Architectureへリファクタリングするための要件を定義します。このリファクタリングの目的は、レイヤーの適切な分離により、テスタビリティ、保守性、関心の分離を向上させながら、既存のすべての機能を維持することです。

Portal.Cは、Tech.C Venture向けのメンバー・イベント管理Webアプリケーションであり、Next.js 15、Supabase、ZITADELを使用しています。現在の構造（app/, components/, lib/, types/）から、ドメイン駆動設計の原則に基づいた明確なレイヤー構造（src/domain/, src/application/, src/infrastructure/, src/presentation/）へ移行します。

## Requirements

### Requirement 1: ディレクトリ構造とレイヤー分離

**Objective:** 開発者として、Clean Architectureの原則に従った明確なレイヤー構造を持つことで、各レイヤーの責務を理解し、保守性の高いコードベースを実現したい。

#### Acceptance Criteria

1. The Portal.C shall プロジェクトルートに`src/`ディレクトリを作成し、すべてのアプリケーションコードを格納する
2. The Portal.C shall `src/`配下に`domain/`, `application/`, `infrastructure/`, `presentation/`の4つのレイヤーディレクトリを作成する
3. The Portal.C shall 各レイヤーディレクトリ内に、機能別のサブディレクトリを配置する（例：domain/entities/, domain/value-objects/, application/use-cases/, application/ports/）
4. The Portal.C shall 既存の`app/`ディレクトリをNext.js App Router用に保持し、プレゼンテーション層のページルーティングとして使用する
5. The Portal.C shall 既存の`components/`ディレクトリをUIコンポーネント用に保持し、プレゼンテーション層の一部として使用する
6. The Portal.C shall `lib/`および`types/`ディレクトリから適切なレイヤーへコードを移行する
7. The Portal.C shall `tsconfig.json`にパスエイリアスを設定し、各レイヤーへの絶対パスインポートを可能にする（例：@/domain/, @/application/, @/infrastructure/, @/presentation/）

### Requirement 2: ドメインレイヤーの設計

**Objective:** 開発者として、外部依存を持たないビジネスロジックとエンティティを明確に定義することで、ビジネスルールの純粋性を保ち、テストしやすいコアロジックを実現したい。

#### Acceptance Criteria

1. The Portal.C shall `src/domain/entities/`にビジネスエンティティを定義する（Member, Event, Timetable等）
2. The Portal.C shall ドメインエンティティは外部ライブラリやフレームワークに依存しないプレーンなTypeScriptクラスまたはインターフェースとして実装する
3. The Portal.C shall `src/domain/value-objects/`に値オブジェクトを定義する（Email, StudentId, EventCapacity等）
4. The Portal.C shall 値オブジェクトはイミュータブルであり、バリデーションロジックを内包する
5. The Portal.C shall `src/domain/services/`にドメインサービスを配置し、複数のエンティティにまたがるビジネスロジックを実装する
6. The Portal.C shall ドメインレイヤーはアプリケーション層、インフラストラクチャ層、プレゼンテーション層のいずれにも依存しない
7. When ドメインエンティティを作成または変更する際、the Portal.C shall ビジネスルールのバリデーションを実行し、不正な状態を防ぐ

### Requirement 3: アプリケーションレイヤーの設計

**Objective:** 開発者として、ユースケースごとにアプリケーションロジックを整理し、ドメインとインフラストラクチャを橋渡しすることで、機能の実装と変更を容易にしたい。

#### Acceptance Criteria

1. The Portal.C shall `src/application/use-cases/`にユースケースクラスを配置する（RegisterForEvent, CreateMember, UpdateProfile等）
2. The Portal.C shall 各ユースケースは単一の責務を持ち、`execute()`メソッドまたは同等のエントリーポイントを提供する
3. The Portal.C shall `src/application/ports/`にリポジトリインターフェースとサービスインターフェースを定義する（IMemberRepository, IEventRepository, IAuthService等）
4. The Portal.C shall `src/application/dtos/`にデータ転送オブジェクトを配置し、レイヤー間のデータ受け渡しに使用する
5. The Portal.C shall アプリケーション層はドメイン層のみに依存し、インフラストラクチャ層やプレゼンテーション層には依存しない
6. When ユースケースを実行する際、the Portal.C shall ポートインターフェースを通じてインフラストラクチャ層の実装を呼び出す（依存性逆転の原則）
7. If ユースケース実行中にビジネスルール違反が発生した場合、then the Portal.C shall 適切なドメインエラーまたはアプリケーションエラーをスローする
8. The Portal.C shall 各ユースケースにトランザクション境界を定義し、データ整合性を保証する

### Requirement 4: インフラストラクチャレイヤーの設計

**Objective:** 開発者として、外部サービス（データベース、認証、API）との統合を抽象化し、技術的な実装詳細をビジネスロジックから分離したい。

#### Acceptance Criteria

1. The Portal.C shall `src/infrastructure/repositories/`にリポジトリの具体的実装を配置する（SupabaseMemberRepository, SupabaseEventRepository等）
2. The Portal.C shall リポジトリ実装はアプリケーション層で定義されたポートインターフェースを実装する
3. The Portal.C shall `src/infrastructure/database/`にSupabaseクライアント設定とデータベース接続ロジックを配置する
4. The Portal.C shall `src/infrastructure/auth/`にZITADEL認証プロバイダーとNextAuth設定を配置する
5. The Portal.C shall インフラストラクチャ層の実装はドメインエンティティとDTOの変換ロジックを含む
6. When リポジトリメソッドを呼び出す際、the Portal.C shall データベース固有の型（Supabase型）をドメインエンティティに変換する
7. If データベースクエリがエラーを返した場合、then the Portal.C shall アプリケーション層で処理可能な標準化されたエラーに変換する
8. The Portal.C shall `src/infrastructure/external/`に外部API連携ロジックを配置する（必要に応じて）
9. The Portal.C shall インフラストラクチャ層の各実装は、依存性注入によりアプリケーション層に提供される

### Requirement 5: プレゼンテーションレイヤーの設計

**Objective:** 開発者として、UIロジックとビジネスロジックを分離し、Next.jsのApp Router機能を活用しながら、Clean Architectureの原則に従った実装を実現したい。

#### Acceptance Criteria

1. The Portal.C shall `app/`ディレクトリをNext.js App Routerのページルーティング用に保持する
2. The Portal.C shall `components/`ディレクトリをプレゼンテーション層のUIコンポーネント用に保持する
3. The Portal.C shall ページコンポーネント（app/*/page.tsx）はサーバーコンポーネントとして実装し、ユースケースを直接呼び出す
4. The Portal.C shall クライアントコンポーネントは`use client`ディレクティブを使用し、インタラクティブなUIロジックのみを含む
5. The Portal.C shall プレゼンテーション層のコンポーネントはユースケースまたはDTOを通じてアプリケーション層と通信する
6. The Portal.C shall UIコンポーネントは直接データベースクライアント（Supabase）や認証クライアント（ZITADEL）を呼び出さない
7. When フォーム送信やユーザーアクションが発生した際、the Portal.C shall 対応するユースケースを呼び出し、ビジネスロジックを実行する
8. If ユースケース実行がエラーを返した場合、then the Portal.C shall ユーザーに適切なエラーメッセージを表示する
9. The Portal.C shall Server ActionsをNext.js 15の推奨パターンに従って実装し、ユースケースへの橋渡しを行う

### Requirement 6: 依存性ルールの遵守

**Objective:** 開発者として、Clean Architectureの依存性ルール（内側のレイヤーは外側のレイヤーに依存しない）を厳格に守ることで、アーキテクチャの整合性と変更容易性を維持したい。

#### Acceptance Criteria

1. The Portal.C shall ドメイン層は他のいずれのレイヤー（アプリケーション、インフラストラクチャ、プレゼンテーション）にも依存しない
2. The Portal.C shall アプリケーション層はドメイン層のみに依存し、インフラストラクチャ層やプレゼンテーション層には依存しない
3. The Portal.C shall インフラストラクチャ層はアプリケーション層とドメイン層に依存可能だが、プレゼンテーション層には依存しない
4. The Portal.C shall プレゼンテーション層はアプリケーション層とドメイン層に依存可能だが、インフラストラクチャ層の具体的実装には依存しない
5. When アプリケーション層が外部サービスとの統合を必要とする際、the Portal.C shall ポートインターフェースを定義し、インフラストラクチャ層がそれを実装する（依存性逆転の原則）
6. The Portal.C shall TypeScriptのコンパイラオプションやリンターを設定し、依存性ルール違反を検出する
7. If レイヤー間の不正な依存が検出された場合、then the Portal.C shall ビルドまたはリント時にエラーを報告する

### Requirement 7: 既存機能の保持

**Objective:** ユーザーおよび管理者として、リファクタリング後も既存のすべての機能が正常に動作し、ユーザー体験が損なわれないことを確認したい。

#### Acceptance Criteria

1. The Portal.C shall メンバープロフィール管理機能（プロフィール表示、編集、入学年度からの学年自動計算、在籍フラグ、スキル/興味タグ、24時間限定ステータス更新）をリファクタリング後も提供する
2. The Portal.C shall イベント管理機能（イベント一覧、登録、参加追跡、定員管理）をリファクタリング後も提供する
3. The Portal.C shall タイムテーブルシステム機能（学年・学部フィルタリング、メンバースケジュール表示）をリファクタリング後も提供する
4. The Portal.C shall ZITADEL認証とロールベースアクセス制御（管理者ロール）をリファクタリング後も提供する
5. The Portal.C shall 管理機能（イベント作成、ID別参加追跡、メンバー管理）をリファクタリング後も提供する
6. The Portal.C shall Spindle UIコンポーネントライブラリを使用したUIデザインをリファクタリング後も維持する
7. When リファクタリング後のアプリケーションを起動した際、the Portal.C shall すべての既存ページとルートが正常にアクセス可能である
8. When 既存のユーザーフローを実行した際、the Portal.C shall リファクタリング前と同一の結果と動作を提供する
9. If リファクタリング中に機能の動作変更が必要な場合、then the Portal.C shall 事前に関係者に通知し、承認を得る

### Requirement 8: テスタビリティの向上

**Objective:** 開発者として、ビジネスロジックとインフラストラクチャロジックを独立してテストできる環境を構築し、コードの品質と信頼性を向上させたい。

#### Acceptance Criteria

1. The Portal.C shall ドメイン層のエンティティと値オブジェクトを外部依存なしでユニットテスト可能にする
2. The Portal.C shall アプリケーション層のユースケースをモックリポジトリを使用してユニットテスト可能にする
3. The Portal.C shall インフラストラクチャ層のリポジトリ実装をインテグレーションテスト可能にする
4. The Portal.C shall `src/`配下の各レイヤーに対応する`__tests__/`ディレクトリまたは`.test.ts`ファイルを配置する
5. When ユースケースのテストを実行する際、the Portal.C shall リポジトリインターフェースのモック実装を注入し、データベースアクセスなしでテストを実行できる
6. The Portal.C shall テストフレームワーク（Jest, Vitest等）とテストランナーを設定し、自動テスト実行環境を構築する
7. The Portal.C shall テストカバレッジツールを導入し、コードカバレッジを測定可能にする
8. When ドメインロジックに変更を加えた際、the Portal.C shall 既存のユニットテストが自動的に検証し、リグレッションを防ぐ

### Requirement 9: マイグレーション戦略と段階的移行

**Objective:** 開発チームとして、リファクタリングを安全かつ段階的に実施し、開発速度を維持しながらリスクを最小化したい。

#### Acceptance Criteria

1. The Portal.C shall リファクタリングを機能単位またはドメイン単位で段階的に実施する
2. The Portal.C shall 新しいレイヤー構造と既存の構造が一時的に共存可能なマイグレーション計画を策定する
3. When 新しいレイヤー構造への移行を開始する際、the Portal.C shall まず小規模な機能（例：メンバープロフィール表示）をパイロットとして移行する
4. The Portal.C shall 各マイグレーション段階で既存機能のリグレッションテストを実施し、動作を検証する
5. The Portal.C shall 既存のインポートパスを新しいレイヤー構造に段階的に更新するためのツールまたはスクリプトを用意する
6. If マイグレーション中に重大な問題が発見された場合、then the Portal.C shall ロールバック可能な状態を維持する（Gitブランチ戦略）
7. The Portal.C shall 各マイグレーション段階の完了基準（定義済みテストの通過、コードレビュー承認等）を明確にする
8. When すべての機能が新しいレイヤー構造に移行完了した際、the Portal.C shall 古い構造のコードを削除し、クリーンな状態にする

### Requirement 10: ドキュメントと開発者体験

**Objective:** 開発チームとして、新しいアーキテクチャの理解を促進し、開発者が効率的に作業できる環境を提供したい。

#### Acceptance Criteria

1. The Portal.C shall Clean Architectureの各レイヤーの責務と依存性ルールを説明するドキュメントを提供する
2. The Portal.C shall 新しいユースケースを追加する際の開発ガイドラインとコード例を提供する
3. The Portal.C shall リポジトリインターフェースと実装の追加方法を説明するドキュメントを提供する
4. The Portal.C shall ディレクトリ構造とファイル配置規則を説明するREADMEを各レイヤーディレクトリに配置する
5. When 新しい開発者がプロジェクトに参加する際、the Portal.C shall オンボーディングドキュメントを通じてアーキテクチャの概要を理解できる
6. The Portal.C shall コード生成スクリプトまたはテンプレートを提供し、新しいエンティティ、ユースケース、リポジトリの作成を支援する
7. The Portal.C shall 既存のSteering Context（`.kiro/steering/`）を更新し、新しいアーキテクチャパターンを反映する

