import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, '_site');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const path of ['index.html', 'styles', 'scripts', 'img', 'vendor']) {
    await cp(resolve(root, path), resolve(output, path), { recursive: true });
}

await writeFile(resolve(output, '.nojekyll'), '');
console.log('Built _site/');
