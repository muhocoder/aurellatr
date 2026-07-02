import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from 'lucide-react'
import { supabase, Product, CATEGORIES } from '@/lib/supabase'
import ProductCard from '@/app/components/ProductCard'

type HomePageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
  onCategory: (c: string) => void
}

const HERO_ITEMS = [
  { label: 'KOLYE', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
  { label: 'BİLEKLİK', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  { label: 'KÜPE', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' },
]

export default function HomePage({ onNavigate, onCategory }: HomePageProps) {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('products').select('*').eq('featured', true).order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => { setFeatured(data || []); setLoading(false) })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 grid grid-cols-3 opacity-30">
          {HERO_ITEMS.map(item => (
            <div key={item.label} className="overflow-hidden">
              <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.4em] text-primary uppercase mb-4 font-light">
              Timeless Minimal Jewelry
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-foreground leading-[1.1] mb-6">
              Zamanın<br />
              <em className="text-primary not-italic">Ötesinde</em><br />
              Güzellik
            </h1>
            <p className="text-base text-muted-foreground font-light mb-8 leading-relaxed">
              Her parça, eşsiz bir hikayenin taşıyıcısıdır.
              Saf altın ve gümüş koleksiyonumuzu keşfedin.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => onNavigate('products')}
                className="flex items-center gap-2 bg-primary text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
                Koleksiyonu Keşfet <ArrowRight size={14} />
              </button>
              <button
                onClick={() => { onCategory('kolye'); onNavigate('products') }}
                className="px-8 py-4 text-xs tracking-widest uppercase border border-foreground hover:bg-foreground hover:text-white transition-colors"
              >
                Yeni Gelenler
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] text-primary uppercase mb-3">Koleksiyonlar</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Kategorileri Keşfedin</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { onCategory(cat.value); onNavigate('products') }}
              className="group flex flex-col items-center gap-3 p-4 border border-border hover:border-primary rounded-sm transition-all hover:bg-secondary"
            >
              <div className="w-16 h-16 rounded-full bg-secondary group-hover:bg-white flex items-center justify-center transition-colors overflow-hidden">
                <Sparkles size={24} className="text-primary" />
              </div>
              <span className="text-xs tracking-[0.2em] uppercase text-foreground/70 group-hover:text-primary transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.4em] text-primary uppercase mb-2">Öne Çıkanlar</p>
              <h2 className="font-serif text-3xl text-foreground">Seçkin Parçalar</h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="hidden md:flex items-center gap-2 text-sm tracking-wider hover:text-primary transition-colors"
            >
              Tümünü Gör <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary rounded-sm mb-4" />
                  <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-muted-foreground mb-4">Henüz ürün eklenmemiş</p>
              <p className="text-sm text-muted-foreground">Admin panelinden ürünlerinizi ekleyerek başlayın.</p>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-sm tracking-wider hover:text-primary transition-colors mx-auto">
              Tümünü Gör <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Features / Trust badges */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Truck, title: 'Ücretsiz Kargo', desc: '500₺ ve üzeri siparişlerde' },
              { icon: Shield, title: 'Güvenli Ödeme', desc: 'Shopier sanal POS güvencesi' },
              { icon: RotateCcw, title: 'Kolay İade', desc: '14 gün içinde iade garantisi' },
              { icon: Sparkles, title: 'Orijinal Ürün', desc: 'Sertifikalı kalite güvencesi' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border border-primary rounded-sm flex items-center justify-center">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wider">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-24 bg-foreground text-white text-center px-4">
        <p className="text-xs tracking-[0.5em] text-primary uppercase mb-4">Aurelle</p>
        <h2 className="font-serif text-4xl md:text-5xl mb-6">
          Her Takı Bir <em className="not-italic text-primary">Hikaye</em>
        </h2>
        <p className="text-white/60 font-light mb-8 max-w-md mx-auto text-sm leading-relaxed">
          En sevdiklerinize ya da kendinize özel bir parça hediye edin.
          Kaliteli işçilik ve zamansız tasarımla.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-primary text-white px-10 py-4 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          Alışverişe Başla
        </button>
      </section>
    </div>
  )
}
