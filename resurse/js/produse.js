// produse.js - Filtrare/sortare on-change + fetch API (Bonus 4 + Bonus 10)
(function() {
  const form = document.getElementById('form-filtre');
  if (!form) return;

  const grid = document.getElementById('produse-grid');
  const contor = document.querySelector('[data-testid="contor-produse"]');

  // Update-range afisari
  form.querySelectorAll('input[type="range"]').forEach(r => {
    const target = document.getElementById(r.dataset.targetValue);
    r.addEventListener('input', () => { if (target) target.textContent = r.value; });
  });

  // Debounced onchange -> fetch server-side
  let timer;
  function doFetch() {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v == null || v === '') continue;
      params.append(k, v);
    }
    params.set('pagina', '1');
    fetch('/catalog-json?' + params.toString())
      .then(r => r.json())
      .then(data => {
        if (contor) contor.textContent = data.total;
        renderProduse(data.produse);
      })
      .catch(err => console.error('fetch produse:', err));
  }
  function scheduleFetch() { clearTimeout(timer); timer = setTimeout(doFetch, 300); }

  form.querySelectorAll('[data-onchange-filter]').forEach(el => {
    el.addEventListener('change', scheduleFetch);
    if (el.type === 'text' || el.tagName === 'TEXTAREA') el.addEventListener('input', scheduleFetch);
    if (el.type === 'range') el.addEventListener('input', scheduleFetch);
  });

  // Reset button (cu confirm)
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (!confirm('Resetează toate filtrele?')) return;
    window.location.href = '/produse';
  });

  // Calculate button (div fix 2s)
  document.getElementById('btn-calculeaza')?.addEventListener('click', () => {
    const div = document.getElementById('div-calcul-rezultat');
    const cards = grid.querySelectorAll('.product-card:not([style*="display: none"])');
    let suma = 0; let nr = 0; let hp = 0;
    cards.forEach(c => {
      const priceEl = c.querySelector('.card-price');
      if (!priceEl) return;
      const txt = priceEl.textContent.replace(/[^0-9.]/g, ' ').trim();
      const last = txt.split(/\s+/).pop();
      const v = parseFloat(last); if (!isNaN(v)) suma += v;
      const meta = c.querySelector('.card-meta');
      if (meta) { const m = meta.textContent.match(/\+(\d+)\s*CP/); if (m) hp += parseInt(m[1], 10); }
      nr++;
    });
    div.classList.remove('d-none');
    div.innerHTML = `<strong>${nr}</strong> produse afișate · Total: <strong>${suma.toFixed(2)} RON</strong> · CP total: <strong>+${hp}</strong>`;
    setTimeout(() => div.classList.add('d-none'), 2000);
  });

  // Render helper (client-side)
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function renderProduse(list) {
    if (!list || !list.length) {
      grid.innerHTML = `<div class="alert alert-info text-center" data-testid="msg-fara-produse">
        <i class="bi bi-emoji-frown" style="font-size: 2rem;"></i>
        <h4 class="mt-2">Nu există produse care să corespundă filtrelor.</h4>
      </div>`;
      return;
    }
    const cards = list.map(p => cardHTML(p)).join('');
    grid.innerHTML = `<div class="row g-4">${cards}</div>`;
    // reattach handlers pe carduri noi (comparare + sesiune)
    document.dispatchEvent(new Event('produse-rerender'));
    // Reruleaza scripturile care isi ataseaza handleri
    rerunFeatureScripts();
  }
  function cardHTML(p) {
    const oferta = p._oferta;
    const nou = p._este_nou ? '<span class="badge-tuning badge-nou" data-testid="badge-nou-'+p.id+'">NOU</span>' : '';
    const cheap = p._cheapest ? '<span class="badge-tuning badge-cheapest">CEL MAI IEFTIN</span>' : '';
    const ofertaBadge = oferta ? '<span class="badge-tuning badge-oferta">-'+oferta.discount+'%</span>' : '';
    const oldPrice = oferta ? `<span class="old">${Number(p._pret_vechi).toFixed(2)} RON</span>` : '';
    const timerEl = oferta ? `<span class="oferta-timer ms-2" data-expira="${oferta.expira_la}">00:00:00</span>` : '';
    return `<div class="col-md-6 col-xl-4"><div class="product-card card reveal" data-produs-id="${p.id}" data-testid="product-card-${p.id}">
      <div class="card-media">
        <img src="${esc(p.imagine)}" alt="${esc(p.nume)}" loading="lazy">
        <div class="badges-wrap">
          <div class="d-flex gap-1 flex-column align-items-start">${nou}${cheap}</div>
          ${ofertaBadge}
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="/produs/${p.id}" style="color:inherit; text-decoration:none;">${esc(p.nume)}</a></h3>
        <div class="card-meta">
          <span><i class="bi bi-tag-fill"></i> ${esc(p.categorie)}</span>
          <span><i class="bi bi-hexagon-fill"></i> ${esc(p.material)}</span>
          ${p.putere_castigata_hp > 0 ? '<span style="color:var(--tuning-secondary);"><i class="bi bi-lightning-charge-fill"></i> +'+p.putere_castigata_hp+' CP</span>' : ''}
        </div>
        <div class="card-price">${oldPrice} ${Number(p._pret_afisat).toFixed(2)} RON ${timerEl}</div>
        <div class="d-flex gap-2 mt-2 flex-wrap">
          <a href="/produs/${p.id}" class="btn btn-sm btn-tuning" data-testid="product-view-${p.id}"><span>Detalii</span></a>
          <button class="btn btn-sm btn-outline-light btn-comparare-add" data-produs-id="${p.id}"
                  data-produs-nume="${esc(p.nume)}" data-produs-imagine="${esc(p.imagine)}"
                  data-testid="btn-comparare-add-${p.id}" title="Adaugă la comparare">
            <i class="bi bi-columns-gap"></i>
          </button>
        </div>
      </div>
    </div></div>`;
  }

  function rerunFeatureScripts() {
    // Trimit evenimente ca comparare.js / oferte.js sa reatașeze
    // Cea mai simpla solutie: reload scripturile (comparare + oferte + sesiune)
    ['/resurse/js/comparare.js', '/resurse/js/oferte.js', '/resurse/js/produs-sesiune.js'].forEach(src => {
      const s = document.createElement('script');
      s.src = src + '?t=' + Date.now();
      document.body.appendChild(s);
    });
  }
})();
