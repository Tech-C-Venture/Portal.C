/**
 * DIコンテナのセットアップ
 */

import { container, initializeContainer } from './index';
import { memberModule } from './modules/memberModule';
import { eventModule } from './modules/eventModule';
import { timetableModule } from './modules/timetableModule';

/**
 * アプリケーション起動時に依存性を登録
 */
export function setupDependencies() {
  initializeContainer(container, memberModule, eventModule, timetableModule);
}

// 自動セットアップ
setupDependencies();

export { container };
