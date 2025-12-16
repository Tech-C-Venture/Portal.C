# Infrastructure Layer
- データベース/認証/外部APIなどの実装詳細をカプセル化する。
- Applicationで定義されたポートを実装し、Domainエンティティとデータソースのマッピングを担当する。
- Presentationへの直接依存は禁止。エイリアス: `@/infrastructure/*`。
