import { useState } from 'react'
import { ShoppingBag, Heart, User, Menu, X, Search, ChevronDown, Shield } from 'lucide-react'
import { useApp } from '@/lib/context'
import logoImg from '@/imports/aurelle-logo.png'
import { CATEGORIES } from '@/lib/supabase'

type Page = 'home' | 'products' | 'cart' | 'favorites' | 'account' | 'admin' | 'product-detail'

type NavbarProps = {
  currentPage: Page
  onNavigate: (page: Page, params?: Record<string, string>) => void
  searchQuery: string
  onSearch: (q: string) => void
  selectedCategory: string
  onCategory: (c: string) => void
}

export default function Navbar({ currentPage, onNavigate, searchQuery, onSearch, selectedCategory, onCategory }: NavbarProps) {
  const { user, isAdmin, cartCount, openAuthModal, signOut } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleCartClick = () => {
    if (!user) { openAuthModal('login'); return }
    onNavigate('cart')
  }

  const handleFavClick = () => {
    if (!user) { openAuthModal('login'); return }
    onNavigate('favorites')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-shadow duration-300">
      {/* Top announcement bar */}
      <div className="bg-primary text-white text-xs text-center py-2 tracking-widest font-light">
        ÜCRETSİZ KARGO — 500₺ VE ÜZERİ SİPARİŞLERDE
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button className="md:hidden text-foreground transition-colors duration-200 hover:text-primary" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="block transition-transform duration-200">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </span>
          </button>

          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
            <img
              src={logoImg}
              alt="Aurelle"
              className="h-12 w-12 md:h-14 md:w-14 object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ borderRadius: '4px' }}
            />
            <div className="hidden sm:block text-left">
              <div className="font-serif text-xl tracking-[0.2em] text-foreground leading-none transition-colors duration-200 group-hover:text-primary">AURELLE</div>
              <div className="text-[9px] tracking-[0.3em] text-primary font-light">TIMELESS MINIMAL JEWELRY</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider font-light">
            <button onClick={() => onNavigate('home')} className={`hover:text-primary transition-colors duration-200 ${currentPage === 'home' ? 'text-primary' : 'text-foreground'}`}>
              ANASAYFA
            </button>
            <div className="relative group">
              <button
                onClick={() => { onCategory(''); onNavigate('products') }}
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className={`flex items-center gap-1 hover:text-primary transition-colors duration-200 ${currentPage === 'products' ? 'text-primary' : 'text-foreground'}`}
              >
                ÜRÜNLER <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className={`absolute top-full left-0 pt-2 min-w-[180px] z-50 transition-all duration-200 ${catOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
              >
                <div className="bg-white border border-border rounded-sm shadow-lg py-2">
                  <button
                    onClick={() => { onCategory(''); onNavigate('products'); setCatOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors duration-150 tracking-wider"
                  >
                    Tüm Ürünler
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => { onCategory(cat.value); onNavigate('products'); setCatOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors duration-150 tracking-wider"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-primary transition-colors duration-200">
              <Search size={18} />
            </button>
            <button onClick={handleFavClick} className="p-2 hover:text-primary transition-colors duration-200">
              <Heart size={18} />
            </button>
            <button onClick={handleCartClick} className="p-2 hover:text-primary transition-colors duration-200 relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-medium transition-transform duration-200 scale-100">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className="p-2 hover:text-primary transition-colors duration-200"
              >
                <User size={18} />
              </button>
              <div className={`absolute top-full right-0 pt-2 min-w-[160px] z-50 transition-all duration-200 ${userMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="bg-white border border-border rounded-sm shadow-lg py-2 text-sm">
                  {user ? (
                    <>
                      <button onClick={() => { onNavigate('account'); setUserMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-150 tracking-wider">HESABIM</button>
                      {isAdmin && (
                        <button onClick={() => { onNavigate('admin'); setUserMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-150 tracking-wider text-primary flex items-center gap-2">
                          <Shield size={14} /> ADMİN
                        </button>
                      )}
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-150 tracking-wider text-destructive">ÇIKIŞ YAP</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { openAuthModal('login'); setUserMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-150 tracking-wider">GİRİŞ YAP</button>
                      <button onClick={() => { openAuthModal('register'); setUserMenuOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-150 tracking-wider">KAYIT OL</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-3 border-t border-border">
            <input
              autoFocus={searchOpen}
              type="text"
              value={searchQuery}
              onChange={e => { onSearch(e.target.value); if (!e.target.value) {} else onNavigate('products') }}
              placeholder="Ürün arayın..."
              className="w-full px-4 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/30 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-border bg-white">
          <nav className="px-6 py-4 space-y-4 text-sm tracking-wider">
            <button onClick={() => { onNavigate('home'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary transition-colors duration-200">ANASAYFA</button>
            <button onClick={() => { onNavigate('products'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary transition-colors duration-200">ÜRÜNLER</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { onCategory(cat.value); onNavigate('products'); setMenuOpen(false) }}
                className="block w-full text-left py-1.5 pl-4 text-muted-foreground hover:text-primary text-xs transition-colors duration-200"
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { onNavigate('account'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary transition-colors duration-200">HESABIM</button>
                <button onClick={() => { onNavigate('favorites'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary transition-colors duration-200">FAVORİLERİM</button>
                {isAdmin && <button onClick={() => { onNavigate('admin'); setMenuOpen(false) }} className="block w-full text-left py-2 text-primary font-medium transition-colors duration-200">ADMİN</button>}
                <button onClick={() => { signOut(); setMenuOpen(false) }} className="block w-full text-left py-2 text-destructive transition-colors duration-200">ÇIKIŞ YAP</button>
              </>
            ) : (
              <button onClick={() => { openAuthModal('login'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary transition-colors duration-200">GİRİŞ YAP</button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
