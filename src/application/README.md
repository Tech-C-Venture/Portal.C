# Application Layer
- ユースケース、ポート、DTOを定義し、ドメインロジックを手続きとして束ねる。
- 依存先はDomainのみ。Infrastructure/Presentationへの直接依存は禁止。
- エイリアス: `@/application/*`。ユースケースは`execute`を公開し、Result型でエラーを表現。
