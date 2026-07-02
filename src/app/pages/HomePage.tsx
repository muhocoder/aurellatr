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
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundColor: '#EFE6D8',
        }}
      >
        {/* Sol: opaklıktan şeffafa gradient — resmin kendi yazısını örter, içerik netliğini korur */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFE6D8] via-[#EFE6D8]/85 to-[#EFE6D8]/10" />

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
              bir gün hatırlamak isteyeceğin anlar için.
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

      {/* Features Banner */}
      <section className="w-full">
        <img
          src="/features-banner.png"
          alt="Zamansız. Dayanıklı. Seninle."
          className="w-full h-auto block"
        />
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
      <section
        className="relative flex items-end justify-center text-center pb-12"
        style={{
          backgroundImage: 'url(/banner-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          aspectRatio: '16/9',
          width: '100%',
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 px-4">
          <button
            onClick={() => onNavigate('products')}
            className="bg-primary text-white px-10 py-4 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
          >
            Alışverişe Başla
          </button>
        </div>
      </section>
    </div>
  )
}
