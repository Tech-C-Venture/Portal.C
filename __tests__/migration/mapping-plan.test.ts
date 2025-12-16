import path from 'path';
import { planLayerMigration } from '@/tools/migration/apply-layer-mapping';

describe('Layer migration plan', () => {
  test('generates targets for legacy paths', () => {
    const projectRoot = path.resolve(__dirname, '..', '..');
    const plan = planLayerMigration(projectRoot, [
      'lib/auth.ts',
      'lib/utils.ts',
      'types/index.ts',
    ]);

    const targets = plan.reduce<Record<string, string | undefined>>((acc, curr) => {
      acc[curr.source] = curr.target;
      return acc;
    }, {});

    expect(targets['lib/auth.ts']).toBe('@/infrastructure/auth');
    expect(targets['lib/utils.ts']).toBe('@/application/common');
    expect(targets['types/index.ts']).toBe('@/domain');
  });
});
