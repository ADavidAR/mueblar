import { useState, useEffect } from 'react'

/*
  Fade de entrada sutil por cambio de página. Solo opacidad (sin transform,
  para no crear un contenedor nuevo para hijos position:fixed) y manejado
  por estado de React en vez de @keyframes, para que nunca quede "trabado"
  invisible si el contenido tarda en cargar.
*/
export default function PageTransition({ pathKey, children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [pathKey])

  return (
    <div className={`transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}
