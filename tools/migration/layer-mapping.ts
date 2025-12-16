import fs from 'fs';
import path from 'path';

export type LayerMapping = Record<string, string>;

const DEFAULT_MAPPING_FILENAME = 'layer-mapping.json';

const normalizeSourcePath = (sourcePath: string) =>
  sourcePath.replace(/^\.\//, '');

export const loadLayerMapping = (
  projectRoot = process.cwd(),
  filename = DEFAULT_MAPPING_FILENAME,
): LayerMapping => {
  const mappingPath = path.join(
    projectRoot,
    'tools',
    'migration',
    filename,
  );

  if (!fs.existsSync(mappingPath)) {
    throw new Error(`Mapping file not found: ${mappingPath}`);
  }

  const raw = fs.readFileSync(mappingPath, 'utf8');
  return JSON.parse(raw) as LayerMapping;
};

export const resolveLayerTarget = (
  mapping: LayerMapping,
  sourcePath: string,
): string | undefined => {
  const normalized = normalizeSourcePath(sourcePath);
  return mapping[normalized];
};

export const listUnmapped = (
  entries: string[],
  mapping: LayerMapping,
): string[] => {
  return entries
    .map(normalizeSourcePath)
    .filter((entry) => !mapping[entry]);
};
