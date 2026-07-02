import { useState, useEffect, useRef } from 'react'
import { Toaster } from 'sonner'
import { AppProvider } from '@/lib/context'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import AuthModal from '@/app/components/AuthModal'
import HomePage from '@/app/pages/HomePage'
import ProductsPage from '@/app/pages/ProductsPage'
import ProductDetailPage from '@/app/pages/ProductDetailPage'
import CartPage from '@/app/pages/CartPage'
import FavoritesPage from '@/app/pages/FavoritesPage'
import AccountPage from '@/app/pages/AccountPage'
import AdminPage from '@/app/pages/AdminPage'
import '@/styles/fonts.css'

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'favorites' | 'account' | 'admin' | 'order-complete'

type RouteState = {
  page: Page
  params: Record<string, string>
}

function parseHash(): RouteState {
  const hash = window.location.hash.replace('#', '')
  if (!hash || hash === '/' || hash === '') return { page: 'home', params: {} }
  if (hash === '/urunler') return { page: 'products', params: {} }
  if (hash.startsWith('/urun/')) return { page: 'product-detail', params: { id: hash.replace('/urun/', '') } }
  if (hash === '/sepet') return { page: 'cart', params: {} }
  if (hash === '/favoriler') return { page: 'favorites', params: {} }
  if (hash === '/hesap') return { page: 'account', params: {} }
  if (hash === '/admin') return { page: 'admin', params: {} }
  if (hash === '/siparis-tamamlandi') return { page: 'order-complete', params: {} }
  return { page: 'home', params: {} }
}

function buildHash(page: Page, params?: Record<string, string>): string {
  switch (page) {
    case 'home': return '#/'
    case 'products': return '#/urunler'
    case 'product-detail': return `#/urun/${params?.id || ''}`
    case 'cart': return '#/sepet'
    case 'favorites': return '#/favoriler'
    case 'account': return '#/hesap'
    case 'admin': return '#/admin'
    case 'order-complete': return '#/siparis-tamamlandi'
    default: return '#/'
  }
}

// Scroll-triggered reveal için hook
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  })
}

function AppContent() {
  const [route, setRoute] = useState<RouteState>(parseHash)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [pageKey, setPageKey] = useState(0)

  useReveal()

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (page: string, params?: Record<string, string>) => {
    const hash = buildHash(page as Page, params)
    window.location.hash = hash.replace('#', '')
    setRoute({ page: page as Page, params: params || {} })
    setPageKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { page, params } = route

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar
        currentPage={page}
        onNavigate={navigate}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategory={setSelectedCategory}
      />

      <main key={pageKey} className="flex-1 page-enter">
        {page === 'home' && (
          <HomePage
            onNavigate={navigate}
            onCategory={setSelectedCategory}
          />
        )}
        {page === 'products' && (
          <ProductsPage
            onNavigate={navigate}
            selectedCategory={selectedCategory}
            onCategory={setSelectedCategory}
            searchQuery={searchQuery}
          />
        )}
        {page === 'product-detail' && (
          <ProductDetailPage
            productId={params.id}
            onNavigate={navigate}
          />
        )}
        {page === 'cart' && (
          <CartPage onNavigate={navigate} />
        )}
        {page === 'favorites' && (
          <FavoritesPage onNavigate={navigate} />
        )}
        {page === 'account' && (
          <AccountPage onNavigate={navigate} />
        )}
        {page === 'admin' && (
          <AdminPage onNavigate={navigate} />
        )}
        {page === 'order-complete' && (
          <OrderCompletePage onNavigate={navigate} />
        )}
      </main>

      <Footer onNavigate={navigate} />
      <AuthModal />
      <Toaster position="top-right" richColors />
    </div>
  )
}

function OrderCompletePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  useEffect(() => {
    // After successful Shopier payment redirect, cart is cleared server-side by webhook
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center page-enter">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Siparişiniz Alındı!</h1>
      <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
        Ödemeniz başarıyla işlendi. Siparişinizin detaylarını e-posta adresinize gönderdik.
      </p>
      <p className="text-muted-foreground text-sm mb-10">
        Siparişinizi <strong>Hesabım → Siparişlerim</strong> bölümünden takip edebilirsiniz.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={() => onNavigate('account')} className="bg-primary text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors duration-200">
          Siparişlerimi Gör
        </button>
        <button onClick={() => onNavigate('products')} className="border border-border px-8 py-3 text-xs tracking-widest uppercase hover:bg-secondary transition-colors duration-200">
          Alışverişe Devam Et
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
