// back-to-top.js - buton floating (pentru #link-top si .back-to-top)
(function() {
  const btn = document.getElementById('link-top') || document.getElementById('back-to-top');
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', (e) => {
    // Daca e ancora #top, lasa comportamentul default (smooth scroll via CSS)
    if (btn.getAttribute('href') === '#top') return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
