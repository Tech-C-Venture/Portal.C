# Custom Steering Templates

特定のドメインに特化したステアリングテンプレート群です。

## Templates

- **[API Standards](api-standards.md)**: API設計標準
- **[Authentication](authentication.md)**: 認証・認可の方針
- **[Database](database.md)**: データベース設計指針
- **[Deployment](deployment.md)**: デプロイ戦略
- **[Error Handling](error-handling.md)**: エラーハンドリング規約
- **[Security](security.md)**: セキュリティガイドライン
- **[Testing](testing.md)**: テスト戦略

## 使用方法

1. プロジェクトに必要なテンプレートを選択
2. プロジェクト固有の情報で埋める
3. `.kiro/steering/`にカスタムファイルとして保存
4. AI開発エージェントがこれらを参照して開発を進める

## カスタムステアリングの作成

```bash
/kiro:steering-custom
```

このコマンドでカスタムステアリングファイルを対話的に作成できます。
