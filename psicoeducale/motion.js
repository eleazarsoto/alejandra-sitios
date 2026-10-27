/* Motor de movimiento · Alejandra García Franco · Oráculo Analytics */
(function () {
  'use strict';
  window.__motion = true;
  var d = document, r = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var todos = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Dividir texto en palabras ---------- */
  function dividir(el, clase, interior) {
    var idx = 0;
    (function recorre(nodo) {
      [].slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span'); w.className = clase;
            if (interior) {
              var i = d.createElement('span'); i.className = interior; i.textContent = p;
              i.style.setProperty('--i', idx); w.appendChild(i);
            } else { w.textContent = p; w.style.setProperty('--i', idx); }
            idx++; frag.appendChild(w);
          });
          nodo.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') recorre(n);
      });
    })(el);
    return idx;
  }
  todos('[data-split]').forEach(function (el) { dividir(el, 'w', 'wi'); });
  var ilumina = todos('[data-ilumina]').map(function (el) {
    dividir(el, 'wl'); return { el: el, palabras: todos('.wl', el) };
  });
  todos('[data-escalonado]').forEach(function (el) {
    [].slice.call(el.children).forEach(function (c, k) { c.style.setProperty('--k', k); });
  });

  /* ---------- Contadores ---------- */
  function contar(el) {
    var fin = parseFloat(el.getAttribute('data-count'));
    if (reduce) { el.textContent = fin; return; }
    var t0 = null, dur = 1900;
    (function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(fin * e);
      if (p < 1) requestAnimationFrame(paso);
    })(performance.now());
  }

  /* ---------- Aparición al entrar en pantalla ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.__hijos) e.target.__hijos.forEach(function (h) { h.classList.add('visible'); });
      if (!e.target.__soloPadre) e.target.classList.add('visible');
      if (e.target.hasAttribute('data-count')) contar(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' }) : null;

  function arrancar() {
    r.classList.add('listo');
    todos('.revelar,[data-split],[data-reveal],[data-count],[data-escalonado]').forEach(function (el) {
      if (io && !reduce) {
        if (el.hasAttribute('data-count')) el.textContent = '0';
        if (el.getAttribute('data-reveal') === 'clip' && el.parentElement) {
          /* clip-path oculta el elemento al observador: se observa a su contenedor */
          var pa = el.parentElement;
          (pa.__hijos = pa.__hijos || []).push(el);
          if (!pa.matches('.revelar,[data-split],[data-reveal],[data-count],[data-escalonado]')) pa.__soloPadre = true;
          io.observe(pa);
          return;
        }
        io.observe(el);
      } else el.classList.add('visible');
    });
    if (reduce) ilumina.forEach(function (o) { o.palabras.forEach(function (w) { w.classList.add('on'); }); });
    alScroll();
  }

  /* ---------- Scroll: barra, progreso, parallax, dibujos, texto que se ilumina, pila ---------- */
  var barra = d.querySelector('.barra'), prog = d.querySelector('.progreso'), wa = d.querySelector('.wa-flotante');
  var parallax = todos('[data-parallax]'), dibuja = todos('[data-dibuja]');
  var zonasScroll = todos('[data-scroll-zona]'), pila = todos('.pila > *');
  var ultimoY = window.scrollY, pendiente = false;

  function alScroll() {
    var y = window.scrollY, vh = window.innerHeight, max = r.scrollHeight - vh;
    if (prog) prog.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (barra) {
      barra.classList.toggle('con-linea', y > 12);
      if (!d.querySelector('.sitios.abierto')) {
        if (y > ultimoY + 6 && y > 240) barra.classList.add('oculta');
        else if (y < ultimoY - 6 || y < 240) barra.classList.remove('oculta');
      }
    }
    ultimoY = y;
    if (wa) {
      var con = d.getElementById('contacto'), enContacto = false;
      if (con) { var rc = con.getBoundingClientRect(); enContacto = rc.top < innerHeight * .6 && rc.bottom > 0; }
      wa.classList.toggle('ver', y > 420 && !enContacto);
    }
    if (reduce) return;
    zonasScroll.forEach(function (z) { z.style.setProperty('--sy', Math.min(y, vh * 1.4).toFixed(1)); });
    parallax.forEach(function (el) {
      var rc = el.getBoundingClientRect();
      if (rc.bottom < -300 || rc.top > vh + 300) return;
      var c = rc.top + rc.height / 2 - vh / 2;
      el.style.setProperty('--py', (-c * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px');
    });
    dibuja.forEach(function (el) {
      var rc = el.getBoundingClientRect();
      el.style.setProperty('--p', clamp((vh * 0.7 - rc.top) / rc.height, 0, 1).toFixed(3));
    });
    ilumina.forEach(function (o) {
      var rc = o.el.getBoundingClientRect();
      var p = clamp((vh * 0.82 - rc.top) / (rc.height + vh * 0.3), 0, 1);
      var k = Math.round(p * o.palabras.length * 1.12);
      for (var i = 0; i < o.palabras.length; i++) o.palabras[i].classList.toggle('on', i < k);
    });
    for (var i = 0; i < pila.length - 1; i++) {
      var a = pila[i].getBoundingClientRect(), b = pila[i + 1].getBoundingClientRect();
      pila[i].style.setProperty('--cubre', clamp((a.bottom - b.top) / a.height, 0, 1).toFixed(3));
    }
  }
  addEventListener('scroll', function () {
    if (pendiente) return; pendiente = true;
    requestAnimationFrame(function () { pendiente = false; alScroll(); });
  }, { passive: true });
  addEventListener('resize', alScroll);

  /* ---------- Movimiento con el cursor (solo escritorio) ---------- */
  if (fino && !reduce) {
    var zonas = todos('[data-mouse-zona]');
    var mx = 0, my = 0, tx = 0, ty = 0, corriendo = false;
    var mover = function () {
      mx += (tx - mx) * 0.07; my += (ty - my) * 0.07;
      zonas.forEach(function (z) { z.style.setProperty('--mx', mx.toFixed(3)); z.style.setProperty('--my', my.toFixed(3)); });
      if (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001) requestAnimationFrame(mover); else corriendo = false;
    };
    if (zonas.length) addEventListener('pointermove', function (e) {
      tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1;
      if (!corriendo) { corriendo = true; requestAnimationFrame(mover); }
    }, { passive: true });

    todos('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var rc = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - rc.left - rc.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - rc.top - rc.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });

    todos('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var rc = c.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width - 0.5, y = (e.clientY - rc.top) / rc.height - 0.5;
        c.style.transform = 'perspective(1000px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg)';
        c.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
        c.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });

    var cur = d.querySelector('.tinta-cursor');
    if (cur) {
      var cx = 0, cy = 0, qx = 0, qy = 0, activo = false;
      var sigue = function () {
        cx += (qx - cx) * 0.16; cy += (qy - cy) * 0.16;
        cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
        if (activo) requestAnimationFrame(sigue);
      };
      addEventListener('pointermove', function (e) { qx = e.clientX; qy = e.clientY; }, { passive: true });
      todos('[data-tinta-zona]').forEach(function (z) {
        z.addEventListener('pointerenter', function (e) {
          cx = qx = e.clientX; cy = qy = e.clientY; cur.classList.add('on');
          if (!activo) { activo = true; requestAnimationFrame(sigue); }
        });
        z.addEventListener('pointerleave', function () { cur.classList.remove('on'); setTimeout(function () { if (!cur.classList.contains('on')) activo = false; }, 500); });
        todos('[data-tinta]', z).forEach(function (fila) {
          fila.addEventListener('pointerenter', function () { cur.style.setProperty('--tinta', fila.getAttribute('data-tinta')); });
        });
      });
    }
  }

  /* ---------- Menú «Sitios» ---------- */
  todos('[data-sitios]').forEach(function (c) {
    var b = c.querySelector('.sitios-boton');
    var cerrar = function () { c.classList.remove('abierto'); b.setAttribute('aria-expanded', 'false'); };
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var a = c.classList.toggle('abierto'); b.setAttribute('aria-expanded', a);
      if (barra) barra.classList.remove('oculta');
    });
    d.addEventListener('click', function (e) { if (!c.contains(e.target)) cerrar(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    todos('.panel a', c).forEach(function (a) { a.addEventListener('click', cerrar); });
  });

  /* ---------- Intro de impresión (una vez por visita) ---------- */
  var intro = d.getElementById('intro');
  if (intro && r.classList.contains('con-intro')) {
    try { sessionStorage.setItem('intro-visto', '1'); } catch (e) {}
    var hecho = false;
    var fin = function () {
      if (hecho) return; hecho = true;
      r.classList.add('intro-sale');
      setTimeout(arrancar, 380);
      setTimeout(function () { r.classList.remove('con-intro', 'intro-sale'); if (intro.parentNode) intro.remove(); }, 1100);
    };
    setTimeout(fin, 1750);
    intro.addEventListener('click', fin);
  } else {
    if (intro) intro.remove();
    r.classList.remove('con-intro');
    arrancar();
  }

  alScroll();
})();
