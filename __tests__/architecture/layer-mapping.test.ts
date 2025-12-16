import path from 'path';

import { loadLayerMapping, resolveLayerTarget } from '../../tools/migration/layer-mapping';

const projectRoot = path.resolve(__dirname, '..', '..');

describe('Layer migration mapping', () => {
  const mapping = loadLayerMapping(projectRoot);

  test('covers legacy lib and types entries', () => {
    expect(mapping['lib/auth.ts']).toBeDefined();
    expect(mapping['lib/auth-options.ts']).toBeDefined();
    expect(mapping['lib/utils.ts']).toBeDefined();
    expect(mapping['types/index.ts']).toBeDefined();
    expect(mapping['types/database.types.ts']).toBeDefined();
  });

  test('resolves targets to layer aliases', () => {
    expect(resolveLayerTarget(mapping, 'lib/auth.ts')).toBe('@/infrastructure/auth');
    expect(resolveLayerTarget(mapping, 'lib/auth-options.ts')).toBe('@/infrastructure/auth');
    expect(resolveLayerTarget(mapping, 'lib/utils.ts')).toBe('@/application/common');
    expect(resolveLayerTarget(mapping, 'types/index.ts')).toBe('@/domain');
    expect(resolveLayerTarget(mapping, 'types/database.types.ts')).toBe('@/infrastructure/database');
  });
});
