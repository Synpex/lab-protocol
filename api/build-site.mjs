import { cp, copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const output = join(root, '_site');
const swagger = dirname(require.resolve('swagger-ui-dist/package.json'));
const asyncapi = dirname(require.resolve('@asyncapi/react-component/package.json'));
await rm(output, { recursive: true, force: true });
await cp(join(root, 'site'), output, { recursive: true });
await mkdir(join(output, 'specs'));
await mkdir(join(output, 'licenses'));
for (const file of ['openapi.yaml', 'asyncapi.yaml']) {
  await copyFile(join(root, file), join(output, 'specs', file));
}
for (const [source, target] of [
  [join(swagger, 'swagger-ui-bundle.js'), 'assets/swagger-ui-bundle.js'],
  [join(swagger, 'swagger-ui.css'), 'assets/swagger-ui.css'],
  [join(swagger, 'LICENSE'), 'licenses/swagger-ui.txt'],
  [join(swagger, 'NOTICE'), 'licenses/swagger-ui-notice.txt'],
  [join(swagger, 'swagger-ui-bundle.js.LICENSE.txt'), 'assets/swagger-ui-bundle.js.LICENSE.txt'],
  [join(asyncapi, 'browser/standalone/index.js'), 'assets/asyncapi.js'],
  [join(asyncapi, 'styles/default.min.css'), 'assets/asyncapi.css'],
  [join(asyncapi, 'LICENSE'), 'licenses/asyncapi-react.txt'],
  [join(asyncapi, 'browser/standalone/index.js.LICENSE.txt'), 'assets/asyncapi.js.LICENSE.txt'],
]) await copyFile(source, join(output, target));
await writeFile(join(output, '.nojekyll'), '');
console.log(`Documentation built in ${output}`);
