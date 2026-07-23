import { useState, useEffect } from 'react'

/**
 * Simula el progreso de "escaneo" de la vista AR (mock): sube hasta `target`
 * y se mantiene. Reemplazable por el progreso real del motor AR a futuro.
 */
export function useScanProgress(target = 84, stepMs = 90) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPercent((prev) => {
        if (prev >= target) {
          clearInterval(id)
          return target
        }
        return Math.min(prev + Math.ceil(Math.random() * 6), target)
      })
    }, stepMs)
    return () => clearInterval(id)
  }, [target, stepMs])

  return percent
}
