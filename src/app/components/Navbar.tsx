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
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button className="md:hidden text-foreground hover:text-primary transition-colors duration-200" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo — absolute center on mobile, static left on desktop */}
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0 flex items-center gap-2 group"
          >
            <img
              src={logoImg}
              alt="Aurelle"
              className="h-10 w-10 md:h-12 md:w-12 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="hidden sm:block text-left">
              <div className="font-serif text-xl tracking-[0.2em] text-foreground leading-none">AURELLE</div>
              <div className="text-[9px] tracking-[0.3em] text-primary font-light">TIMELESS MINIMAL JEWELRY</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider font-light">
            <button onClick={() => onNavigate('home')} className={`hover:text-primary transition-colors ${currentPage === 'home' ? 'text-primary' : 'text-foreground'}`}>
              ANASAYFA
            </button>
            <div className="relative group">
              <button
                onClick={() => { onCategory(''); onNavigate('products') }}
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className={`flex items-center gap-1 hover:text-primary transition-colors ${currentPage === 'products' ? 'text-primary' : 'text-foreground'}`}
              >
                ÜRÜNLER <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              {catOpen && (
                <div
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  className="absolute top-full left-0 pt-2 min-w-[180px] z-50"
                >
                  <div className="bg-white border border-border rounded-sm shadow-lg py-2">
                    <button
                      onClick={() => { onCategory(''); onNavigate('products'); setCatOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors tracking-wider"
                    >
                      TÜM ÜRÜNLER
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => { onCategory(cat.value); onNavigate('products'); setCatOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors tracking-wider"
                      >
                        {cat.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1 hover:text-primary transition-colors ${currentPage === 'admin' ? 'text-primary' : 'text-foreground'}`}
              >
                <Shield size={14} /> YÖNETİM
              </button>
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground hover:text-primary transition-colors p-1">
              <Search size={20} />
            </button>

            {/* Favorites */}
            <button onClick={handleFavClick} className="text-foreground hover:text-primary transition-colors p-1">
              <Heart size={20} />
            </button>

            {/* Cart */}
            <button onClick={handleCartClick} className="relative text-foreground hover:text-primary transition-colors p-1">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User — visible on all screen sizes (same as original) */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 text-foreground hover:text-primary transition-colors p-1"
                  >
                    <User size={20} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-white border border-border rounded-sm shadow-lg py-2 z-50">
                      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border mb-1 truncate">
                        {user.email}
                      </div>
                      <button
                        onClick={() => { onNavigate('account'); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        Hesabım
                      </button>
                      <button
                        onClick={() => { onNavigate('favorites'); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        Favorilerim
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { onNavigate('admin'); setUserMenuOpen(false) }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors text-primary font-medium"
                        >
                          Admin Paneli
                        </button>
                      )}
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors text-destructive"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => openAuthModal('login')} className="text-foreground hover:text-primary transition-colors p-1">
                  <User size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-3 border-t border-border">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => { onSearch(e.target.value); if (!e.target.value) {} else onNavigate('products') }}
              placeholder="Ürün arayın..."
              className="w-full px-4 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/30"
            />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <nav className="px-6 py-4 space-y-4 text-sm tracking-wider">
            <button onClick={() => { onNavigate('home'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary">ANASAYFA</button>
            <button onClick={() => { onNavigate('products'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary">ÜRÜNLER</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { onCategory(cat.value); onNavigate('products'); setMenuOpen(false) }}
                className="block w-full text-left py-1.5 pl-4 text-muted-foreground hover:text-primary text-xs"
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { onNavigate('account'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary">HESABIM</button>
                <button onClick={() => { onNavigate('favorites'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary">FAVORİLERİM</button>
                {isAdmin && <button onClick={() => { onNavigate('admin'); setMenuOpen(false) }} className="block w-full text-left py-2 text-primary font-medium">ADMİN</button>}
                <button onClick={() => { signOut(); setMenuOpen(false) }} className="block w-full text-left py-2 text-destructive">ÇIKIŞ YAP</button>
              </>
            ) : (
              <button onClick={() => { openAuthModal('login'); setMenuOpen(false) }} className="block w-full text-left py-2 hover:text-primary">GİRİŞ YAP</button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
