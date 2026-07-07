// back-to-top.js - buton floating ca in referinta
(function() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
