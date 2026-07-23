/**
 * Datos mock del catálogo. Sustituyen temporalmente a una API de productos
 * (aún inexistente). Las imágenes son placeholders remotos (picsum, semilla
 * estable) para poblar la UI; reemplazar por fotos reales de producto.
 *
 * La forma de cada producto está pensada para mapear 1:1 con un backend futuro.
 */

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`

export const CATEGORIES = ['Sala', 'Oficina', 'Exterior', 'Iluminación']

export const PRODUCTS = [
  {
    id: 'sillon-siena',
    name: 'Sillón Siena',
    brand: 'LA MUNDIAL',
    category: 'Sala',
    price: 1250,
    image: img('sillon-siena'),
    description:
      'Una pieza maestra esculpida para el descanso. La Siena combina una estructura arquitectónica de raíz orgánica con un perfil flexible de grano superior acabado a mano. Cada curva está calculada para la perfección ergonómica, creando una silueta en arcia definitiva para tu estudio moderno.',
    specs: { Material: 'Cuero · Madera Nogal', Color: 'Blanco', Dimensiones: 'Ancho 80cm · Prof. 75cm · Alto 90cm' },
    eco: 'Madera con certificación FSC y tratamiento de base agua (no COV).',
    variants: ['sillon-siena', 'siena-room', 'siena-detail'],
  },
  {
    id: 'lounge-sienna',
    name: 'Sillón Lounge Sienna',
    brand: 'LA MUNDIAL',
    category: 'Sala',
    price: 1250,
    image: img('lounge-sienna'),
    description:
      'Teca y lino acabado a mano para un descanso prolongado. Su chasis envolvente abraza el cuerpo manteniendo una postura natural durante horas de lectura.',
    specs: { Material: 'Teca · Lino', Color: 'Arena', Dimensiones: 'Ancho 70cm · Prof. 120cm · Alto 85cm' },
    eco: 'Teca recuperada de plantaciones gestionadas de forma responsable.',
    variants: ['lounge-sienna', 'lounge-room', 'lounge-detail'],
  },
  {
    id: 'escritorio-sculptural',
    name: 'Escritorio Sculptural',
    brand: 'LA MUNDIAL',
    category: 'Oficina',
    price: 1250,
    image: img('escritorio-sculptural'),
    description:
      'Una superficie de trabajo que equilibra masa y vacío. Tablero macizo sobre patas escultóricas que parecen flotar sobre el suelo.',
    specs: { Material: 'Roble macizo', Color: 'Natural', Dimensiones: 'Ancho 140cm · Prof. 60cm · Alto 75cm' },
    eco: 'Acabado con aceites naturales libres de disolventes.',
    variants: ['escritorio-sculptural', 'escritorio-room'],
  },
  {
    id: 'cama-soundi',
    name: 'Cama Soundi',
    brand: 'LA MUNDIAL',
    category: 'Sala',
    price: 1250,
    image: img('cama-soundi'),
    description:
      'Cabecero tapizado de líneas suaves que convierte el dormitorio en un refugio sereno. Estructura baja de inspiración nórdica.',
    specs: { Material: 'Lino · Pino FSC', Color: 'Gris piedra', Dimensiones: 'Ancho 160cm · Prof. 210cm · Alto 100cm' },
    eco: 'Espuma de base vegetal y textiles con certificación OEKO-TEX.',
    variants: ['cama-soundi', 'cama-room'],
  },
  {
    id: 'vaso-terre',
    name: 'Vaso Terre',
    brand: 'LA MUNDIAL',
    category: 'Iluminación',
    price: 1250,
    image: img('vaso-terre'),
    description:
      'Objeto cerámico de sobremesa que difunde una luz cálida e indirecta. Hecho a torno, cada pieza es ligeramente única.',
    specs: { Material: 'Cerámica esmaltada', Color: 'Terracota', Dimensiones: 'Ø 18cm · Alto 30cm' },
    eco: 'Arcilla local cocida en horno de bajo consumo.',
    variants: ['vaso-terre', 'vaso-detail'],
  },
  {
    id: 'sillon-contour',
    name: 'Sillón Contour',
    brand: 'LA MUNDIAL',
    category: 'Exterior',
    price: 1250,
    image: img('sillon-contour'),
    description:
      'Asiento de exterior con malla técnica transpirable sobre estructura de aluminio. Resiste la intemperie sin perder elegancia.',
    specs: { Material: 'Aluminio · Malla técnica', Color: 'Grafito', Dimensiones: 'Ancho 75cm · Prof. 80cm · Alto 95cm' },
    eco: 'Aluminio reciclado y reciclable al 100%.',
    variants: ['sillon-contour', 'contour-room'],
  },
]

/** Formatea un precio en Lempiras como en los mockups: "L. 1,250". */
export function formatPrice(value) {
  return `L. ${value.toLocaleString('en-US')}`
}
