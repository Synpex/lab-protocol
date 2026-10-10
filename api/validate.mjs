import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import SwaggerParser from '@apidevtools/swagger-parser';
import { Parser } from '@asyncapi/parser';
import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

async function load(name) {
  const document = YAML.parseDocument(await readFile(new URL(name, import.meta.url), 'utf8'), {
    uniqueKeys: true,
  });
  assert.equal(document.errors.length, 0, document.errors.map(String).join('\n'));
  return document.toJS();
}

// Keep specs portable: all references must resolve inside the same document.
function resolve(document, reference) {
  assert.ok(reference.startsWith('#/'), `External reference: ${reference}`);
  return reference.slice(2).split('/').reduce((node, part) => {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    assert.ok(node && Object.hasOwn(node, key), `Unresolved reference: ${reference}`);
    return node[key];
  }, document);
}
function checkReferences(document, node = document) {
  if (!node || typeof node !== 'object') return;
  if (node.$ref) resolve(document, node.$ref);
  for (const child of Object.values(node)) checkReferences(document, child);
}
function schemaValidator(document, Constructor, id) {
  const ajv = new Constructor({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema({ $id: id, components: document.components });
  return (schema, value, label, expected = true) => {
    const validate = ajv.compile({ $id: `${id}/example-${encodeURIComponent(label)}`, ...schema });
    // Resolve local schema references against the original contract.
    const valid = validate(value);
    assert.equal(valid, expected, `${label}: ${JSON.stringify(validate.errors)}`);
  };
}
// Local refs in a schema compiled separately must be absolute to the contract's schema resource.
function absoluteRefs(node, id) {
  if (Array.isArray(node)) return node.map(value => absoluteRefs(value, id));
  if (!node || typeof node !== 'object') return node;
  return Object.fromEntries(Object.entries(node).map(([key, value]) => [
    key, key === '$ref' ? id + value : absoluteRefs(value, id),
  ]));
}
function checker(document, Constructor, id) {
  const validate = schemaValidator(document, Constructor, id);
  return (schema, value, label, expected = true) => validate(
    absoluteRefs(schema, id), value, label, expected,
  );
}
function schema(name) { return { $ref: `#/components/schemas/${name}` }; }

const openapi = await load('openapi.yaml');
const asyncapi = await load('asyncapi.yaml');
checkReferences(openapi);
checkReferences(asyncapi);
await SwaggerParser.validate(structuredClone(openapi));
const { document, diagnostics } = await new Parser().parse(YAML.stringify(asyncapi));
const errors = diagnostics.filter(diagnostic => diagnostic.severity === 0);
assert.ok(document && errors.length === 0, JSON.stringify(errors, null, 2));

// Discovery stays public; each write declares the team API key and its actual errors.
assert.deepEqual(openapi.security, []);
assert.deepEqual(openapi.paths['/api/servers'].get.security, []);
assert.deepEqual(
  Object.fromEntries(['type', 'in', 'name'].map(key => [key, openapi.components.securitySchemes.GameServerApiKey[key]])),
  { type: 'apiKey', in: 'header', name: 'X-API-Key' },
);
for (const [path, method] of [
  ['/api/servers', 'post'], ['/api/servers/{id}/heartbeat', 'put'], ['/api/servers/{id}', 'delete'],
]) {
  const operation = openapi.paths[path][method];
  assert.deepEqual(operation.security, [{ GameServerApiKey: [] }]);
  assert.equal(operation.responses['401'].$ref, '#/components/responses/InvalidApiKey');
  if (method !== 'post') assert.equal(operation.responses['403'].$ref, '#/components/responses/ServerAccessDenied');
}

const checkRest = checker(openapi, Ajv2020, 'urn:lab:rest');
let restExamples = 0;
for (const [path, item] of Object.entries(openapi.paths)) {
  for (const method of ['get', 'post', 'put', 'delete']) {
    const operation = item[method];
    if (!operation) continue;
    const bodies = [operation.requestBody, ...Object.values(operation.responses)];
    for (let body of bodies) {
      if (!body) continue;
      if (body.$ref) body = resolve(openapi, body.$ref);
      for (const media of Object.values(body.content ?? {})) {
        const examples = Object.hasOwn(media, 'example') ? [media.example] : [];
        examples.push(...Object.values(media.examples ?? {}).map(example => example.value));
        for (const value of examples) {
          checkRest(media.schema, value, `${method} ${path} example ${++restExamples}`);
        }
      }
    }
  }
}

const checkGame = checker(asyncapi, Ajv, 'urn:lab:game');
// Error meanings must cover the enum completely; command links cannot invent codes.
const errorCode = asyncapi.components.schemas.ErrorCode;
assert.deepEqual(errorCode.oneOf.map(item => item.const).sort(), [...errorCode.enum].sort());
for (const item of errorCode.oneOf) assert.ok(item.description?.trim(), `Missing error meaning: ${item.const}`);
for (const operation of Object.values(asyncapi.operations)) {
  for (const code of operation['x-error-codes'] ?? []) {
    assert.equal(operation.action, 'receive');
    assert.ok(errorCode.enum.includes(code), `Unknown command error: ${code}`);
  }
}
let gameExamples = 0;
for (const [type, message] of Object.entries(asyncapi.components.messages)) {
  for (const example of message.examples) {
    checkGame(message.payload, example.payload, `${type} ${example.name}`);
    gameExamples++;
    if (type === 'GAME_STATE_UPDATE') {
      const { board, players, currentTurnInfo } = example.payload.data;
      assert.equal(board.tiles.length, board.rows);
      for (const row of board.tiles) assert.equal(row.length, board.cols);
      for (const position of [
        ...players.flatMap(player => [player.currentPosition, player.homePosition]),
        ...currentTurnInfo.reachablePositions,
      ]) {
        assert.ok(position.row < board.rows && position.column < board.cols);
      }
      assert.ok(players.some(player => player.playerId === currentTurnInfo.activePlayerId));
    }
  }
}
// Every physical-channel message is exposed by exactly one correctly directed operation.
const seen = new Set();
let received = 0, sent = 0;
for (const operation of Object.values(asyncapi.operations)) {
  assert.equal(operation.channel.$ref, '#/channels/game');
  for (const reference of operation.messages) {
    const channelMessage = resolve(asyncapi, reference.$ref);
    const message = resolve(asyncapi, channelMessage.$ref);
    const expected = message['x-delivery'] === 'client to server' ? 'receive' : 'send';
    assert.equal(operation.action, expected, message.name);
    assert.ok(!seen.has(message.name), `Duplicate operation: ${message.name}`);
    seen.add(message.name);
    expected === 'receive' ? received++ : sent++;
  }
}
assert.equal(seen.size, Object.keys(asyncapi.channels.game.messages).length);
assert.equal(received, 10);
assert.equal(sent, 17);

// Boundary and negative cases check the rules that cause interoperability mistakes.
const register = { name: 'Arena', host: 'localhost', port: 9000, maxPlayers: 4 };
checkRest(schema('RegisterServerRequest'), register, 'registration valid');
for (const [field, value] of [['name', '   '], ['port', -1], ['port', 65536], ['maxPlayers', 5]]) {
  checkRest(schema('RegisterServerRequest'), { ...register, [field]: value }, `registration invalid ${field} ${value}`, false);
}
const { maxPlayers, ...oldPdfRegistration } = register;
checkRest(schema('RegisterServerRequest'), oldPdfRegistration, 'old PDF registration lacks maxPlayers', false);
checkRest(schema('HeartbeatServerRequest'), { status: 'lobby', currentPlayers: 2, maxPlayers: 4 }, 'case-sensitive heartbeat status', false);
for (const value of [3, 5, 7, 9]) checkGame(schema('BoardDimension'), value, `odd board dimension ${value}`);
for (const value of [0, 1, 2, 4, 6]) checkGame(schema('BoardDimension'), value, `invalid board dimension ${value}`, false);
checkGame(schema('ConnectEnvelope'), { type: 'CONNECT', data: { username: 'Alice' } }, 'connect valid');
checkGame(schema('ConnectEnvelope'), { type: 'MOVE_FIGURE', data: { username: 'Alice' } }, 'wrong envelope type', false);
checkGame(schema('ConnectEnvelope'), { type: 'CONNECT' }, 'missing envelope data', false);
checkGame(schema('ConnectEnvelope'), { type: 'CONNECT', data: { username: '' } }, 'empty username', false);
checkGame(schema('UseBonusData'), { bonusType: 'BEAM', params: { targetPlayerId: 'p-102' } }, 'wrong bonus params', false);
checkGame(schema('UseBonusData'), { bonusType: 'PUSH_FIXED', params: { rowOrColIndex: 3, direction: 'DOWN' } }, 'fixed push must be even', false);
checkGame(schema('Tile'), { entrances: ['UP', 'RIGHT'], rotation: 0, treasure: { id: 4, name: 'Krone' }, bonus: 'BEAM', isFixed: false }, 'bonus and treasure cannot coexist', false);
checkGame(schema('Coordinates'), { row: -1, column: 0 }, 'negative coordinate', false);
checkGame(schema('UtcTimestamp'), '2026-09-15T20:00:00+02:00', 'timestamp must be UTC Z', false);
console.log(`OpenAPI valid: 4 operations, ${restExamples} examples.`);
console.log(`AsyncAPI valid: ${received} client commands, ${sent} server events, ${gameExamples} examples.`);
console.log('References, message directions, team-key security, full-state examples and boundary/negative cases passed.');
