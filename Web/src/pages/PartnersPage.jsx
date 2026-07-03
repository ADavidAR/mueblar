import Figure from '../components/ui/Figure'
import { Eyebrow } from '../components/ui/Tags'

function NosotrosHero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pt-36 md:px-10">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Eyebrow>Quiénes Somos</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink md:text-6xl">
            Nosotros
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            Somos un equipo apasionado por transformar la manera en que las personas
            diseñan sus espacios. Combinamos Realidad Aumentada con el mejor catálogo
            de muebles y decoración para que cada decisión sea una certeza, no una apuesta.
          </p>
        </div>
        <Figure
          src="/images/partners-showroom.jpg"
          tone="office"
          alt="Showroom de mobiliario"
          className="min-h-[260px] md:min-h-[320px]"
        />
      </div>
    </section>
  )
}

function MisionVision() {
  return (
    <section className="mx-auto mt-24 mb-28 max-w-[1280px] px-6 md:px-10">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">

        <div className="bg-panel p-10 md:p-14">
          <Eyebrow className="mb-4">Misión</Eyebrow>
          <h2 className="font-display text-3xl leading-snug text-ink md:text-4xl">
            Diseñar con certeza,{' '}
            <span className="underline decoration-copper decoration-2 underline-offset-8">
              no con suposiciones.
            </span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            Nuestra misión es democratizar el diseño de interiores poniendo en manos
            de cualquier persona una tecnología de Realidad Aumentada accesible y precisa.
            Queremos que cada hondureño pueda ver sus muebles en su espacio real antes
            de tomar cualquier decisión de compra, eliminando la incertidumbre y
            convirtiendo cada remodelación en una experiencia segura, creativa y satisfactoria.
          </p>
        </div>

        <div className="bg-bg p-10 md:p-14">
          <Eyebrow className="mb-4">Visión</Eyebrow>
          <h2 className="font-display text-3xl leading-snug text-ink md:text-4xl">
            El futuro del diseño{' '}
            <span className="underline decoration-copper decoration-2 underline-offset-8">
              está en tu espacio.
            </span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            Aspiramos a ser la plataforma de referencia en Latinoamérica para la
            previsualización de interiores con AR, conectando consumidores, diseñadores
            y fabricantes en un ecosistema digital donde cada espacio se concibe con
            precisión y confianza. Imaginamos un mundo donde remodelar un hogar sea
            tan intuitivo como mover muebles en pantalla.
          </p>
        </div>

      </div>
    </section>
  )
}

export default function PartnersPage() {
  return (
    <>
      <NosotrosHero />
      <MisionVision />
    </>
  )
}
