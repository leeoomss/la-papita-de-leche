/* =========================================================
   La Papita de Leche · DATOS
   Este es el único archivo que hay que tocar para cambiar la
   carta, los precios, el horario o los datos de contacto.

   - Precios: con punto decimal (4.80). En la web salen como «4,80 €».
     Si un plato no tiene precio, pon  precio: null  (sale sin cifra).
   - Si todos los platos de un grupo cuestan lo mismo, el precio va
     en el grupo y no en cada plato.
   - Textos con dos idiomas: { es: '...', en: '...' }.
     Los nombres de los platos van solo en español.
   - Foto de un plato (opcional): guarda la imagen en /fotos y añade
       foto: { src: 'fotos/nombre.jpg', alt: { es: '...', en: '...' } }
   ========================================================= */
var DATOS = {

  negocio: {
    nombre: 'La Papita de Leche',
    apellido: 'Take Away',
    tipo: { es: 'Comida venezolana sin gluten', en: 'Gluten-free Venezuelan food' },
    lema: { es: 'Aquí todo es sin gluten', en: 'Everything here is gluten-free' },
    calle: 'Av. de María Cristina, 9, b',
    barrio: 'Ciutat Vella',
    codigoPostal: '46001',
    ciudad: 'València',
    pais: 'ES',
    telefono: '632 12 54 81',
    telefonoEnlace: '+34632125481',
    mapa: 'https://maps.app.goo.gl/vfKrPSUcbeAMBxzp6',
    comoLlegar: 'https://www.google.com/maps/dir/?api=1&destination=La%20Papita%20de%20Leche%20Take%20Away%2C%20Av.%20de%20Mar%C3%ADa%20Cristina%209%2C%2046001%20Val%C3%A8ncia',
    zonaHoraria: 'Europe/Madrid',
    // Dato de Google Maps. Cambia la fecha cuando actualices la cifra.
    valoracion: { nota: 4.8, maximo: 5, resenas: 494, fecha: '13/11/2026' }
  },

  // Cómo se puede pedir y comer.
  servicios: [
    { es: 'Para llevar', en: 'Takeaway' },
    { es: 'A domicilio', en: 'Delivery' },
    { es: 'Para comer allí (sin servicio en mesa)', en: 'Eat in (no table service)' }
  ],

  // Lo que también ofrece el local.
  ademas: [
    { es: 'Café', en: 'Coffee' },
    { es: 'Postres', en: 'Desserts' },
    { es: 'Opciones vegetarianas y veganas', en: 'Vegetarian and vegan options' }
  ],

  accesibilidad: { es: 'Acceso para silla de ruedas', en: 'Wheelchair access' },

  // Días: 1 = lunes … 7 = domingo. Horas en formato 24 h.
  horario: [
    { dia: 1, abre: '10:00', cierra: '22:30' },
    { dia: 2, abre: '9:30',  cierra: '22:30' },
    { dia: 3, abre: '9:30',  cierra: '23:00' },
    { dia: 4, abre: '9:30',  cierra: '22:30' },
    { dia: 5, abre: '9:30',  cierra: '22:30' },
    { dia: 6, abre: '10:30', cierra: '23:00' },
    { dia: 7, abre: '10:30', cierra: '22:00' }
  ],

  carta: [
    {
      id: 'combos',
      nombre: { es: 'Combos', en: 'Combos' },
      platos: [
        { nombre: 'Combo 1', precio: 6.00,
          desc: { es: '1 empanada (queso o carne molida) + 1 Coca-Cola', en: '1 empanada (cheese or minced beef) + 1 Coca-Cola' } },
        { nombre: 'Combo 2', precio: 12.50,
          desc: { es: '2 empanadas (queso o carne molida) + 2 tequeños + 1 Coca-Cola', en: '2 empanadas (cheese or minced beef) + 2 tequeños + 1 Coca-Cola' } },
        { nombre: 'Combo 3', precio: 15.25,
          desc: { es: '1 arepa combinada + 1 empanada + 2 tequeños + 1 Coca-Cola', en: '1 combination arepa + 1 empanada + 2 tequeños + 1 Coca-Cola' } },
        { nombre: null, precio: 10.00,
          desc: { es: '1 arepa especial + 1 Coca-Cola', en: '1 special arepa + 1 Coca-Cola' } }
      ]
    },
    {
      id: 'empanadas-clasicas', grupo: 'empanadas',
      nombre: { es: 'Empanadas clásicas', en: 'Classic empanadas' },
      precio: 4.80,
      platos: [
        { nombre: 'Queso blanco' },
        { nombre: 'Pollo' },
        { nombre: 'Mechada', desc: { es: 'Ternera deshilachada', en: 'Shredded beef' } },
        { nombre: 'Molida', desc: { es: 'Ternera picada', en: 'Minced beef' } }
      ]
    },
    {
      id: 'empanadas-combinadas', grupo: 'empanadas',
      nombre: { es: 'Empanadas combinadas', en: 'Combination empanadas' },
      precio: 5.30,
      platos: [
        { nombre: 'Dominó', desc: { es: 'Frijoles negros y queso blanco', en: 'Black beans and white cheese' } },
        { nombre: 'Jamón y queso', desc: { es: 'Jamón york y queso blanco', en: 'Cooked ham and white cheese' } },
        { nombre: 'Tajada con queso', desc: { es: 'Plátano maduro frito y queso', en: 'Fried ripe plantain and cheese' } },
        { nombre: 'Catira', desc: { es: 'Pollo y queso amarillo', en: 'Chicken and yellow cheese' } },
        { nombre: 'Pelúa', desc: { es: 'Carne mechada y queso amarillo', en: 'Shredded beef and yellow cheese' } }
      ]
    },
    {
      id: 'empanadas-especiales', grupo: 'empanadas',
      nombre: { es: 'Empanadas especiales', en: 'Special empanadas' },
      precio: 6.30,
      platos: [
        { nombre: 'Pabellón', desc: { es: 'Mechada, tajada, queso y frijoles', en: 'Shredded beef, fried plantain, cheese and beans' } },
        { nombre: 'Cordon Blue', desc: { es: 'Jamón york y queso amarillo', en: 'Cooked ham and yellow cheese' } },
        { nombre: 'A tu gusto' }
      ]
    },
    {
      id: 'arepas-clasicas', grupo: 'arepas',
      nombre: { es: 'Arepas clásicas', en: 'Classic arepas' },
      precio: 6.20,
      platos: [
        { nombre: 'Queso blanco' },
        { nombre: 'Pollo' },
        { nombre: 'Mechada', desc: { es: 'Ternera deshilachada', en: 'Shredded beef' } },
        { nombre: 'Molida', desc: { es: 'Ternera picada', en: 'Minced beef' } }
      ]
    },
    {
      id: 'arepas-combinadas', grupo: 'arepas',
      nombre: { es: 'Arepas combinadas', en: 'Combination arepas' },
      precio: 7.20,
      platos: [
        { nombre: 'Perico', desc: { es: 'Huevos revueltos con tomate', en: 'Scrambled eggs with tomato' } },
        { nombre: 'Pelúa', desc: { es: 'Carne y queso amarillo', en: 'Beef and yellow cheese' } },
        { nombre: 'Catira', desc: { es: 'Pollo y queso amarillo', en: 'Chicken and yellow cheese' } },
        { nombre: 'Pico e Gallo con atún', desc: { es: 'Tomate, cebolla, cilantro y atún', en: 'Tomato, onion, coriander and tuna' } },
        { nombre: 'Queso con aguacate' }
      ]
    },
    {
      id: 'arepas-especiales', grupo: 'arepas',
      nombre: { es: 'Arepas especiales', en: 'Special arepas' },
      precio: 9.00,
      platos: [
        { nombre: 'Reina Pepiada', desc: { es: 'Pollo, aguacate y mayonesa', en: 'Chicken, avocado and mayonnaise' } },
        { nombre: 'Sifrina', desc: { es: 'Reina pepiada con queso amarillo', en: 'Reina pepiada with yellow cheese' } },
        { nombre: 'Pabellón', desc: { es: 'Frijoles, queso, plátano y carne', en: 'Beans, cheese, plantain and beef' } },
        { nombre: 'A tu gusto' }
      ]
    },
    {
      id: 'entrantes',
      nombre: { es: 'Entrantes', en: 'Starters' },
      platos: [
        { nombre: 'Tequeños', precio: 6.00, desc: { es: '4 unidades', en: '4 pieces' } },
        { nombre: 'Tostones', precio: 6.00 },
        { nombre: 'Tajadas', precio: 6.00 },
        { nombre: 'Yuca frita', precio: 6.00 },
        { nombre: 'Queso planchado', precio: null },
        { nombre: 'Pastelitos', precio: 2.50 },
        { nombre: 'Croquetas', precio: 2.50 },
        { nombre: 'Patata rellena', precio: 2.50 }
      ]
    },
    {
      id: 'dulces',
      nombre: { es: 'Dulces', en: 'Sweets' },
      platos: [
        { nombre: 'Churros', precio: 2.50 },
        { nombre: 'Chocolate caliente', precio: 2.50 },
        { nombre: 'Torta tres leches', precio: null }
      ]
    }
  ]
};
