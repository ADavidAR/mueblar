import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import PageTransition from './PageTransition'
import { ArrowUp } from '../ui/icons'

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={handleClick}
      aria-label="Volver al inicio"
      className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted shadow-lg transition-colors hover:border-copper hover:text-copper-light"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

export default function SiteLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        <PageTransition pathKey={pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
