import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(resolve(root, 'index.html'), 'utf8');

const stylesheetPattern = /<link rel="stylesheet" href="([^"]+)">/g;
for (const match of [...html.matchAll(stylesheetPattern)]) {
    let css = await readFile(resolve(root, match[1]), 'utf8');
    const cssDirectory = dirname(resolve(root, match[1]));
    for (const urlMatch of [...css.matchAll(/url\((?:"|')?([^)'"?]+)(?:"|')?\)/g)]) {
        if (/^(data:|https?:|\/)/.test(urlMatch[1])) continue;
        const asset = await readFile(resolve(cssDirectory, urlMatch[1]));
        const mime = urlMatch[1].endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
        css = css.replace(urlMatch[0], `url(data:${mime};base64,${asset.toString('base64')})`);
    }
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
}

const scriptPattern = /<script src="([^"]+)"><\/script>/g;
for (const match of [...html.matchAll(scriptPattern)]) {
    const script = await readFile(resolve(root, match[1]), 'utf8');
    html = html.replace(match[0], () => `<script>\n${script.replaceAll('</script>', '<\\/script>')}\n</script>`);
}

const logo = await readFile(resolve(root, 'img/logo.png'));
const logoUrl = `data:image/png;base64,${logo.toString('base64')}`;
html = html.replaceAll('img/logo.png', logoUrl);

await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/index.html'), html);
console.log('Built dist/index.html');
