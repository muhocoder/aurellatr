import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useApp } from '@/lib/context'
import { Product } from '@/lib/supabase'

type ProductCardProps = {
  product: Product
  onNavigate: (page: string, params?: Record<string, string>) => void
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80'

export default function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { isFavorite, toggleFavorite, addToCart, user, openAuthModal } = useApp()
  const isFav = isFavorite(product.id)
  const image = product.images?.[0] || PLACEHOLDER

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { openAuthModal('login'); return }
    addToCart(product)
  }

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onNavigate('product-detail', { id: product.id })}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-sm mb-4">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
        />

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-white text-[10px] tracking-widest px-2 py-1 uppercase">Öne Çıkan</span>
          </div>
        )}

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm tracking-widest text-foreground/70 font-medium">TÜKENDİ</span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-white text-foreground text-xs font-medium tracking-wider py-2.5 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={13} /> SEPETE EKLE
          </button>
          <button
            onClick={handleFav}
            className={`w-10 bg-white flex items-center justify-center py-2.5 hover:bg-primary hover:text-white transition-colors ${isFav ? 'text-primary' : 'text-foreground'}`}
          >
            <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">{product.category}</p>
        <h3 className="font-serif text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-foreground">
          {product.price.toLocaleString('tr-TR')} ₺
        </p>
      </div>
    </div>
  )
}
