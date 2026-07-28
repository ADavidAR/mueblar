import { Link } from 'react-router-dom'
import Figure from '../ui/Figure'
import { Heart, Trash } from '../ui/icons'

const TONES = ['warm', 'stone', 'amber', 'sage', 'dark', 'office']
function toneFor(key) {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}

export default function ProductCard({ model, name, category, price, thumbnail, favorited, onToggleFavorite, onRemove }) {
  return (
    <div className="group">
      <div className="relative">
        <Link to={`/view/catalog/${encodeURIComponent(model)}`}>
          <Figure
            src={thumbnail}
            tone={toneFor(model)}
            alt={name}
            className="aspect-square cursor-pointer"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {onRemove ? (
          <button
            onClick={(e) => { e.preventDefault(); onRemove() }}
            aria-label="Quitar de la colección"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-red-400 backdrop-blur-sm transition-colors hover:bg-red-900/60 hover:text-red-300"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        ) : onToggleFavorite ? (
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite() }}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 ${
              favorited ? 'text-copper-light' : 'text-ink-soft'
            }`}
          >
            <Heart className="h-3.5 w-3.5" filled={favorited} />
          </button>
        ) : null}
      </div>

      <Link to={`/view/catalog/${encodeURIComponent(model)}`} className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg text-ink">{name}</h3>
          {category && (
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.15em] text-faint">{category}</p>
          )}
        </div>
        <span className="shrink-0 text-sm text-copper-light">
          {price != null ? `L.${Number(price).toLocaleString('es-HN')}` : '—'}
        </span>
      </Link>
    </div>
  )
}
