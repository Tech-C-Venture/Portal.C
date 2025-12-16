import fs from 'fs';
import path from 'path';
import { loadLayerMapping, resolveLayerTarget } from './layer-mapping';

export interface MigrationPlan {
  source: string;
  target?: string;
}

/**
 * 旧パス→新レイヤーエイリアスの変換計画を生成する（dry-run想定）
 */
export function planLayerMigration(
  projectRoot: string,
  entries: string[],
  mappingFile = 'layer-mapping.json'
): MigrationPlan[] {
  const mapping = loadLayerMapping(projectRoot, mappingFile);
  return entries.map((entry) => ({
    source: entry,
    target: resolveLayerTarget(mapping, entry),
  }));
}

if (require.main === module) {
  const projectRoot = process.cwd();
  const entriesPath = path.join(projectRoot, 'tools', 'migration', 'layer-mapping.json');
  if (!fs.existsSync(entriesPath)) {
    console.error('Mapping file not found', entriesPath);
    process.exit(1);
  }

  const mapping = loadLayerMapping(projectRoot);
  const plans = Object.keys(mapping).map((key) => ({
    source: key,
    target: mapping[key],
  }));

  console.log('=== Layer migration plan (dry run) ===');
  plans.forEach((plan) => {
    console.log(`${plan.source} -> ${plan.target}`);
  });
}
