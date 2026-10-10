(async () => {
  const root = document.getElementById('asyncapi');
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  try {
    const response = await fetch(root.dataset.contractUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contract = await response.json();
    const resolve = ref => ref.slice(2).split('/').reduce((node, key) => node[key.replace(/~1/g, '/').replace(/~0/g, '~')], contract);
    const directions = {
      receive: { label: 'Client → Server', short: 'C → S', heading: 'Client-Befehle', style: 'client' },
      send: { label: 'Server → Client', short: 'S → C', heading: 'Server-Ereignisse', style: 'server' },
    };
    const operations = Object.values(contract.operations).flatMap(operation => operation.messages.map(ref => ({
      operation, message: resolve(resolve(ref.$ref).$ref), direction: directions[operation.action], channel: resolve(operation.channel.$ref),
    })));
    const anchor = entry => `message-${entry.message.name.toLowerCase()}`;
    // Expand references into a bounded field tree. Render source strings as text, never HTML.
    function schemaTree(input, name = 'Nachricht', required = false, depth = 0, ancestors = []) {
      const schema = input.$ref ? { ...resolve(input.$ref), ...input, $ref: undefined } : input;
      const node = el('div', 'schema-field'), heading = el('div', 'schema-field-heading');
      const type = schema.type ?? (schema.oneOf ? 'oneOf' : schema.anyOf ? 'anyOf' : schema.allOf ? 'allOf' : 'object');
      heading.append(el('code', 'field-name', name), el('span', 'field-type', Array.isArray(type) ? type.join(' | ') : type));
      if (required) heading.append(el('span', 'field-required', 'Pflicht'));
      if (input.$ref) heading.append(el('span', 'field-reference', input.$ref.split('/').at(-1)));
      node.append(heading);
      if (schema.description) node.append(el('p', 'field-description', schema.description));
      const constraints = [];
      if (Object.hasOwn(schema, 'const')) constraints.push(`Wert: ${JSON.stringify(schema.const)}`);
      if (schema.enum) constraints.push(`Werte: ${schema.enum.map(value => JSON.stringify(value)).join(', ')}`);
      for (const [key, label] of Object.entries({ minimum: 'Minimum', maximum: 'Maximum', minLength: 'Mindestlänge', maxLength: 'Maximallänge', minItems: 'Min. Elemente', maxItems: 'Max. Elemente', multipleOf: 'Vielfaches von', pattern: 'Muster', format: 'Format', additionalProperties: 'Zusätzliche Felder' })) {
        if (Object.hasOwn(schema, key)) constraints.push(`${label}: ${JSON.stringify(schema[key])}`);
      }
      if (constraints.length) node.append(el('p', 'field-constraints', constraints.join(' · ')));
      const children = Object.entries(schema.properties ?? {}).map(([key, value]) => [value, key, (schema.required ?? []).includes(key)]);
      if (schema.items) children.push([schema.items, 'items', false]);
      for (const keyword of ['oneOf', 'anyOf', 'allOf']) for (const [index, value] of (schema[keyword] ?? []).entries()) children.push([value, `${keyword} · Variante ${index + 1}`, false]);
      if (schema.not) children.push([schema.not, 'Ausgeschlossen (not)', false]);
      if (!schema.properties && schema.required) node.append(el('p', 'field-constraints', `Erforderlich: ${schema.required.join(', ')}`));
      if (children.length && depth < 12 && (!input.$ref || !ancestors.includes(input.$ref))) {
        const details = el('details', 'schema-children'); details.open = depth < 2;
        details.append(el('summary', '', `${children.length} Felder / Varianten`));
        const next = input.$ref ? [...ancestors, input.$ref] : ancestors;
        for (const [value, key, mandatory] of children) details.append(schemaTree(value, key, mandatory, depth + 1, next));
        node.append(details);
      }
      return node;
    }
    root.replaceChildren();
    const layout = el('div', 'ws-layout'), sidebar = el('aside', 'ws-sidebar'); sidebar.setAttribute('aria-label', 'Nachrichtennavigation');
    const navigation = el('details', 'ws-navigation'); navigation.open = !matchMedia('(max-width: 900px)').matches;
    navigation.append(el('summary', 'navigation-toggle', 'Nachrichtenübersicht'));
    const searchLabel = el('label', 'search-label', 'Nachrichten suchen'), search = el('input', 'message-search');
    search.type = 'search'; search.placeholder = 'z. B. CONNECT oder Schatz'; search.id = 'message-search'; searchLabel.htmlFor = search.id;
    const nav = el('nav', 'message-nav'); nav.setAttribute('aria-label', 'WebSocket-Nachrichten');
    const searchStatus = el('p', 'search-status'); searchStatus.setAttribute('role', 'status');
    navigation.append(searchLabel, search, searchStatus, nav); sidebar.append(navigation);
    const content = el('div', 'ws-content'), intro = el('section', 'ws-intro'), title = el('h1', '', 'Spielserver & Client');
    title.append(el('span', 'contract-version', contract.info.version), el('span', 'contract-format', `AsyncAPI ${contract.asyncapi}`));
    intro.append(title, el('p', 'ws-intro-text', `${operations.length} klar getrennte Nachrichten über eine WebSocket-Verbindung. Öffne einen Eintrag für Ablauf, JSON-Beispiele und das vollständige Nachrichtenschema.`));
    const server = resolve(operations[0].channel.servers[0].$ref);
    const endpoint = el('div', 'ws-endpoint'); endpoint.append(el('span', 'endpoint-badge', 'WEBSOCKET'), el('code', '', `${server.protocol}://${server.host}${operations[0].channel.address}`), el('span', '', 'host und port aus der öffentlichen Serverliste'));
    const source = el('details', 'ws-source');
    source.append(el('summary', '', 'Quellen und Vertragsstand'), el('p', 'ws-source-note', contract.info.description));
    const sourceLink = el('a', '', 'Begleitdokumentation und offene Abstimmungen ↗');
    sourceLink.href = 'https://github.com/Synpex/lab-protocol/blob/main/api/README.md'; source.append(sourceLink);
    intro.append(endpoint, source); content.append(intro);
    const rows = new Map(), links = new Map(), groups = [];
    function select(entry, scroll = false) {
      for (const [name, row] of rows) row.open = name === entry.message.name;
      for (const [name, link] of links) {
        if (name === entry.message.name) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      if (scroll) rows.get(entry.message.name).scrollIntoView({ block: 'start' });
    }
    for (const [action, direction] of Object.entries(directions)) {
      const entries = operations.filter(entry => entry.operation.action === action), navGroup = el('section', 'nav-group');
      navGroup.append(el('h2', '', `${direction.heading} · ${entries.length}`));
      const group = el('section', 'operation-group'); group.dataset.direction = action;
      const groupHeading = el('h2', 'group-heading', direction.heading); groupHeading.append(el('span', 'group-count', `${entries.length} Nachrichten`)); group.append(groupHeading);
      groups.push({ group, navGroup, entries });
      for (const entry of entries) {
        const { message, operation } = entry, rowId = anchor(entry);
        const link = el('a', `message-nav-link ${direction.style}`); link.href = `#${rowId}`;
        link.append(el('span', 'nav-direction', direction.short), el('code', '', message.name)); link.title = operation.summary;
        link.addEventListener('click', event => { event.preventDefault(); history.pushState(null, '', `#${rowId}`); select(entry, true); });
        navGroup.append(link); links.set(message.name, link);
        const row = el('details', `message-operation ${direction.style}`); row.id = rowId;
        const summary = el('summary', 'operation-summary'); summary.append(el('span', 'direction-badge', direction.label), el('code', 'message-name', message.name), el('span', 'operation-title', operation.summary), el('span', 'operation-chevron', '⌄')); row.append(summary);
        const body = el('div', 'operation-body'), meta = el('div', 'operation-meta');
        meta.append(el('code', '', entry.channel.address), el('span', '', message.contentType ?? contract.defaultContentType));
        const delivery = { unicast: 'Unicast · privat', broadcast: 'Broadcast', 'broadcast and unicast on reconnect': 'Broadcast · beim Reconnect Unicast', 'client to server': 'Client-Befehl' }[message['x-delivery']] ?? message['x-delivery'];
        if (delivery) meta.append(el('span', 'delivery-label', delivery));
        body.append(meta, el('p', 'operation-description', operation.description ?? message.description ?? ''));
        const tabs = el('div', 'message-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', `${message.name}: Beispiel oder Schema`);
        const exampleTab = el('button', 'message-tab', 'Example Value'), schemaTab = el('button', 'message-tab', 'Schema');
        const examplePanel = el('section', 'message-panel example-panel'), schemaPanel = el('section', 'message-panel schema-panel');
        for (const [button, panel, suffix] of [[exampleTab, examplePanel, 'example'], [schemaTab, schemaPanel, 'schema']]) {
          button.type = 'button'; button.id = `${rowId}-${suffix}-tab`; button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', `${rowId}-${suffix}`);
          panel.id = `${rowId}-${suffix}`; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id);
        }
        function showPanel(example) {
          examplePanel.hidden = !example; schemaPanel.hidden = example;
          exampleTab.setAttribute('aria-selected', String(example)); schemaTab.setAttribute('aria-selected', String(!example));
          exampleTab.tabIndex = example ? 0 : -1; schemaTab.tabIndex = example ? -1 : 0;
        }
        exampleTab.addEventListener('click', () => showPanel(true)); schemaTab.addEventListener('click', () => showPanel(false));
        tabs.addEventListener('keydown', event => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault(); const example = event.key === 'Home' || event.key === 'ArrowLeft'; showPanel(example); (example ? exampleTab : schemaTab).focus();
          }
        });
        tabs.append(exampleTab, schemaTab);
        const toolbar = el('div', 'example-toolbar'), exampleSelect = el('select', 'example-select'); exampleSelect.setAttribute('aria-label', `${message.name}: Beispiel auswählen`);
        message.examples.forEach((example, index) => { const option = el('option', '', example.summary ?? example.name); option.value = String(index); exampleSelect.append(option); });
        const copy = el('button', 'copy-example', 'JSON kopieren'); copy.type = 'button'; copy.setAttribute('aria-label', `${message.name}: JSON kopieren`);
        const copyStatus = el('span', 'copy-status'); copyStatus.setAttribute('role', 'status');
        const code = el('code'), pre = el('pre', 'example-code'); pre.append(code); pre.tabIndex = 0;
        const updateExample = () => { code.textContent = JSON.stringify(message.examples[Number(exampleSelect.value)].payload, null, 2); copyStatus.textContent = ''; };
        exampleSelect.addEventListener('change', updateExample); updateExample();
        copy.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(code.textContent); copyStatus.textContent = 'Kopiert'; }
          catch { copyStatus.textContent = 'Bitte JSON im Beispiel markieren und kopieren.'; }
        });
        toolbar.append(exampleSelect, copy); examplePanel.append(toolbar, pre, copyStatus); schemaPanel.append(schemaTree(message.payload)); showPanel(true);
        body.append(tabs, examplePanel, schemaPanel); row.append(body); group.append(row); rows.set(message.name, row);
        summary.addEventListener('click', event => {
          event.preventDefault();
          if (row.open) { row.open = false; links.get(message.name).removeAttribute('aria-current'); }
          else { history.replaceState(null, '', `#${rowId}`); select(entry); }
        });
      }
      nav.append(navGroup); content.append(group);
    }
    const empty = el('p', 'empty-results', 'Keine Nachricht gefunden. Versuche einen anderen Suchbegriff.'); empty.hidden = true; content.append(empty);
    search.addEventListener('input', () => {
      const term = search.value.trim().toLocaleLowerCase('de'); let matches = 0;
      for (const entry of operations) {
        const visible = `${entry.message.name} ${entry.operation.summary} ${entry.operation.description} ${entry.direction.label}`.toLocaleLowerCase('de').includes(term);
        rows.get(entry.message.name).hidden = !visible; links.get(entry.message.name).hidden = !visible; if (visible) matches++;
      }
      for (const { group, navGroup, entries } of groups) { const hidden = entries.every(entry => rows.get(entry.message.name).hidden); group.hidden = hidden; navGroup.hidden = hidden; }
      searchStatus.textContent = `${matches} von ${operations.length} Nachrichten`; empty.hidden = matches !== 0;
    });
    searchStatus.textContent = `${operations.length} Nachrichten · ${operations.filter(entry => entry.operation.action === 'receive').length} Befehle / ${operations.filter(entry => entry.operation.action === 'send').length} Ereignisse`;
    layout.append(sidebar, content); root.append(layout);
    function fromHash(scroll) {
      const entry = operations.find(item => `#${anchor(item)}` === location.hash);
      if (entry) { search.value = ''; search.dispatchEvent(new Event('input')); select(entry, scroll); }
      else if (!location.hash) select(operations[0], false);
    }
    window.addEventListener('hashchange', () => fromHash(true)); fromHash(Boolean(location.hash));
  } catch (error) {
    root.replaceChildren();
    const message = el('p', 'loading', `Die Dokumentation konnte nicht geladen werden: ${error.message}. Bitte lade die Seite neu oder nutze den YAML-Download.`);
    message.setAttribute('role', 'alert'); root.append(message);
  }
})();
