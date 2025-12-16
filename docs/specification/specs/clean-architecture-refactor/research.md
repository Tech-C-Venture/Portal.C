# 技術調査レポート: Clean Architecture リファクタリング

## 調査概要

本調査は、Portal.CをClean Architectureへリファクタリングするための技術的実現可能性と実装パターンを検証することを目的としています。

## 1. Clean Architecture for Next.js 15 App Router

### 調査ソース
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)
- [Next.js Clean Architecture GitHub Repository](https://github.com/nikolovlazar/nextjs-clean-architecture)
- [Clean Architecture in Next.js 14: A Practical Guide](https://medium.com/@entekumejeffrey/clean-architecture-in-next-js-14-a-practical-guide-part-two-3e5d8dbf5a7c)
- [Next.js 15 Folder Structure Guide](https://nanohost.org/blog/next.js-15-folder-structure-a-practical-guide-for-scalability-and-clean-architecture)

### 主要な発見

**レイヤー構造**
- `src/domain/`: ビジネスルール、エンティティ、値オブジェクト（外部依存なし）
- `src/application/`: ユースケース、ポートインターフェース、DTO
- `src/infrastructure/`: 外部サービスアダプター（DB、認証、API）
- `src/presentation/` または `app/` + `components/`: Next.js App Routerエントリーポイント

**Next.js 15統合パターン**
- **Server Componentsがデフォルト**: データ取得とレンダリングをサーバーで実行
- **Client Componentsは選択的**: インタラクティブ性が必要な箇所のみ
- **Server Actions**: レイヤー間通信の主要メカニズム（`use server`ディレクティブ）
- **境界の明確化**: `use server` と `use client` ディレクティブがレイヤー分離を強制

**依存性ルール**
- Server Componentsはデフォルトで、データベース操作や認証などをサーバーレイヤーで処理
- コンポーネントは直接データベースを呼び出さず、Server Actionsを介して実行
- 検証スキーマ（Zod）をクライアントとサーバー間で共有

**ベストプラクティス**
- レイアウトツリーを最初にモデル化
- Route Groupsを使用してURLをクリーンに保つ
- Server vs Clientの境界を明示的に
- クライアントJSを最小化し、データアクセスをサーバー（RSC）にプッシュ

### 推奨事項
- `app/`ディレクトリをNext.js App Routerページとして保持
- `src/`配下にClean Architectureレイヤーを作成
- Server ActionsをApplication層とPresentation層の橋渡しとして使用
- TypeScriptの厳密な型チェックを活用

---

## 2. 依存性注入 (Dependency Injection) パターン

### 調査ソース
- [Clean Architecture Layering in Next.js with DI](https://dev.to/behnamrhp/how-we-fixed-nextjs-at-scale-di-clean-architecture-secrets-from-production-gnj)
- [Dependency Injection with NextJS and TypeScript](https://himynameistim.com/blog/dependency-injection-with-nextjs-and-typescript)
- [Managing Dependency Injection with Nextjs Apps](https://nomadicsoft.io/blog/managing-dependency-injection-with-nextjs-apps-with-typescript-github-sample-project-for-next-js)

### 主要な発見

**Feature Layer（ビジネスロジック）のDI**
- UseCaseとRepositoryをインターフェースベースのバインディングで接続
- Adapter Patternに従い、ビジネスロジックをデータソースから分離
- 一意のDIキーを使用した型安全な依存性解決

```typescript
export default interface UserRepository {
  create(params: CreateUserParams): ApiTask<true>;
  update(params: UpdateUserParams): ApiTask<true>;
  delete(ids: string[]): ApiTask<true>;
}

export const userRepoKey = "userRepoKey";
```

**Application Layer（React/Next.js統合）のDI**
- MVVMパターンを実装
- ViewModelとViewをBridge Patternで接続
- Server ComponentからClient ComponentへのViewModel受け渡しに一意のVMキーを使用

**モジュール登録ファクトリー**
```typescript
export default function userModule(di: DependencyContainer) {
  di.register(userRepoKey, UserRepositoryImpl);
  return di;
}
```

**DIライブラリ選択肢**
- **TSyringe**: TypeScript専用、デコレータベース、reflect-metadata必要
- **Awilix**: JavaScript/TypeScript両対応、軽量
- **InversifyJS**: TypeScript専用、機能豊富
- **ioctopus**: reflect-metadataなし、全ランタイム対応（推奨）

**Next.js 15 Server Components対応**
- 環境変数ベースの設定（T3 Env + Zod）
- 集中化されたORMインスタンス（Drizzle）
- Server ActionsをコンポーネントへのケイパビリティとしてInject

### 推奨事項
- **軽量DIアプローチ**: ファクトリー関数パターン + インターフェースバインディング
- **ioctopus**または**Awilix**を推奨（Next.js Server Componentsと互換性が高い）
- インターフェースベースのDIキーを使用して型安全性を確保
- ドメインモジュールをDIファクトリーとして組織化

---

## 3. Supabase トランザクション処理

### 調査ソース
- [Transactions and RLS in Supabase Edge Functions](https://marmelab.com/blog/2025/12/08/supabase-edge-function-transaction-rls.html)
- [Supabase JavaScript API Reference - RPC](https://supabase.com/docs/reference/javascript/rpc)
- [Easy functions and transactions using Postgres + PostgREST](https://dev.to/voboda/gotcha-supabase-postgrest-rpc-with-transactions-45a7)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

### 主要な発見

**トランザクションサポートの制約**
- **supabase-jsクライアントはトランザクションをサポートしない**
- PostgRESTベースのため、クライアントサイドでのトランザクション境界は不可

**推奨されるワークアラウンド**

1. **PostgreSQL関数をRPC経由で呼び出す（推奨）**
   - データベースに複数のクエリをトランザクション内で実行するSQL関数を作成
   - Edge FunctionまたはServer ActionからRPCで呼び出す
   - **重要**: PostgRESTはrpc()呼び出しを自動的にトランザクションでラップする

```sql
CREATE OR REPLACE FUNCTION register_for_event(
  p_member_id UUID,
  p_event_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- トランザクション内で複数操作を実行
  INSERT INTO participations (member_id, event_id) VALUES (p_member_id, p_event_id);
  UPDATE events SET participant_count = participant_count + 1 WHERE id = p_event_id;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

```typescript
const { data, error } = await supabase.rpc('register_for_event', {
  p_member_id: memberId,
  p_event_id: eventId
});
```

2. **Edge Functionsで直接データベースアクセス**
   - Edge FunctionsはサーバーサイドのためPostgRESTを経由せず直接データベースアクセス可能
   - 純粋なSQLトランザクションを使用可能

3. **ORM使用（Prisma等）**
   - トランザクションサポートが必要な場合、PrismaなどのORMを使用

**TypeScript型サポート**
- Supabase CLIで型生成: `supabase gen types typescript --project-id [id] > database.types.ts`
- RPC関数は戻り値型を自動的に推論
- null制約、生成カラムを検出

**セキュリティベストプラクティス**
- **SECURITY INVOKER**を使用（デフォルト、推奨）
- SECURITY DEFINERを使用する場合、search_pathを明示的に設定

### 推奨事項
- **複雑なユースケース**: PostgreSQL関数をRPC経由で呼び出す
- **単純なCRUD**: Supabase標準クエリを使用
- トランザクション境界はユースケースレベルで定義
- RPC関数の型安全性を確保（TypeScript型生成）

---

## 4. Server Components と Client Components のデータフロー

### 調査ソース
- [Next.js Official Docs: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Client vs Server Components in Next.js 15 — A Deep Dive](https://medium.com/@technoharsh21/client-vs-server-components-in-next-js-15-a-deep-dive-with-real-examples-f40af6c9d12e)
- [React Server Components in Next.js 15: A Deep Dive](https://dzone.com/articles/react-server-components-nextjs-15)
- [Next.js 15: Simplifying Server Data Fetching](https://tribhuvancode.medium.com/next-js-15-simplifying-server-data-fetching-with-async-server-components-13b76d258d90)

### 主要な発見

**コンポジションパターン（Server → Client）**
- Server ComponentはClient Componentを含むことができる
- Client ComponentはServer Componentを**直接含むことはできない**が、`children`プロップを通じて受け取ることは可能

```typescript
// ✅ 許可: Server Component → Client Component
<ClientModal>
  <ServerCart /> {/* childrenとして渡される */}
</ClientModal>

// ❌ 禁止: Client Component内で直接Server Componentをインポート
import ServerCart from './ServerCart'; // エラー
```

**依存性フロールール**
- Server Component → Client Component: ✅ 一般的なパターン
- Client Component → Server Component: ❌ 許可されない
- Server Component → Server Component: ✅ 完全サポート
- Client Component → Client Component: ✅ 完全サポート

**Next.js 15のデータ取得**
- `getServerSideProps`を非同期Server Componentパターンで置き換え
- async/awaitを直接Server Component内で使用
- 自動キャッシングと再検証（`revalidate`オプション）

**アーキテクチャの特徴**
- ストリーミングファーストのHTMLとデータの段階的配信
- コンポーネントレベルのコード分割（Server Componentsはクライアントに到達しない）
- 並列データ取得（複数の非同期操作を同時実行）
- コンポーネントおよびフェッチレベルの細粒度キャッシング

**パフォーマンスの利点**
- デフォルトでServer Componentsを使用し、サーバーでUIをレンダリングしてキャッシュ
- ブラウザの負荷を軽減し、パフォーマンスを向上

### 推奨事項
- Server Componentsをデフォルトとして使用
- データ取得はServer Components内で直接実行
- Client Componentsはインタラクティブな要素のみに制限
- `children`パターンでServer ComponentsをClient Componentsに渡す
- async/await構文でデータフローを直感的に

---

## 5. Repository パターン TypeScript 実装

### 調査ソース
- [Clean Architecture in Node.js: Repository Pattern with TypeScript and Prisma](https://blog.alexrusin.com/clean-architecture-in-node-js-implementing-the-repository-pattern-with-typescript-and-prisma/)
- [Using Clean Architecture and Unit of Work Pattern](https://dev.to/schead/using-clean-architecture-and-the-unit-of-work-pattern-on-a-nodejs-application-3pc9)
- [TypeScript Clean Architecture GitHub](https://github.com/bypepe77/typescript-clean-architecture)
- [Atomic Repositories in Clean Architecture](https://blog.sentry.io/atomic-repositories-in-clean-architecture-and-typescript/)

### 主要な発見

**インターフェース設計戦略**
- **エンティティインターフェース**: データモデル構造を定義（ITask, IProject）
- **クエリパラメータインターフェース**: ページネーションとフィルタリングロジックを処理
- **リポジトリインターフェース**: 利用可能なデータ操作を指定（list, get, create, update）

**データマッピングアプローチ**
- 各リポジトリにprivate `mapEntity()`メソッドを含む
- ORM結果をドメインインターフェースに変換
- レイヤー間の型一貫性を確保

```typescript
interface IMemberRepository {
  findById(id: string): Promise<Member | null>;
  findAll(params: QueryParams): Promise<Member[]>;
  create(member: Member): Promise<Member>;
  update(id: string, member: Partial<Member>): Promise<Member>;
  delete(id: string): Promise<void>;
}

class SupabaseMemberRepository implements IMemberRepository {
  private mapToEntity(row: Database['public']['Tables']['members']['Row']): Member {
    return {
      id: row.id,
      name: row.name,
      // ... マッピングロジック
    };
  }

  async findById(id: string): Promise<Member | null> {
    const { data, error } = await this.client
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }
}
```

**Mixinパターンを使用したリポジトリ構造**
- **BaseRepository**: 共有されたクライアントアクセスとページネーションデフォルト
- **AddEntityRepository**: エンティティ固有の操作をMixin関数として
- **ComposedRepository**: Mixinを統一されたインスタンスに結合

**Clean Architectureの利点**
- 関心の分離を促進
- テスタビリティを向上
- データレイヤーの交換を容易化

### 推奨事項
- Application層でリポジトリインターフェースを定義
- Infrastructure層で具体的な実装を提供
- データマッパーメソッドでDB型↔ドメインエンティティ変換
- 型安全性を確保（TypeScriptの厳密な型）
- 汎用リポジトリよりも専用リポジトリパターンを優先

---

## 6. アーキテクチャ決定記録 (ADR)

### ADR-001: レイヤー構造
**決定**: `src/`配下にdomain/, application/, infrastructure/, presentation/の4層を作成

**根拠**:
- Clean Architectureの標準的なレイヤー分離
- Next.js 15 App Routerとの互換性
- テスタビリティと保守性の向上

**代替案**:
- Hexagonal Architecture（ポート&アダプター）: より複雑、オーバーエンジニアリングの懸念
- 3層アーキテクチャ: レイヤー分離が不十分

---

### ADR-002: 依存性注入メカニズム
**決定**: 軽量ファクトリーパターン + インターフェースバインディング（ioctopus または カスタム実装）

**根拠**:
- Next.js 15 Server Componentsとの互換性
- reflect-metadata不要（全ランタイム対応）
- Tree-shaking対応でバンドルサイズ最小化
- 学習曲線が緩やか

**代替案**:
- TSyringe: reflect-metadata必要、Next.js Server Componentsと互換性の問題
- InversifyJS: 重量級、複雑なセットアップ

---

### ADR-003: トランザクション処理戦略
**決定**: PostgreSQL関数をRPC経由で呼び出す

**根拠**:
- supabase-jsはトランザクション未サポート
- PostgRESTがrpc()を自動的にトランザクションでラップ
- RLS（Row Level Security）との統合が容易
- 型安全性（TypeScript型生成）

**代替案**:
- Edge Functionsで直接データベースアクセス: 複雑性増加、RLS統合が困難
- ORMの追加（Prisma）: 技術スタック増加、学習コスト

---

### ADR-004: Server/Client Component 分離戦略
**決定**: Server Componentsをデフォルト、Client Componentsは`use client`で明示的に

**根拠**:
- Next.js 15のベストプラクティス
- パフォーマンス最適化（サーバーレンダリング）
- データ取得の直感性（async/await）
- バンドルサイズ削減

**代替案**:
- すべてClient Components: パフォーマンス悪化、バンドルサイズ増大
- 手動でのスプリット: 複雑性増加、一貫性の欠如

---

### ADR-005: リポジトリパターン実装
**決定**: 専用リポジトリ（エンティティごと）+ データマッパー

**根拠**:
- 明確な責務分離
- 型安全性の確保
- Supabaseクエリビルダーとの統合が容易
- テストしやすい

**代替案**:
- 汎用リポジトリ: 型安全性が低い、ビジネスロジックの表現が困難
- Active Recordパターン: ドメイン層とインフラ層の混在

---

## 7. リスクと軽減策

### 技術的リスク

**リスク 1: Next.js 15 Server ComponentsとDIの統合複雑性**
- **影響**: 中
- **軽減策**:
  - パイロット機能（メンバー一覧）で最初に検証
  - ioctopusまたはシンプルなファクトリーパターンを使用
  - 公式ドキュメントとコミュニティパターンを参照

**リスク 2: Supabaseトランザクション制約**
- **影響**: 中
- **軽減策**:
  - PostgreSQL関数をRPC経由で呼び出す戦略を採用
  - 段階2で実装パターンを確立
  - 型安全性を確保（TypeScript型生成）

**リスク 3: Server/Client Componentデータシリアライゼーション**
- **影響**: 低〜中
- **軽減策**:
  - DTOを使用してシリアライズ可能な型のみを渡す
  - Date型はISO文字列に変換
  - Next.js公式ドキュメントのベストプラクティスに従う

### プロジェクトリスク

**リスク 4: チームの学習曲線**
- **影響**: 中
- **軽減策**:
  - 段階的移行により各段階で学習
  - アーキテクチャドキュメントとガイドライン作成
  - コードレビューとペアプログラミング

**リスク 5: 並行開発期間の複雑性**
- **影響**: 中
- **軽減策**:
  - 既存コードを破壊しない
  - 新機能は新レイヤーで実装
  - 明確なマイグレーション計画（7段階）

---

## 8. 未解決の調査項目

### 実装段階での検証が必要な項目

1. **エンティティ実装方式**
   - クラスベース vs インターフェース+純粋関数
   - テスタビリティと保守性のトレードオフ
   - **推奨**: パイロット機能で両方を試し、チームの嗜好に基づいて決定

2. **キャッシング戦略**
   - Next.js 15のキャッシング機能との統合
   - リポジトリレベルのキャッシング vs ユースケースレベルのキャッシング
   - **推奨**: 段階5以降で性能要件に基づいて実装

3. **エラーハンドリング標準化**
   - ドメインエラー、アプリケーションエラー、インフラエラーの分類
   - Result型 vs Exception
   - **推奨**: 段階2-3でエラー型システムを確立

4. **テストフレームワーク選定**
   - Jest vs Vitest
   - モックライブラリ選定
   - **推奨**: 段階7で決定、Next.js 15との互換性を考慮

---

## 9. 推奨実装アプローチ

### ハイブリッドアプローチ（Option C）

**段階1: 基盤整備**
- ディレクトリ構造作成（src/domain, application, infrastructure）
- tsconfig.jsonパスエイリアス設定
- 軽量DIメカニズム実装（ファクトリーパターン）

**段階2: ドメイン層**
- エンティティ実装（Member, Event, Timetable）
- 値オブジェクト実装（Email, StudentId, EventCapacity）
- 既存types/index.tsのビジネスロジックを移行

**段階3: アプリケーション層**
- リポジトリインターフェース定義
- DTO定義
- パイロットユースケース実装（GetMemberProfile, ListMembers）

**段階4: インフラストラクチャ層**
- リポジトリ実装（SupabaseMemberRepository）
- データマッパー実装
- RPC関数作成（必要に応じて）

**段階5: プレゼンテーション層統合**
- パイロットページ（メンバー一覧）をユースケース統合
- Server Actions実装
- エラーハンドリング統合

**段階6: 全機能移行**
- 残機能の移行（イベント、時間割、管理画面）
- モックデータを実データに置き換え

**段階7: テストとドキュメント**
- ユニットテスト実装
- インテグレーションテスト
- アーキテクチャドキュメント作成

---

## 10. まとめ

### 技術的実現可能性: ✅ 高い

**根拠**:
- Next.js 15はClean Architectureパターンをサポート
- 依存性注入の軽量実装パターンが確立
- Supabaseトランザクションの実用的ワークアラウンド存在
- Server/Client Componentsのデータフロー明確
- リポジトリパターンのTypeScript実装パターン豊富

### 推奨技術スタック

- **レイヤー構造**: Clean Architecture 4層（Domain, Application, Infrastructure, Presentation）
- **DI**: 軽量ファクトリーパターン（ioctopusまたはカスタム）
- **トランザクション**: PostgreSQL関数 + RPC
- **データフロー**: Server Componentsデフォルト + Server Actions
- **リポジトリ**: 専用リポジトリ + データマッパー

### 次のステップ

1. 要件の最終承認
2. 技術設計ドキュメント生成（design.md）
3. タスク分解とマイルストーン設定
4. パイロット機能の実装開始
