# Presentation Layer
- Next.js App Routerのページ、Server Actions、UIコンポーネントを保持する。
- ユースケース（Application）を呼び出してビジネスロジックを実行し、Infrastructure実装への直接依存は禁止。
- エイリアス: `@/presentation/*` だが、既存の `app/` と `components/` もプレゼンテーション層として扱う。
