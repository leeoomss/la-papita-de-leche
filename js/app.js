/* =========================================================
   La Papita de Leche · página
   Pinta la carta, el horario y el contacto a partir de datos.js,
   calcula si el local está abierto y cambia de idioma.
   La escena 3D se carga al final, cuando todo lo demás ya se ve.
   ========================================================= */
(function () {
  'use strict';

  var D = DATOS;
  var N = D.negocio;
  var idioma = elegirIdioma();
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function t(clave) { return TEXTOS[idioma][clave]; }
  function tr(texto) { return texto && typeof texto === 'object' ? texto[idioma] : texto; }
  function rellenar(plantilla, datos) {
    return plantilla.replace(/\{(\w)\}/g, function (_, k) { return datos[k]; });
  }
  function el(etiqueta, clase, texto) {
    var e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  // Precios en formato español: 4,80 € (con espacio que no se separa).
  var formatoEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
  function euros(n) { return formatoEuros.format(n); }

  /* ---------- Idioma ---------- */

  function elegirIdioma() {
    var deUrl = new URLSearchParams(location.search).get('lang');
    if (deUrl === 'es' || deUrl === 'en') return deUrl;
    try {
      var guardado = localStorage.getItem('papita.idioma');
      if (guardado === 'es' || guardado === 'en') return guardado;
    } catch (e) {}
    return 'es';
  }

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.title = t('tituloPagina');
    $('meta[name="description"]').setAttribute('content', t('descripcionPagina'));
    $$('[data-t]').forEach(function (e) { e.textContent = t(e.getAttribute('data-t')); });
    $$('[data-t-aria]').forEach(function (e) { e.setAttribute('aria-label', t(e.getAttribute('data-t-aria'))); });
    $$('[data-idioma]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-idioma') === idioma));
    });
    pintarDatos();
    pintarCarta();
    pintarHorario();
    pintarEstado();
  }

  $$('[data-idioma]').forEach(function (b) {
    b.addEventListener('click', function () {
      var nuevo = b.getAttribute('data-idioma');
      if (nuevo === idioma) return;
      idioma = nuevo;
      try { localStorage.setItem('papita.idioma', idioma); } catch (e) {}
      aplicarIdioma();
    });
  });

  /* ---------- Datos del local ---------- */

  function pintarDatos() {
    $$('[data-d]').forEach(function (e) {
      var k = e.getAttribute('data-d');
      if (k === 'tel') e.setAttribute('href', 'tel:' + N.telefonoEnlace);
      else if (k === 'mapa') e.setAttribute('href', N.mapa);
      else if (k === 'nombre') e.textContent = N.nombre;
      else if (k === 'telefono') e.textContent = N.telefono;
      else if (k === 'tipo') e.textContent = tr(N.tipo);
      else if (k === 'lema') e.textContent = tr(N.lema);
      else if (k === 'accesibilidad') e.textContent = tr(D.accesibilidad);
    });

    var v = N.valoracion;
    var nota = idioma === 'es' ? String(v.nota).replace('.', ',') : String(v.nota);
    $('#valoracion').textContent = rellenar(t('valoracion'), { n: nota, m: v.maximo, r: v.resenas, f: v.fecha });

    $('#como-llegar').setAttribute('href', N.comoLlegar);

    var dir = $('#direccion');
    dir.textContent = '';
    dir.appendChild(el('strong', null, N.calle));
    dir.appendChild(document.createTextNode(N.barrio + ', ' + N.codigoPostal + ' ' + N.ciudad));

    $('#pie-direccion').textContent = N.calle + ', ' + N.codigoPostal + ' ' + N.ciudad;

    var ademas = D.ademas.map(function (x) { var s = tr(x); return s.charAt(0).toLowerCase() + s.slice(1); });
    var lista = ademas.length > 1
      ? ademas.slice(0, -1).join(', ') + (idioma === 'es' ? ' y ' : ' and ') + ademas[ademas.length - 1]
      : ademas.join('');
    $('#carta-ademas').textContent = t('tambien') + ' ' + lista + '.';

    var servicios = $('#servicios');
    servicios.textContent = '';
    D.servicios.forEach(function (s) { servicios.appendChild(el('li', null, tr(s))); });
  }

  /* ---------- Carta ---------- */

  var GRUPOS = [
    { id: 'combos', texto: 'grupoCombos' },
    { id: 'empanadas', texto: 'grupoEmpanadas' },
    { id: 'arepas', texto: 'grupoArepas' },
    { id: 'entrantes', texto: 'grupoEntrantes' },
    { id: 'dulces', texto: 'grupoDulces' }
  ];

  function pintarCarta() {
    var rejilla = $('#rejilla-carta');
    rejilla.textContent = '';
    var primeraDeGrupo = {};

    D.carta.forEach(function (cat) {
      var grupo = cat.grupo || cat.id;
      var tarjeta = el('article', 'tarjeta');
      tarjeta.id = 'carta-' + cat.id;
      tarjeta.setAttribute('aria-labelledby', 'tit-' + cat.id);
      if (!primeraDeGrupo[grupo]) primeraDeGrupo[grupo] = tarjeta.id;

      var cabeza = el('div', 'tarjeta-cabeza');
      var h3 = el('h3', null, tr(cat.nombre));
      h3.id = 'tit-' + cat.id;
      cabeza.appendChild(h3);
      if (cat.precio != null) {
        var sello = el('p', 'precio-grupo');
        var partes = rellenar(t('todasA'), { p: '|' }).split('|');
        sello.appendChild(el('small', null, partes[0].trim()));
        sello.appendChild(el('strong', null, euros(cat.precio)));
        cabeza.appendChild(sello);
      }
      tarjeta.appendChild(cabeza);

      var lista = el('ul', 'platos');
      cat.platos.forEach(function (p) {
        var li = el('li', 'plato' + (p.nombre ? '' : ' plato-solo-desc'));
        if (p.nombre) li.appendChild(el('span', 'plato-nombre', p.nombre));
        else li.appendChild(el('span', 'plato-desc', tr(p.desc)));
        if (cat.precio == null) {
          if (p.precio != null) li.appendChild(el('span', 'plato-precio', euros(p.precio)));
          else li.appendChild(el('span', 'plato-precio sin-precio', t('consultarPrecio')));
        }
        if (p.nombre && p.desc) li.appendChild(el('span', 'plato-desc', tr(p.desc)));
        if (p.foto && p.foto.src) {
          var img = el('img', 'plato-foto');
          img.src = p.foto.src;
          img.alt = tr(p.foto.alt) || '';
          img.width = 800;
          img.height = 600;
          img.loading = 'lazy';
          img.decoding = 'async';
          li.appendChild(img);
        }
        lista.appendChild(li);
      });
      tarjeta.appendChild(lista);
      rejilla.appendChild(tarjeta);
    });

    var grupos = $('#grupos');
    grupos.textContent = '';
    GRUPOS.forEach(function (g) {
      if (!primeraDeGrupo[g.id]) return;
      var li = el('li');
      var a = el('a', null, t(g.texto));
      a.href = '#' + primeraDeGrupo[g.id];
      li.appendChild(a);
      grupos.appendChild(li);
    });

    activarInclinacion();
  }

  /* ---------- Horario y «abierto ahora» ---------- */

  function minutos(hora) {
    var p = hora.split(':');
    return Number(p[0]) * 60 + Number(p[1]);
  }

  // Día (1 = lunes … 7 = domingo) y minuto del día en la hora de València.
  function ahoraEnElLocal() {
    var partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: N.zonaHoraria, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    var dias = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    return { dia: dias[v.weekday], minuto: Number(v.hour) * 60 + Number(v.minute) };
  }

  function horarioDe(dia) {
    for (var i = 0; i < D.horario.length; i++) if (D.horario[i].dia === dia) return D.horario[i];
    return null;
  }

  function calcularEstado() {
    var ahora = ahoraEnElLocal();
    var hoy = horarioDe(ahora.dia);
    if (hoy && ahora.minuto >= minutos(hoy.abre) && ahora.minuto < minutos(hoy.cierra)) {
      return { abierto: true, titulo: t('abierto'), detalle: rellenar(t('cierraA'), { h: hoy.cierra }) };
    }
    // Cerrado: busca la próxima apertura.
    for (var i = 0; i < 8; i++) {
      var dia = ((ahora.dia - 1 + i) % 7) + 1;
      var h = horarioDe(dia);
      if (!h) continue;
      if (i === 0 && ahora.minuto >= minutos(h.abre)) continue;
      var detalle = i === 0 ? rellenar(t('abreHoy'), { h: h.abre })
        : i === 1 ? rellenar(t('abreManana'), { h: h.abre })
        : rellenar(t('abreDia'), { d: t('dias')[dia - 1], h: h.abre });
      return { abierto: false, titulo: t('cerrado'), detalle: detalle };
    }
    return { abierto: false, titulo: t('cerrado'), detalle: '' };
  }

  function pintarEstado() {
    var e = calcularEstado();
    var caja = $('#estado');
    caja.setAttribute('data-abierto', e.abierto ? 'si' : 'no');
    $('#estado-titulo').textContent = e.detalle ? e.titulo + ',' : e.titulo;
    $('#estado-detalle').textContent = e.detalle.charAt(0).toLowerCase() + e.detalle.slice(1);
  }

  function pintarHorario() {
    var hoy = ahoraEnElLocal().dia;
    var filas = $('#horario-filas');
    filas.textContent = '';
    D.horario.forEach(function (h) {
      var tr_ = el('tr', h.dia === hoy ? 'hoy' : '');
      var th = el('th');
      th.scope = 'row';
      var nombre = t('dias')[h.dia - 1];
      th.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
      if (h.dia === hoy) th.appendChild(el('span', 'marca-hoy', t('hoy')));
      tr_.appendChild(th);
      tr_.appendChild(el('td', null, h.abre + '–' + h.cierra));
      filas.appendChild(tr_);
    });
  }

  // Se recalcula cada medio minuto y al volver a la pestaña.
  setInterval(function () { pintarEstado(); }, 30000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { pintarEstado(); pintarHorario(); }
  });

  /* ---------- Datos para Google (Restaurant) ---------- */

  function datosEstructurados() {
    var nombresDia = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var json = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: N.nombre + ' ' + N.apellido,
      servesCuisine: 'Venezolana',
      telephone: '+34 ' + N.telefono,
      hasMap: N.mapa,
      address: {
        '@type': 'PostalAddress',
        streetAddress: N.calle,
        addressLocality: N.ciudad,
        postalCode: N.codigoPostal,
        addressCountry: N.pais
      },
      openingHoursSpecification: D.horario.map(function (h) {
        var dos = function (x) { return x.length === 4 ? '0' + x : x; };
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: nombresDia[h.dia - 1], opens: dos(h.abre), closes: dos(h.cierra) };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(json);
    document.head.appendChild(s);
  }

  /* ---------- Tarjetas que se inclinan (CSS 3D) ---------- */

  var conRatonFino = window.matchMedia('(hover: hover) and (pointer: fine)');

  function activarInclinacion() {
    $$('.tarjeta, .bloque').forEach(function (caja) {
      if (caja.dataset.inclina) return;
      caja.dataset.inclina = '1';
      var marco = null;
      function inclinar(ev, fuerza) {
        if (movimientoReducido.matches) return;
        var r = caja.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        var max = fuerza * (r.width > 520 ? 4 : 7);
        cancelAnimationFrame(marco);
        marco = requestAnimationFrame(function () {
          caja.style.transform = 'rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg)';
        });
      }
      function soltar() {
        cancelAnimationFrame(marco);
        caja.classList.remove('inclinando');
        caja.style.transform = '';
      }
      caja.addEventListener('pointermove', function (ev) {
        if (ev.pointerType === 'mouse' && conRatonFino.matches) { caja.classList.add('inclinando'); inclinar(ev, 1); }
      });
      caja.addEventListener('pointerleave', soltar);
      // En el móvil: se inclina hacia donde tocas mientras mantienes el dedo.
      caja.addEventListener('pointerdown', function (ev) {
        if (ev.pointerType !== 'mouse') inclinar(ev, 1);
      });
      caja.addEventListener('pointerup', soltar);
      caja.addEventListener('pointercancel', soltar);
    });
  }

  /* ---------- Capas con parallax suave ---------- */

  function activarParallax() {
    var capas = $$('[data-profundidad]');
    var pendiente = false;
    function mover() {
      pendiente = false;
      if (movimientoReducido.matches) { capas.forEach(function (c) { c.style.transform = ''; }); return; }
      var alto = window.innerHeight;
      capas.forEach(function (c) {
        var padre = c.parentElement.getBoundingClientRect();
        if (padre.bottom < -200 || padre.top > alto + 200) return;
        var centro = padre.top + padre.height / 2 - alto / 2;
        c.style.transform = 'translate3d(0,' + (centro * Number(c.dataset.profundidad)).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!pendiente) { pendiente = true; requestAnimationFrame(mover); }
    }, { passive: true });
    mover();
  }

  /* ---------- Escena 3D: se carga la última ---------- */

  function puedeHacer3D() {
    if (movimientoReducido.matches) return false;
    var conexion = navigator.connection;
    if (conexion && conexion.saveData) return false;
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function cargarScript(src, listo) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = listo;
    s.onerror = function () {};
    document.body.appendChild(s);
  }

  function cargar3D() {
    if (!puedeHacer3D()) return;
    cargarScript('vendor/three/three.min.js', function () {
      cargarScript('js/escena.js', function () {});
    });
  }

  function cuandoEsteTodo(fn) {
    var lanzar = function () {
      if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
      else setTimeout(fn, 300);
    };
    if (document.readyState === 'complete') lanzar();
    else window.addEventListener('load', lanzar, { once: true });
  }

  /* ---------- Arranque ---------- */

  aplicarIdioma();
  datosEstructurados();
  activarParallax();
  cuandoEsteTodo(cargar3D);

  // Para la escena: avisa si cambian el idioma o «reducir movimiento».
  window.Papita = { movimientoReducido: movimientoReducido };
})();
