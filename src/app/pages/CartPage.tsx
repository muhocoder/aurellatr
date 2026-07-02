import { useState } from 'react'
import { Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react'
import { useApp } from '@/lib/context'
import { supabase } from '@/lib/supabase'
import { redirectToShopier, loadShopierConfig } from '@/lib/shopier'
import { Product } from '@/lib/supabase'

type CartPageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cartItems, cartTotal, removeFromCart, updateCartQuantity, clearCart, user, profile } = useApp()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    email: user?.email || '',
  })
  const [showForm, setShowForm] = useState(false)
  const [noShopier, setNoShopier] = useState(false)

  const PLACEHOLDER = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80'

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutLoading(true)
    setNoShopier(false)

    const config = await loadShopierConfig()
    if (!config) {
      setNoShopier(true)
      setCheckoutLoading(false)
      return
    }

    // Create order in Supabase
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      name: (item.product as Product)?.name || '',
      price: (item.product as Product)?.price || 0,
      quantity: item.quantity,
    }))

    const { data: order } = await supabase.from('orders').insert({
      user_id: user!.id,
      items: orderItems,
      total: cartTotal,
      status: 'pending',
    }).select().single()

    if (!order) { setCheckoutLoading(false); return }

    const [buyerName, ...surnameParts] = checkoutForm.fullName.trim().split(' ')
    const buyerSurname = surnameParts.join(' ') || '-'

    const callbackUrl = window.location.origin + window.location.pathname + '#/siparis-tamamlandi'

    await redirectToShopier(config, {
      buyerName,
      buyerSurname,
      buyerEmail: checkoutForm.email,
      buyerPhone: checkoutForm.phone,
      buyerAddress: checkoutForm.address,
      buyerCity: checkoutForm.city,
      totalAmount: cartTotal,
      currency: 0,
      platformOrderId: order.id,
      productName: `Aurelle Sipariş #${order.id.slice(0, 8)}`,
      callbackUrl,
    })

    setCheckoutLoading(false)
  }

  if (cartItems.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto mb-6" />
      <h2 className="font-serif text-3xl text-foreground mb-3">Sepetiniz boş</h2>
      <p className="text-muted-foreground text-sm mb-8">Koleksiyonumuzu keşfederek başlayın.</p>
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
      >
        Alışverişe Başla <ArrowLeft size={14} className="rotate-180" />
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => onNavigate('products')} className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-3xl">Sepetim</h1>
        <span className="text-sm text-muted-foreground">({cartItems.length} ürün)</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => {
            const product = item.product as Product
            const image = product?.images?.[0] || PLACEHOLDER
            return (
              <div key={item.id} className="flex gap-4 p-4 border border-border rounded-sm hover:border-primary/30 transition-colors">
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-sm bg-secondary cursor-pointer" onClick={() => onNavigate('product-detail', { id: item.product_id })}>
                  <img src={image} alt={product?.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">{product?.category}</p>
                  <h3 className="font-serif text-base text-foreground mb-2 truncate cursor-pointer hover:text-primary" onClick={() => onNavigate('product-detail', { id: item.product_id })}>
                    {product?.name}
                  </h3>
                  <p className="text-sm font-medium text-foreground mb-3">{product?.price?.toLocaleString('tr-TR')} ₺</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-sm">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-secondary transition-colors text-sm">−</button>
                      <span className="px-3 py-1.5 text-sm border-x border-border">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-secondary transition-colors text-sm">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <p className="font-medium">{((product?.price || 0) * item.quantity).toLocaleString('tr-TR')} ₺</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-sm p-6 sticky top-32">
            <h2 className="font-serif text-xl mb-6 pb-4 border-b border-border">Sipariş Özeti</h2>

            <div className="space-y-3 mb-6">
              {cartItems.map(item => {
                const product = item.product as Product
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{product?.name} × {item.quantity}</span>
                    <span className="flex-shrink-0">{((product?.price || 0) * item.quantity).toLocaleString('tr-TR')} ₺</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Ara Toplam</span>
                <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Kargo</span>
                <span className={cartTotal >= 500 ? 'text-green-600' : ''}>
                  {cartTotal >= 500 ? 'Ücretsiz' : '29,90 ₺'}
                </span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                <span>Toplam</span>
                <span className="text-primary">{(cartTotal + (cartTotal >= 500 ? 0 : 29.90)).toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            {cartTotal < 500 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Ücretsiz kargo için {(500 - cartTotal).toLocaleString('tr-TR')} ₺ daha ekleyin
              </p>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-6 py-4 bg-primary text-white text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={16} /> Ödemeye Geç
            </button>
          </div>
        </div>
      </div>

      {/* Checkout form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-sm shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-2xl mb-6">Teslimat Bilgileri</h2>

            {noShopier && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Shopier yapılandırması gerekli.</strong> Lütfen <code className="bg-amber-100 px-1">/config/shopier.json</code> dosyasına API bilgilerinizi ekleyin.
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Ad Soyad</label>
                  <input type="text" value={checkoutForm.fullName} onChange={e => setCheckoutForm(f => ({ ...f, fullName: e.target.value }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">E-posta</label>
                  <input type="email" value={checkoutForm.email} onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Telefon</label>
                  <input type="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} required placeholder="05XX XXX XXXX" className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Adres</label>
                  <textarea value={checkoutForm.address} onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))} required rows={2} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Şehir</label>
                  <input type="text" value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-border text-sm hover:bg-secondary transition-colors">
                  İptal
                </button>
                <button type="submit" disabled={checkoutLoading} className="flex-1 py-3 bg-primary text-white text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <CreditCard size={15} /> {checkoutLoading ? 'Yönlendiriliyor...' : 'Shopier ile Öde'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
