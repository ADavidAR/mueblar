import Button from '../ui/Button'

/*
  Sección hero de la Home: imagen de interior a sangre completa, oscurecida con
  un degradado (más fuerte a la izquierda para legibilidad), con titular,
  subtítulo y dos CTA alineados a la izquierda y centrados verticalmente.
*/

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src="/images/hero-sala.jpg"
        alt="Sala de estar de diseño"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Oscurecido para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Contenido */}
      <div className="relative mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl leading-[1.08] text-ink sm:text-6xl lg:text-7xl">
            Redefine tu espacio con{' '}
            <span className="text-copper-light">Realidad Aumentada</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft/85">
            La curaduría de diseño más exclusiva del mundo, proyectada
            directamente en tu hogar con precisión milimétrica.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button to="/colecciones" variant="primary" size="lg">
              Ver Colecciones
            </Button>
            <Button to="/descargar" variant="outline" size="lg">
              Descargar App
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
