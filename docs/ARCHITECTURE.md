# Clean Architecture 設計ドキュメント

## アーキテクチャ概要

Portal.CはClean Architectureパターンを採用し、以下の4層構造で設計されています。

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                 │
│  (app/, components/ - Next.js App Router)   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│   (use-cases/, ports/, dtos/, mappers/)     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Infrastructure Layer               │
│ (repositories/, database/, auth/, di/)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            Domain Layer                     │
│       (entities/, value-objects/)           │
└─────────────────────────────────────────────┘
```

## レイヤー構成

### 1. Domain Layer (`src/domain/`)
**責務**: ビジネスロジックとエンティティ定義
**依存**: なし（外部ライブラリ・フレームワーク不使用）

- **entities/**: Member, Event, Timetable
- **value-objects/**: Email, StudentId, EventCapacity, CurrentStatus

**特徴**:
- イミュータブル設計
- バリデーションロジック内包
- 純粋なTypeScript（フレームワーク非依存）

### 2. Application Layer (`src/application/`)
**責務**: ユースケースとアプリケーションロジック
**依存**: Domain Layer のみ

- **use-cases/**: GetMemberProfile, RegisterForEvent等
- **ports/**: IMemberRepository, IEventRepository等（インターフェース定義）
- **dtos/**: MemberDTO, EventDTO等（データ転送オブジェクト）
- **mappers/**: Entity ↔ DTO変換

**特徴**:
- 依存性逆転の原則（ポートインターフェース定義）
- Result型によるエラーハンドリング
- トランザクション境界の定義

### 3. Infrastructure Layer (`src/infrastructure/`)
**責務**: 外部サービスとの統合
**依存**: Application Layer, Domain Layer

- **repositories/**: SupabaseMemberRepository等（ポート実装）
- **database/**: Supabaseクライアント設定
- **di/**: 依存性注入コンテナ

**特徴**:
- リポジトリパターン
- データマッパー（DB型 ↔ ドメインエンティティ）
- PostgreSQL関数によるトランザクション処理

### 4. Presentation Layer (`app/`, `components/`)
**責務**: UI表示とユーザーインタラクション
**依存**: Application Layer, Domain Layer

- **app/**: Next.js App Router（Server Components）
- **components/**: Reactコンポーネント（Client Components）

**特徴**:
- Server Components: データ取得、ユースケース呼び出し
- Client Components: インタラクティブUI
- Server Actions: フォーム送信等

## 依存性ルール

```
Domain ← Application ← Infrastructure
  ↑                        ↑
  └────── Presentation ────┘
```

**原則**: 内側の層は外側の層に依存しない

## 依存性注入（DI）

軽量DIコンテナを使用：

```typescript
import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';

// リポジトリの解決
const memberRepository = container.resolve<IMemberRepository>(
  REPOSITORY_KEYS.MEMBER
);
```

**登録**: モジュールファクトリーパターン
- `memberModule`: メンバー関連の依存性
- `eventModule`: イベント関連の依存性
- `timetableModule`: 時間割関連の依存性

## データフロー

### Server Component → Repository

```typescript
// 1. Server Componentでデータ取得
async function getMembers() {
  const repository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const result = await repository.findAll();

  // 2. Entity → DTO変換
  return MemberMapper.toDTOList(result.value);
}

// 3. Client Componentに渡す
<MemberList members={members} />
```

### ユースケース実行

```typescript
// 1. ユースケース取得
const useCase = new RegisterForEventUseCase(eventRepository);

// 2. 実行
const result = await useCase.execute(eventId, memberId);

// 3. Result型でエラーハンドリング
if (!result.success) {
  console.error(result.error);
}
```

## トランザクション処理

Supabase（PostgreSQL）の関数を使用：

```sql
CREATE FUNCTION register_for_event(p_event_id UUID, p_member_id UUID)
RETURNS void AS $$
BEGIN
  -- 定員チェック + 参加登録を原子的に実行
  ...
END;
$$ LANGUAGE plpgsql;
```

## テスト戦略

- **Domain Layer**: ユニットテスト（外部依存なし）
- **Application Layer**: ユニットテスト（モックリポジトリ）
- **Infrastructure Layer**: 統合テスト（Supabase接続）
- **Presentation Layer**: E2Eテスト（Playwright/Cypress）

## ディレクトリ構造

```
Portal.C/
├── src/
│   ├── domain/               # ドメイン層
│   │   ├── entities/
│   │   └── value-objects/
│   ├── application/          # アプリケーション層
│   │   ├── use-cases/
│   │   ├── ports/
│   │   ├── dtos/
│   │   └── mappers/
│   └── infrastructure/       # インフラストラクチャ層
│       ├── repositories/
│       ├── database/
│       └── di/
├── app/                      # プレゼンテーション層（Server Components）
└── components/               # プレゼンテーション層（Client Components)
```

## パスエイリアス

```json
{
  "@/domain/*": ["./src/domain/*"],
  "@/application/*": ["./src/application/*"],
  "@/infrastructure/*": ["./src/infrastructure/*"]
}
```

## 開発ワークフロー

1. **新機能追加時**:
   - Domain Entityを定義
   - Application Use Caseを実装
   - Infrastructure Repositoryを実装
   - DI登録
   - Presentation統合

2. **変更時**:
   - 影響範囲を層で限定
   - 依存性ルールを守る
   - テストで担保

## 参考資料

- Clean Architecture (Robert C. Martin)
- Hexagonal Architecture (Ports & Adapters)
- Domain-Driven Design
