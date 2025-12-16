/**
 * ドメインモジュールファクトリーパターン
 * 各ドメインごとの依存性を登録するファクトリー関数
 */

import { Container } from './container';

/**
 * モジュールファクトリー型定義
 */
export type ModuleFactory = (container: Container) => Container;

/**
 * 複数のモジュールを統合する
 */
export function composeModules(...modules: ModuleFactory[]): ModuleFactory {
  return (container: Container) => {
    return modules.reduce((c, module) => module(c), container);
  };
}

/**
 * モジュールを適用してコンテナを初期化する
 */
export function initializeContainer(
  container: Container,
  ...modules: ModuleFactory[]
): Container {
  return composeModules(...modules)(container);
}
