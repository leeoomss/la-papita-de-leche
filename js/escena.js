/* =========================================================
   La Papita de Leche · escena 3D de la portada (Three.js)
   Todo está modelado aquí con código: no se descarga ningún
   modelo, textura ni imagen. Si algo falla, se queda el dibujo
   fijo de la portada y la página sigue igual.
   ========================================================= */
(function () {
  'use strict';

  var THREE = window.THREE;
  var lienzo = document.getElementById('lienzo');
  var escenario = document.getElementById('escenario');
  var portada = document.getElementById('portada');
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!THREE || !lienzo || !escenario || reducido.matches) return;

  THREE.ColorManagement.legacyMode = false;

  var pequeno = Math.min(window.innerWidth, window.innerHeight) < 640;
  var retina = (window.devicePixelRatio || 1) >= 1.5;
  var renderer;
  try {
    // En pantallas Retina el suavizado de bordes sobra: los píxeles ya son muy pequeños.
    renderer = new THREE.WebGLRenderer({ antialias: !pequeno && !retina, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.outputEncoding = THREE.sRGBEncoding;
  // En pantallas pequeñas se dibuja a menos resolución para ir fluido.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pequeno ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  lienzo.appendChild(renderer.domElement);

  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camara.position.set(0, 0, 12);

  // Luz cálida de tarde, con un contraluz anaranjado.
  escena.add(new THREE.HemisphereLight(0xFFF0CC, 0x8A4A22, 0.95));
  var sol = new THREE.DirectionalLight(0xFFE0B0, 1.35);
  sol.position.set(-4, 7, 7);
  escena.add(sol);
  var contraluz = new THREE.DirectionalLight(0xFF8A40, 0.7);
  contraluz.position.set(6, 2, -5);
  escena.add(contraluz);
  var relleno = new THREE.DirectionalLight(0xFFF2D8, 0.55);
  relleno.position.set(0, -3, 8);
  escena.add(relleno);

  /* ---------- Utilidades ---------- */

  function azar(semilla) {
    return function () {
      semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0;
      var t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var rnd = azar(19112026);

  // Ruido suave hecho con senos: da el aspecto de hecho a mano.
  function ruido(x, y, z) {
    return Math.sin(x * 1.7 + 1.3) * Math.sin(y * 2.3 + 0.7) * Math.sin(z * 1.9 + 2.1) * 0.6 +
      Math.sin(x * 4.1 + y * 3.7) * Math.sin(z * 4.3 - y * 2.9) * 0.4;
  }

  function abollar(geo, fuerza, escala) {
    var pos = geo.attributes.position;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    var nor = geo.attributes.normal;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var n = ruido(x * escala, y * escala, z * escala) * fuerza;
      pos.setXYZ(i, x + nor.getX(i) * n, y + nor.getY(i) * n, z + nor.getZ(i) * n);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // Colorea cada vértice: base dorada con manchas tostadas.
  function tostar(geo, base, oscuro, umbral, escala, extra) {
    var pos = geo.attributes.position;
    var col = new Float32Array(pos.count * 3);
    var c1 = new THREE.Color(base), c2 = new THREE.Color(oscuro), c = new THREE.Color();
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var n = ruido(x * escala + 7, y * escala * 1.3, z * escala - 3) * 0.5 + 0.5;
      var k = Math.max(0, Math.min(1, (n - umbral) / 0.22));
      if (extra) k = Math.max(k, extra(x, y, z));
      c.copy(c1).lerp(c2, k * 0.85);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return geo;
  }

  function material(color, opciones) {
    var o = { color: color, roughness: 0.8, metalness: 0 };
    for (var k in opciones) o[k] = opciones[k];
    return new THREE.MeshStandardMaterial(o);
  }

  var texSombra = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(42,22,33,0.5)');
    gr.addColorStop(0.45, 'rgba(42,22,33,0.24)');
    gr.addColorStop(1, 'rgba(42,22,33,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  function sombra(ancho, fondo) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.scale.set(ancho, fondo, 1);
    m.renderOrder = -1;
    return m;
  }

  /* ---------- Arepa (se abre al hacer scroll) ---------- */

  function crearArepa() {
    var R = 1.05, h = 0.21, b = 0.2;
    var grupo = new THREE.Group();
    var masa = material(0xffffff, { vertexColors: true, roughness: 0.86, side: THREE.DoubleSide });
    var miga = material('#FBEBC0', { roughness: 0.95, emissive: '#5A4318', emissiveIntensity: 0.35 });
    var bordeTostado = function (x, y, z) {
      var r = Math.sqrt(x * x + z * z);
      return Math.max(0, (r - (R - 0.16)) / 0.16) * 0.55;
    };

    function perfil(arriba) {
      var p = [];
      var i;
      if (arriba) {
        for (i = 0; i <= 8; i++) {
          var a = i / 8 * Math.PI / 2;
          p.push(new THREE.Vector2(R - b + Math.cos(a) * b, Math.sin(a) * h));
        }
        p.push(new THREE.Vector2((R - b) * 0.66, h * 1.07));
        p.push(new THREE.Vector2((R - b) * 0.33, h * 1.12));
        p.push(new THREE.Vector2(0.0001, h * 1.13));
      } else {
        p.push(new THREE.Vector2(0.0001, -h * 1.08));
        p.push(new THREE.Vector2((R - b) * 0.5, -h * 1.05));
        for (i = 0; i <= 8; i++) {
          var a2 = -Math.PI / 2 + i / 8 * Math.PI / 2;
          p.push(new THREE.Vector2(R - b + Math.cos(a2) * b, Math.sin(a2) * h));
        }
      }
      return p;
    }

    function mitad(arriba) {
      var g = new THREE.LatheGeometry(perfil(arriba), pequeno ? 36 : 48, Math.PI, Math.PI * 2);
      abollar(g, 0.018, 2.2);
      tostar(g, '#F1B64C', '#B8661E', 0.66, 2.4, bordeTostado);
      var m = new THREE.Mesh(g, masa);
      var cara = new THREE.Mesh(new THREE.CircleGeometry(R - 0.004, 48), miga);
      cara.rotation.x = arriba ? Math.PI / 2 : -Math.PI / 2;
      cara.position.y = arriba ? -0.001 : 0.001;
      var mg = new THREE.Group();
      mg.add(m); mg.add(cara);
      return mg;
    }

    var abajo = mitad(false);
    grupo.add(abajo);

    // Relleno de pabellón: carne mechada, caraotas, tajadas y queso.
    var relleno = new THREE.Group();
    var geoCarne = new THREE.IcosahedronGeometry(0.1, 1);
    var carnes = [material('#7A3B1C', { flatShading: true, roughness: 0.7 }), material('#93502A', { flatShading: true, roughness: 0.7 })];
    var i, m, r, a;
    for (i = 0; i < 18; i++) {
      m = new THREE.Mesh(geoCarne, carnes[i % 2]);
      r = Math.sqrt(rnd()) * 0.74; a = rnd() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, 0.05 + rnd() * 0.05, Math.sin(a) * r);
      m.scale.set(2.3 + rnd(), 0.55, 0.7);
      m.rotation.set(0, rnd() * Math.PI, (rnd() - 0.5) * 0.4);
      relleno.add(m);
    }
    var geoGrano = new THREE.SphereGeometry(0.055, 8, 6);
    var grano = material('#2A1621', { roughness: 0.35 });
    for (i = 0; i < 24; i++) {
      m = new THREE.Mesh(geoGrano, grano);
      r = Math.sqrt(rnd()) * 0.8; a = rnd() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, 0.07 + rnd() * 0.06, Math.sin(a) * r);
      m.scale.set(1.35, 0.85, 1);
      m.rotation.y = rnd() * Math.PI;
      relleno.add(m);
    }
    var geoTajada = new THREE.CapsuleGeometry(0.08, 0.38, 4, 10);
    var tajada = material('#E8962E', { roughness: 0.55 });
    for (i = 0; i < 3; i++) {
      m = new THREE.Mesh(geoTajada, tajada);
      a = i / 3 * Math.PI * 2 + 0.4;
      m.position.set(Math.cos(a) * 0.42, 0.11, Math.sin(a) * 0.42);
      m.rotation.set(0, -a + Math.PI / 2, Math.PI / 2);
      m.scale.set(1, 1, 0.7);
      relleno.add(m);
    }
    var geoQueso = new THREE.BoxGeometry(0.15, 0.12, 0.15);
    var queso = material('#FFF8EA', { roughness: 0.92 });
    for (i = 0; i < 6; i++) {
      m = new THREE.Mesh(geoQueso, queso);
      r = 0.2 + rnd() * 0.55; a = rnd() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r);
      m.rotation.set(rnd() * 0.4, rnd() * Math.PI, rnd() * 0.4);
      relleno.add(m);
    }
    grupo.add(relleno);

    // La tapa gira sobre una bisagra en el borde de atrás.
    var bisagra = new THREE.Group();
    bisagra.position.z = -R * 0.94;
    var tapa = mitad(true);
    tapa.position.z = R * 0.94;
    bisagra.add(tapa);
    grupo.add(bisagra);

    return {
      grupo: grupo,
      abrir: function (k) {
        bisagra.rotation.x = -k;
        relleno.scale.y = 0.75 + k * 0.6;
        relleno.position.y = k * 0.03;
      }
    };
  }

  /* ---------- Empanada ---------- */

  function geoEmpanada() {
    var NX = pequeno ? 34 : 46, NF = pequeno ? 22 : 28;
    var pos = [], idx = [];
    for (var i = 0; i <= NX; i++) {
      var x = -Math.cos(Math.PI * (0.02 + 0.96 * i / NX));
      var base = Math.max(0, 1 - x * x);
      var Y = Math.sqrt(base) * 0.94;
      var H = 0.36 * Math.pow(base, 0.42);
      for (var j = 0; j < NF; j++) {
        var f = 2 * Math.PI * j / NF;
        pos.push(x * 1.02, Y * (1 - Math.cos(f)) / 2, H * Math.sin(f) * Math.pow((1 + Math.cos(f)) / 2, 0.3));
      }
    }
    for (i = 0; i < NX; i++) {
      for (j = 0; j < NF; j++) {
        var a = i * NF + j, b2 = i * NF + (j + 1) % NF, c = (i + 1) * NF + j, d = (i + 1) * NF + (j + 1) % NF;
        idx.push(a, b2, c, b2, d, c);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  function crearEmpanada() {
    var grupo = new THREE.Group();
    var g = abollar(geoEmpanada(), 0.012, 2.6);
    tostar(g, '#EAA13A', '#B5611C', 0.62, 2.8);
    var masa = material(0xffffff, { vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
    grupo.add(new THREE.Mesh(g, masa));

    // El repulgue: el borde trenzado.
    var geoPliegue = new THREE.SphereGeometry(1, 10, 8);
    var pliegue = material('#D98A2E', { roughness: 0.78 });
    var piezas = 17;
    for (var k = 0; k < piezas; k++) {
      var t = 0.06 + 0.88 * k / (piezas - 1);
      var x = -Math.cos(Math.PI * t) * 1.02;
      var xn = x / 1.02;
      var Y = Math.sqrt(Math.max(0, 1 - xn * xn)) * 0.94;
      var pendiente = Math.atan2(-xn / Math.sqrt(Math.max(0.0001, 1 - xn * xn)) * 0.94, 1.02);
      var m = new THREE.Mesh(geoPliegue, pliegue);
      m.position.set(x, Y + 0.02, 0);
      m.scale.set(0.12, 0.05, 0.075);
      m.rotation.set(k % 2 ? 0.55 : -0.55, 0, pendiente, 'ZYX');
      grupo.add(m);
    }
    return grupo;
  }

  /* ---------- Taza de chocolate con churros ---------- */

  function geoChurro(largo, curva) {
    var forma = new THREE.Shape();
    var puntas = 7, rDentro = 0.085, rFuera = 0.14;
    for (var k = 0; k <= puntas; k++) {
      var a = k / puntas * Math.PI * 2;
      var px = Math.cos(a) * rDentro, py = Math.sin(a) * rDentro;
      if (k === 0) { forma.moveTo(px, py); continue; }
      var am = (k - 0.5) / puntas * Math.PI * 2;
      forma.quadraticCurveTo(Math.cos(am) * rFuera, Math.sin(am) * rFuera, px, py);
    }
    var camino = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(curva * 0.6, largo * 0.5, 0),
      new THREE.Vector3(curva, largo, 0)
    ]);
    var g = new THREE.ExtrudeGeometry(forma, { steps: pequeno ? 16 : 24, bevelEnabled: false, extrudePath: camino, curveSegments: 3 });
    tostar(g, '#D8903E', '#9E571E', 0.6, 5);
    return g;
  }

  function crearTaza() {
    var grupo = new THREE.Group();
    var perfil = [
      [0.0001, 0], [0.42, 0], [0.5, 0.03], [0.56, 0.12], [0.62, 0.9], [0.63, 0.95],
      [0.6, 0.975], [0.565, 0.94], [0.51, 0.15], [0.45, 0.1], [0.0001, 0.1]
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var esmalte = material('#FFF6E5', { roughness: 0.32, side: THREE.DoubleSide });
    grupo.add(new THREE.Mesh(new THREE.LatheGeometry(perfil, pequeno ? 32 : 44, Math.PI), esmalte));

    var borde = new THREE.Mesh(new THREE.TorusGeometry(0.612, 0.03, 8, 44), material('#C8321F', { roughness: 0.4 }));
    borde.rotation.x = Math.PI / 2;
    borde.position.y = 0.955;
    grupo.add(borde);

    var asa = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.062, 10, 24, Math.PI), esmalte);
    asa.position.set(0.6, 0.5, 0);
    asa.rotation.z = -Math.PI / 2;
    grupo.add(asa);

    var chocolate = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), material('#4A2414', { roughness: 0.22 }));
    chocolate.rotation.x = -Math.PI / 2;
    chocolate.position.y = 0.82;
    grupo.add(chocolate);

    var masaChurro = material(0xffffff, { vertexColors: true, roughness: 0.7 });
    var c1 = new THREE.Mesh(geoChurro(1.5, 0.1), masaChurro);
    c1.position.set(-0.14, 0.28, 0.06);
    c1.rotation.set(0.1, 0, 0.3);
    grupo.add(c1);
    var c2 = new THREE.Mesh(geoChurro(1.4, -0.08), masaChurro);
    c2.position.set(0.16, 0.28, -0.08);
    c2.rotation.set(-0.12, 0, -0.2);
    grupo.add(c2);
    return grupo;
  }

  /* ---------- Composición ---------- */

  var mundo = new THREE.Group();
  escena.add(mundo);

  function pieza(objeto, x, y, z, suelo, sombraAncho) {
    var p = new THREE.Group();
    p.position.set(x, y, z);
    var flota = new THREE.Group();
    flota.add(objeto);
    p.add(flota);
    var s = sombra(sombraAncho, sombraAncho * 0.55);
    s.position.y = suelo - y;
    p.add(s);
    mundo.add(p);
    return { p: p, flota: flota, sombra: s, base: new THREE.Vector3(x, y, z), fase: rnd() * 6.28 };
  }

  var arepa = crearArepa();
  arepa.grupo.rotation.set(0.55, -0.25, 0.05);
  var empanada = crearEmpanada();
  empanada.rotation.set(-0.95, 0.35, 0.18);
  empanada.scale.setScalar(0.9);
  var taza = crearTaza();
  taza.rotation.set(0.28, -0.6, -0.06);
  taza.scale.setScalar(0.92);
  taza.position.y = -0.55;

  var piezas = [
    pieza(arepa.grupo, 0.05, 0.25, 0.35, -1.35, 3.0),
    pieza(empanada, -1.85, -0.55, -0.25, -1.35, 2.2),
    pieza(taza, 1.9, -0.25, -0.35, -1.35, 1.7)
  ];

  /* ---------- Movimiento ---------- */

  function Muelle(k, c) { this.x = 0; this.v = 0; this.k = k; this.c = c; }
  Muelle.prototype.paso = function (objetivo, dt) {
    var a = this.k * (objetivo - this.x) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  };

  var giroX = new Muelle(30, 10), giroY = new Muelle(30, 10), vaivenScroll = new Muelle(26, 7);
  var apertura = new Muelle(40, 12);
  var raton = { x: 0, y: 0 };
  var arrastre = { activo: false, id: null, x: 0, giro: 0, vel: 0, ultimo: 0 };
  var ultimoScroll = window.scrollY, empujeScroll = 0;

  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    raton.x = ev.clientX / window.innerWidth * 2 - 1;
    raton.y = ev.clientY / window.innerHeight * 2 - 1;
  }, { passive: true });

  // Arrastrar con el dedo (o el ratón) hace girar las piezas.
  escenario.addEventListener('pointerdown', function (ev) {
    if (arrastre.activo) return;   // un solo dedo
    arrastre.activo = true;
    arrastre.id = ev.pointerId;
    arrastre.x = ev.clientX;
    arrastre.ultimo = performance.now();
    arrastre.vel = 0;
  });
  window.addEventListener('pointermove', function (ev) {
    if (!arrastre.activo || ev.pointerId !== arrastre.id) return;
    var ahora = performance.now();
    var dx = ev.clientX - arrastre.x;
    arrastre.x = ev.clientX;
    arrastre.giro += dx * 0.012;
    arrastre.vel = dx * 0.012 / Math.max(8, ahora - arrastre.ultimo) * 1000;
    arrastre.ultimo = ahora;
  }, { passive: true });
  function soltar(ev) {
    if (ev.pointerId === arrastre.id) { arrastre.activo = false; arrastre.id = null; }
  }
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);

  /* ---------- Tamaño y posición respecto a la página ---------- */

  var ancho = 1, alto = 1;
  function medir() {
    ancho = lienzo.clientWidth || window.innerWidth;
    alto = lienzo.clientHeight || window.innerHeight;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  }
  medir();
  var anchoAntes = ancho;
  window.addEventListener('resize', function () {
    // En el móvil la barra del navegador cambia el alto: solo se re-mide si cambia el ancho o mucho el alto.
    if (Math.abs(lienzo.clientWidth - anchoAntes) > 1 || Math.abs(lienzo.clientHeight - alto) > 120) {
      medir();
      anchoAntes = ancho;
    }
  });

  var altoVisible = 2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * camara.position.z;

  function suave(x) { return x * x * (3 - 2 * x); }
  function limitar(x, a, b) { return Math.max(a, Math.min(b, x)); }

  /* ---------- Bucle de dibujo (solo cuando se ve) ---------- */

  var enMarcha = false, visible = true, marco = 0, antes = 0, inicio = 0;

  function dibujar(ahora) {
    marco = requestAnimationFrame(dibujar);
    var dt = Math.min(0.05, (ahora - antes) / 1000 || 0.016);
    antes = ahora;
    if (!inicio) inicio = ahora;
    var t = ahora / 1000;

    var rectE = escenario.getBoundingClientRect();
    var rectP = portada.getBoundingClientRect();
    var bajado = Math.max(0, -rectP.top);
    var progreso = limitar(bajado / (rectP.height * 0.8), 0, 1);

    // Las piezas siguen al escenario, pero algo más despacio que la página (parallax).
    var anchoVisible = altoVisible * camara.aspect;
    var cx = ((rectE.left + rectE.width / 2) / ancho - 0.5) * anchoVisible;
    var cy = -((rectE.top + rectE.height / 2 + bajado * 0.35) / alto - 0.5) * altoVisible;
    var escala = Math.min(rectE.width / ancho * anchoVisible / (rectE.width > 560 ? 5.4 : 6.6), rectE.height / alto * altoVisible / 3.7);

    // Inclinación por la velocidad del scroll.
    var dy = window.scrollY - ultimoScroll;
    ultimoScroll = window.scrollY;
    empujeScroll = empujeScroll * 0.85 + limitar(dy * -0.01, -0.5, 0.5) * 0.15;

    // Arrastre: inercia y vuelta suave a su sitio.
    if (!arrastre.activo) {
      arrastre.giro += arrastre.vel * dt;
      arrastre.vel *= Math.pow(0.04, dt);
      if (Math.abs(arrastre.vel) < 0.4) {
        var destino = Math.round(arrastre.giro / (Math.PI * 2)) * Math.PI * 2;
        arrastre.giro += (destino - arrastre.giro) * Math.min(1, dt * 2.5);
      }
    }

    // Entrada: las piezas aparecen una tras otra.
    var entrada = (ahora - inicio) / 900;

    var rx = giroX.paso(raton.y * 0.16, dt);
    var ry = giroY.paso(raton.x * 0.32, dt);
    var vaiven = vaivenScroll.paso(empujeScroll, dt);

    mundo.position.set(cx, cy, progreso * 1.6);
    mundo.scale.setScalar(escala);
    // La «cámara» baja la mirada hacia la arepa abierta.
    mundo.rotation.set(rx + suave(progreso) * 0.5, ry, 0);

    piezas.forEach(function (pz, i) {
      var e = limitar(entrada - i * 0.12, 0, 1);
      var eo = 1 - Math.pow(1 - e, 3);
      var separa = 1 + suave(progreso) * 0.12;
      pz.p.position.set(pz.base.x * separa, pz.base.y - (1 - eo) * 0.35, pz.base.z);
      pz.p.scale.setScalar(0.86 + 0.14 * eo);
      var alturaFlota = Math.sin(t * 0.9 + pz.fase) * 0.08;
      pz.flota.position.y = alturaFlota;
      pz.flota.rotation.set(vaiven * (i === 1 ? -1 : 1), Math.sin(t * 0.35 + pz.fase) * 0.18 + arrastre.giro, vaiven * 0.4);
      pz.sombra.material.opacity = eo * (0.9 - alturaFlota * 2);
      pz.sombra.scale.x = (1 - alturaFlota * 0.8) * pz.sombra.userData.w;
    });

    arepa.abrir(apertura.paso(0.24 + suave(limitar(progreso * 1.6, 0, 1)) * 0.95, dt));

    // Al llegar a la carta la escena se desvanece.
    renderer.domElement.style.opacity = (1 - suave(limitar((progreso - 0.55) / 0.4, 0, 1))).toFixed(3);
    renderer.render(escena, camara);

    if (!enMarcha) {
      enMarcha = true;
      document.documentElement.classList.add('con-3d');
    }
  }
  piezas.forEach(function (pz) { pz.sombra.userData.w = pz.sombra.scale.x; });

  function arrancar() {
    if (marco || !visible || document.hidden || reducido.matches) return;
    antes = performance.now();
    marco = requestAnimationFrame(dibujar);
  }
  function parar() {
    cancelAnimationFrame(marco);
    marco = 0;
  }

  // Pausa cuando la portada no se ve o la pestaña está oculta.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
      if (visible) arrancar(); else parar();
    }).observe(portada);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) parar(); else arrancar();
  });

  // Si activan «reducir movimiento», vuelve el dibujo fijo.
  var alCambiar = function () {
    if (reducido.matches) {
      parar();
      document.documentElement.classList.remove('con-3d');
    } else {
      document.documentElement.classList.add('con-3d');
      arrancar();
    }
  };
  if (reducido.addEventListener) reducido.addEventListener('change', alCambiar);

  renderer.domElement.addEventListener('webglcontextlost', function (ev) {
    ev.preventDefault();
    parar();
    document.documentElement.classList.remove('con-3d');
  });

  arrancar();
})();
