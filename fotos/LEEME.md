# Fotos

Carpeta preparada para las fotos de los platos. Ahora está vacía: la web no usa ninguna foto.

Para añadir la foto de un plato:

1. Guarda aquí la imagen, por ejemplo `fotos/reina-pepiada.jpg` (mejor en formato 4:3, unos 800 × 600 píxeles).
2. En `js/datos.js`, busca el plato y añade la línea `foto`:

   ```js
   { nombre: 'Reina Pepiada', desc: { ... },
     foto: { src: 'fotos/reina-pepiada.jpg', alt: { es: 'Arepa reina pepiada abierta', en: 'Open reina pepiada arepa' } } },
   ```

El texto `alt` describe la foto para quien no la ve. Usa solo fotos propias del local.
