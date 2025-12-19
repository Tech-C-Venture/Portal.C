import path from 'path';
import { spawnSync } from 'child_process';

const projectRoot = path.resolve(__dirname, '..', '..');
const runEslint = (code: string, virtualPath: string) =>
  spawnSync(
    'npx',
    [
      '--yes',
      'eslint',
      '--no-ignore',
      '--config',
      path.join(projectRoot, 'eslint.config.mjs'),
      '--stdin',
      '--stdin-filename',
      virtualPath,
    ],
    { encoding: 'utf8', input: code, shell: true }
  );

describe('Layer dependency lint rules', () => {
  test('flags domain -> application dependency', () => {
    const result = runEslint(
      `import { GetMemberProfileUseCase } from '@/application/use-cases';
       export const x = new GetMemberProfileUseCase({} as any);`,
      'src/domain/example.ts'
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('Domain layer cannot import');
  });

  test('allows domain self imports', () => {
    const result = runEslint(
      `import { Email } from '@/domain/value-objects/Email';
       export const mail = Email.create('a@example.ed.jp');`,
      'src/domain/example.ts'
    );
    expect(result.status).toBe(0);
  });

  test('flags application -> infrastructure dependency', () => {
    const result = runEslint(
      `import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
       export const client = DatabaseClient;`,
      'src/application/example.ts'
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('Application layer cannot import');
  });

  test('flags presentation -> infrastructure dependency', () => {
    const result = runEslint(
      `import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
       export const client = DatabaseClient;`,
      'app/example.tsx'
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('Presentation layer cannot import');
  });

  test('allows presentation to depend on application', () => {
    const result = runEslint(
      `import { MemberList } from '@/components/members/MemberList';
       import { GetMemberProfileUseCase } from '@/application/use-cases';
       export const list = MemberList;
       export const usecase = GetMemberProfileUseCase;`,
      'app/example.tsx'
    );
    expect(result.status).toBe(0);
  });
});
