(async () => {
  const root = document.getElementById('asyncapi');
  try {
    const response = await fetch('../specs/asyncapi.yaml');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const schema = await response.text();
    AsyncApiStandalone.render({
      schema,
      config: {
        schemaID: 'labyrinth-game',
        show: { sidebar: true, messageExamples: true, errors: true },
        sendLabel: 'Server → Client',
        receiveLabel: 'Client → Server',
      },
    }, root);
  } catch (error) {
    root.replaceChildren();
    const message = document.createElement('p');
    message.className = 'loading';
    message.setAttribute('role', 'alert');
    message.textContent = `Die Dokumentation konnte nicht geladen werden: ${error.message}. Bitte lade die Seite neu oder nutze den YAML-Download.`;
    root.append(message);
  }
})();
