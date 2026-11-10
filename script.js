// Anno nel footer
document.getElementById('y').textContent = new Date().getFullYear();

// Header: stato allo scroll + menu mobile
const header = document.querySelector('header.site');
const toggle = document.querySelector('.menu-toggle');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
toggle.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Comparsa delle sezioni allo scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Rete neurale animata nello sfondo dell'hero
(() => {
  const canvas = document.getElementById('net');
  if (!canvas) return; // pagine senza hero (es. privacy)
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, nodes = [], mouse = { x: -9999, y: -9999 }, raf;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, (w * h) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.6 + .8
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const max = 140;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) {
          ctx.strokeStyle = `rgba(46,134,171,${(1 - d / max) * .22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(79,166,201,${(1 - md / 180) * .5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(46,134,171,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  // Pausa quando l'hero non è visibile
  new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) draw();
  }).observe(hero);

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { resize(); if (reduce) draw(); }, 150); });
  resize();
})();

// Ricorda la lingua scelta manualmente dal visitatore
// e, cambiando lingua, resta nella stessa sezione della pagina
document.querySelectorAll('[data-lang]').forEach(a => a.addEventListener('click', () => {
  try { localStorage.setItem('tm-lang', a.dataset.lang); } catch (e) {}
  if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash;
}));
