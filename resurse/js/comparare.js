// comparare.js - Sistem comparare 2 produse (Bonus 20)
(function() {
  const KEY = 'tuning-comparare';
  const tray = document.getElementById('comparison-tray');
  const slot1 = document.getElementById('tray-slot-1');
  const slot2 = document.getElementById('tray-slot-2');
  const btnOpen = document.getElementById('btn-comparare');
  const btnReset = document.getElementById('btn-comparare-reset');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function render() {
    const arr = load();
    if (arr.length > 0) tray.classList.add('visible'); else tray.classList.remove('visible');

    [slot1, slot2].forEach((slot, i) => {
      slot.innerHTML = '';
      if (arr[i]) {
        const img = document.createElement('img');
        img.src = arr[i].imagine;
        img.alt = arr[i].nume;
        slot.appendChild(img);
        const btn = document.createElement('button');
        btn.className = 'remove-x';
        btn.innerHTML = '&times;';
        btn.setAttribute('data-testid', 'tray-remove-' + arr[i].id);
        btn.addEventListener('click', () => {
          const cur = load(); cur.splice(i, 1); save(cur); render();
        });
        slot.appendChild(btn);
      } else {
        const plus = document.createElement('i');
        plus.className = 'bi bi-plus-lg text-muted';
        slot.appendChild(plus);
      }
    });
  }

  document.querySelectorAll('.btn-comparare-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.produsId, 10);
      const nume = btn.dataset.produsNume;
      const imagine = btn.dataset.produsImagine;
      const cur = load();
      if (cur.some(x => x.id === id)) return;
      if (cur.length >= 2) { alert('Maxim 2 produse pot fi comparate. Elimină unul din tray.'); return; }
      cur.push({ id, nume, imagine });
      save(cur);
      render();
    });
  });

  btnOpen?.addEventListener('click', () => {
    const arr = load();
    if (arr.length !== 2) { alert('Selectează exact 2 produse pentru comparare.'); return; }
    const url = '/comparare?ids=' + arr.map(x => x.id).join(',');
    window.open(url, '_blank', 'width=1200,height=800');
  });

  btnReset?.addEventListener('click', () => {
    if (confirm('Golește lista de comparare?')) { save([]); render(); }
  });

  render();
})();
