import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..', '..');

describe('Layer aliases', () => {
  test('four layer directories exist', () => {
    const layers = [
      'src/domain',
      'src/application',
      'src/infrastructure',
      'src/presentation',
    ];

    layers.forEach((layerPath) => {
      const fullPath = path.join(projectRoot, layerPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test('tsconfig paths align to layer boundaries', () => {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const paths = tsconfig.compilerOptions.paths;

    expect(paths['@/domain/*']).toEqual(['./src/domain/*']);
    expect(paths['@/application/*']).toEqual(['./src/application/*']);
    expect(paths['@/infrastructure/*']).toEqual(['./src/infrastructure/*']);
    expect(paths['@/presentation/*']).toEqual(['./src/presentation/*']);
  });

  test('path aliases resolve to concrete entrypoints', () => {
    expect(() => require('@/domain/index')).not.toThrow();
    expect(() => require('@/application/index')).not.toThrow();
    expect(() => require('@/infrastructure/index')).not.toThrow();
    expect(() => require('@/presentation/index')).not.toThrow();
  });
});
