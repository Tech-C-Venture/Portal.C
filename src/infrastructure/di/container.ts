/**
 * 軽量DIコンテナ実装
 * ioctopus風のインターフェースバインディングパターン
 * Next.js 15 Server Components互換
 */

export type Factory<T> = () => T;
export type AsyncFactory<T> = () => Promise<T>;

/**
 * DIコンテナ
 * 型安全な依存性登録と解決を提供
 */
export class Container {
  private bindings = new Map<symbol, Factory<unknown> | AsyncFactory<unknown>>();
  private singletons = new Map<symbol, unknown>();

  /**
   * 依存性を登録する（トランジェント）
   */
  bind<T>(key: symbol, factory: Factory<T>): this {
    this.bindings.set(key, factory);
    return this;
  }

  /**
   * 依存性を登録する（シングルトン）
   */
  bindSingleton<T>(key: symbol, factory: Factory<T>): this {
    this.bindings.set(key, factory);
    // 初回解決時にシングルトンとしてキャッシュ
    const originalFactory = factory;
    this.bindings.set(key, () => {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, originalFactory());
      }
      return this.singletons.get(key) as T;
    });
    return this;
  }

  /**
   * 非同期ファクトリーを登録する（トランジェント）
   */
  bindAsync<T>(key: symbol, factory: AsyncFactory<T>): this {
    this.bindings.set(key, factory);
    return this;
  }

  /**
   * 依存性を解決する
   */
  resolve<T>(key: symbol): T {
    const factory = this.bindings.get(key);
    if (!factory) {
      throw new Error(`No binding found for key: ${key.toString()}`);
    }

    const result = factory();

    // 非同期ファクトリーの場合はエラー
    if (result instanceof Promise) {
      throw new Error(
        `Cannot resolve async binding synchronously. Use resolveAsync() instead for key: ${key.toString()}`
      );
    }

    return result as T;
  }

  /**
   * 非同期依存性を解決する
   */
  async resolveAsync<T>(key: symbol): Promise<T> {
    const factory = this.bindings.get(key);
    if (!factory) {
      throw new Error(`No binding found for key: ${key.toString()}`);
    }

    const result = factory();

    // Promise または 通常の値のどちらでも対応
    return result instanceof Promise ? await result : (result as T);
  }

  /**
   * すべてのバインディングをクリアする
   */
  clear(): void {
    this.bindings.clear();
    this.singletons.clear();
  }

  /**
   * 特定のバインディングを削除する
   */
  unbind(key: symbol): void {
    this.bindings.delete(key);
    this.singletons.delete(key);
  }
}

/**
 * グローバルコンテナインスタンス
 */
export const container = new Container();
