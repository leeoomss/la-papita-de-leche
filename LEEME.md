# La Papita de Leche Take Away: web de demostración

Una sola página, sin instalar nada. Se abre con doble clic en `index.html`
y se puede subir tal cual a cualquier hosting gratuito (Netlify, GitHub Pages, Cloudflare Pages...).

## Qué archivo tocar

- **`js/datos.js`**: la carta, los precios, el horario y los datos de contacto. Es lo único que hay que cambiar para el día a día.
- `js/textos.js`: los textos de la web en español e inglés (botones, títulos...).
- `css/estilos.css`: el diseño. Los colores están en variables al principio.
- `js/escena.js`: la escena 3D de la portada (Three.js, todo modelado con código).
- `fotos/`: preparada para las fotos de los platos (ver `fotos/LEEME.md`).

## Antes de publicarla de verdad

- Borra la línea de la franja «Borrador de demostración» en `index.html`.
- Borra la línea `<meta name="robots" content="noindex">` para que Google la muestre.
- Actualiza en `js/datos.js` la valoración de Google y su fecha.

## Lo que hay dentro

- Three.js r149 (licencia MIT) en `vendor/three/`.
- Letras Bagel Fat One y Atkinson Hyperlegible Next (licencia OFL) en `fuentes/`.
