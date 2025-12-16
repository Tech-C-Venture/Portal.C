import path from 'path';
import { spawnSync } from 'child_process';

const projectRoot = path.resolve(__dirname, '..', '..');
const fixturesDir = path.join(projectRoot, '__tests__', 'fixtures', 'deps');

const runEslint = (file: string) =>
  spawnSync(
    'npx',
    [
      '--yes',
      'eslint',
      '--config',
      path.join(projectRoot, 'eslint.config.mjs'),
      file,
    ],
    { encoding: 'utf8' }
  );

describe('Layer dependency lint rules', () => {
  test('flags domain -> application dependency', () => {
    const result = runEslint(path.join(projectRoot, 'src/domain/__lint__/domain-bad.ts'));
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toContain('no-restricted-imports');
  });

  test('allows domain self imports', () => {
    const result = runEslint(path.join(projectRoot, 'src/domain/__lint__/domain-good.ts'));
    expect(result.status).toBe(0);
  });

  test('flags application -> infrastructure dependency', () => {
    const result = runEslint(path.join(projectRoot, 'src/application/__lint__/application-bad.ts'));
    expect(result.status).not.toBe(0);
  });

  test('flags presentation -> infrastructure dependency', () => {
    const result = runEslint(path.join(projectRoot, 'src/presentation/__lint__/presentation-bad.ts'));
    expect(result.status).not.toBe(0);
  });

  test('allows presentation to depend on application', () => {
    const result = runEslint(path.join(projectRoot, 'src/presentation/__lint__/presentation-good.ts'));
    expect(result.status).toBe(0);
  });
});
