import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const output = join(root, '_site');
const swagger = dirname(require.resolve('swagger-ui-dist/package.json'));
await rm(output, { recursive: true, force: true });
await cp(join(root, 'site'), output, { recursive: true });
await mkdir(join(output, 'specs'));
await mkdir(join(output, 'licenses'));
for (const file of ['openapi.yaml', 'asyncapi.yaml']) {
  await copyFile(join(root, file), join(output, 'specs', file));
}
// The custom message viewer consumes the same validated contract as the YAML download.
const game = YAML.parse(await readFile(join(root, 'asyncapi.yaml'), 'utf8'));
const gameJson = JSON.stringify(game);
const hash = content => createHash('sha256').update(content).digest('hex').slice(0, 12);
const gameFile = `game-contract.${hash(gameJson)}.json`;
await writeFile(join(output, 'specs', gameFile), gameJson);
const gamePage = join(output, 'websocket/index.html');
await writeFile(gamePage, (await readFile(gamePage, 'utf8')).replace('__GAME_CONTRACT_URL__', `../specs/${gameFile}`));
for (const [source, target] of [
  [join(swagger, 'swagger-ui-bundle.js'), 'assets/swagger-ui-bundle.js'],
  [join(swagger, 'swagger-ui.css'), 'assets/swagger-ui.css'],
  [join(swagger, 'LICENSE'), 'licenses/swagger-ui.txt'],
  [join(swagger, 'NOTICE'), 'licenses/swagger-ui-notice.txt'],
  [join(swagger, 'swagger-ui-bundle.js.LICENSE.txt'), 'assets/swagger-ui-bundle.js.LICENSE.txt'],
]) await copyFile(source, join(output, target));
// Revisioned asset URLs prevent a previously opened viewer from using stale JS/CSS after deployment.
for (const name of ['index.html', 'rest/index.html', 'websocket/index.html']) {
  const page = join(output, name);
  let html = await readFile(page, 'utf8');
  for (const match of html.matchAll(/(?:src|href)="((?:\.\.\/)?assets\/[^"?]+)"/g)) {
    const revision = hash(await readFile(join(dirname(page), match[1])));
    html = html.replace(`"${match[1]}"`, `"${match[1]}?v=${revision}"`);
  }
  await writeFile(page, html);
}
await writeFile(join(output, '.nojekyll'), '');
console.log(`Documentation built in ${output}`);
