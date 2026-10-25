(() => {
  const paths = {
    menu: 'M3 5h18M3 12h18M3 19h18',
    arrow: 'M5 12h14m-5-5 5 5-5 5',
    download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
    book: 'M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4zM12 6v16',
    rest: 'M4 7h16M4 17h16M7 4 4 7l3 3m10 4 3 3-3 3',
    socket: 'M9 3v5m6-5v5M6 8h12v5a6 6 0 0 1-12 0zm6 11v3',
    logo: 'M3 3h18v18H3V9h12v6H9m0-12v3m12 3h-3m-3 12v-3',
    link: 'M10 14 14 10m-7 3-2 2a4 4 0 0 0 6 6l3-3m-3-7 2-2a4 4 0 0 1 6 6l-2 2',
    chevron: 'm8 5 7 7-7 7',
  };
  const icon = name => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('class','icon'); svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS(svg.namespaceURI,'path'); path.setAttribute('d',paths[name] || paths.arrow); svg.append(path); return svg;
  };
  function indexBrand(prefix, current) {
    const section = document.createElement('div'); section.className = 'index-brand';
    const brand = document.createElement('a'); brand.className = 'docs-brand'; brand.href = prefix; brand.append(icon('logo'),document.createTextNode('Labyrinth'));
    const sub = document.createElement('span'); sub.className = 'brand-subtitle'; sub.textContent = 'Protokoll-Handbuch';
    const nav = document.createElement('nav'); nav.className = 'docs-primary-nav'; nav.setAttribute('aria-label','Dokumentation');
    for (const [name,label,url] of [['book','Übersicht',prefix],['rest','Verzeichnisserver',`${prefix}rest/`],['socket','Spielserver & Client',`${prefix}websocket/`]]) {
      const a = document.createElement('a'); a.href = url; a.append(icon(name),document.createTextNode(label)); if (name === current) a.setAttribute('aria-current','page'); nav.append(a);
    }
    section.append(brand,sub,nav); return section;
  }
  window.Docs = { icon, indexBrand };
  const prefix=document.querySelector('[data-prefix]')?.dataset.prefix ?? '../';
  for (const start of document.querySelectorAll('.toolbar-start')) { const brand=document.createElement('a'); brand.className='mobile-brand'; brand.href=prefix; brand.textContent='Labyrinth'; start.append(brand); }
  for (const slot of document.querySelectorAll('[data-brand]')) slot.replaceWith(indexBrand(slot.dataset.prefix,slot.dataset.brand));
  for (const slot of document.querySelectorAll('[data-icon]')) slot.replaceWith(icon(slot.dataset.icon));
  const shell = document.querySelector('.docs-shell');
  const toggle = document.querySelector('[data-index-toggle]');
  const index = document.getElementById('docs-index');
  if (!shell || !toggle || !index) return;
  let collapsed = matchMedia('(max-width: 760px)').matches;
  function render() { index.hidden = collapsed; shell.classList.toggle('index-collapsed',collapsed); toggle.setAttribute('aria-expanded',String(!collapsed)); const label=collapsed ? 'Index öffnen' : 'Index schließen'; toggle.querySelector('span').textContent=label; toggle.setAttribute('aria-label',label); }
  toggle.addEventListener('click',() => { collapsed = !collapsed; render(); if (!collapsed && matchMedia('(max-width: 760px)').matches) index.scrollIntoView({block:'start'}); });
  index.addEventListener('click',event => { if (matchMedia('(max-width: 760px)').matches && event.target.closest('a[href^="#"]')) { collapsed = true; render(); } });
  render();
})();
