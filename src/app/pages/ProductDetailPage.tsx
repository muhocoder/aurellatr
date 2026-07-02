import { useEffect, useState } from 'react'
import { Heart, ShoppingBag, Star, ArrowLeft, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, Product, Review } from '@/lib/supabase'
import { useApp } from '@/lib/context'
import ProductCard from '@/app/components/ProductCard'

type ProductDetailPageProps = {
  productId: string
  onNavigate: (page: string, params?: Record<string, string>) => void
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const { addToCart, toggleFavorite, isFavorite, user, openAuthModal, profile } = useApp()

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').eq('id', productId).single()
    if (data) {
      setProduct(data)
      loadRelated(data.category, data.id)
      loadReviews(data.id)
    }
    setLoading(false)
  }

  const loadRelated = async (category: string, excludeId: string) => {
    const { data } = await supabase.from('products').select('*').eq('category', category).neq('id', excludeId).limit(4)
    setRelated(data || [])
  }

  const loadReviews = async (pid: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*, user_profiles(full_name)')
      .eq('product_id', pid)
      .eq('visible', true)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { openAuthModal('login'); return }
    setReviewLoading(true)
    await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: productId,
      rating: reviewRating,
      comment: reviewText,
      visible: true,
    })
    setReviewText('')
    setReviewRating(5)
    setReviewSuccess(true)
    await loadReviews(productId)
    setTimeout(() => setReviewSuccess(false), 3000)
    setReviewLoading(false)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="animate-pulse grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-secondary rounded-sm" />
        <div className="space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-10 bg-secondary rounded w-2/3" />
          <div className="h-8 bg-secondary rounded w-1/4" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
      <p className="font-serif text-2xl text-muted-foreground">Ürün bulunamadı</p>
      <button onClick={() => onNavigate('products')} className="mt-4 text-primary hover:underline text-sm">Ürünlere dön</button>
    </div>
  )

  const images = product.images?.length ? product.images : [PLACEHOLDER]
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
  const isFav = isFavorite(product.id)

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <button onClick={() => onNavigate('products')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={14} /> Ürünler
        </button>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary mb-4">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-sm hover:bg-white transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-sm hover:bg-white transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm border-2 transition-colors ${activeImg === i ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.3em] text-primary uppercase mb-2">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill={s <= Math.round(avgRating) ? '#C4A05C' : 'none'} className="text-primary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({reviews.length} yorum)</span>
              </div>
            )}

            <p className="text-3xl font-medium text-foreground mb-6">{product.price.toLocaleString('tr-TR')} ₺</p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-light">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `Stokta (${product.stock} adet)` : 'Tükendi'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs tracking-wider uppercase text-muted-foreground">Adet</span>
                <div className="flex items-center border border-border rounded-sm">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary transition-colors text-sm">−</button>
                  <span className="px-4 py-2 text-sm border-x border-border min-w-[50px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-secondary transition-colors text-sm">+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => addToCart(product, qty)}
                disabled={product.stock === 0}
                className="flex-1 bg-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Sepete Ekle
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-14 border flex items-center justify-center transition-colors ${isFav ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary hover:text-primary'}`}
              >
                <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="border border-border rounded-sm p-4 space-y-3">
              {[
                { icon: Truck, text: '500₺ ve üzeri siparişlerde ücretsiz kargo' },
                { icon: Shield, text: 'Güvenli Shopier sanal POS ödeme' },
                { icon: RotateCcw, text: '14 gün iade garantisi' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon size={15} className="text-primary flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl mb-8 pb-4 border-b border-border">Yorumlar</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz yorum yok. İlk yorumu siz yapın!</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-border rounded-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{(review.user_profiles as any)?.full_name || 'Kullanıcı'}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} fill={s <= review.rating ? '#C4A05C' : 'none'} className="text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{new Date(review.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add review */}
            <div>
              <h3 className="text-sm font-medium tracking-wider uppercase mb-4">Yorum Yap</h3>
              {!user ? (
                <div className="border border-border rounded-sm p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Yorum yapmak için giriş yapmalısınız.</p>
                  <button onClick={() => openAuthModal('login')} className="text-sm text-primary hover:underline">Giriş Yap</button>
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Puan</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewRating(s)}>
                          <Star size={24} fill={s <= reviewRating ? '#C4A05C' : 'none'} className="text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Yorumunuz</label>
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      rows={4}
                      required
                      placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                      className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20 resize-none"
                    />
                  </div>
                  {reviewSuccess && <p className="text-sm text-green-600">Yorumunuz eklendi!</p>}
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-3 bg-foreground text-white text-xs tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl mb-8 pb-4 border-b border-border">Benzer Ürünler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
