import { useEffect, useState } from 'react'
import { Heart, ArrowLeft } from 'lucide-react'
import { supabase, Product } from '@/lib/supabase'
import { useApp } from '@/lib/context'
import ProductCard from '@/app/components/ProductCard'

type FavoritesPageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const { favorites, user } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.length === 0) { setProducts([]); setLoading(false); return }
    supabase.from('products').select('*').in('id', favorites)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [favorites])

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <Heart size={48} className="text-muted-foreground/30 mx-auto mb-6" />
      <h2 className="font-serif text-3xl mb-3">Favorileriniz</h2>
      <p className="text-muted-foreground text-sm mb-6">Favorilerinizi görmek için giriş yapmalısınız.</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => onNavigate('products')} className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-3xl">Favorilerim</h1>
        {products.length > 0 && <span className="text-sm text-muted-foreground">({products.length} ürün)</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse aspect-[3/4] bg-secondary rounded-sm" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-muted-foreground/30 mx-auto mb-6" />
          <p className="font-serif text-2xl text-muted-foreground mb-3">Henüz favori eklemediniz</p>
          <p className="text-sm text-muted-foreground mb-8">Beğendiğiniz ürünleri kalp ikonuna tıklayarak kaydedin.</p>
          <button onClick={() => onNavigate('products')} className="bg-primary text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Ürünleri Keşfet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  )
}
