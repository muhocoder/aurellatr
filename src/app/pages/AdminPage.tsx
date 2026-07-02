import { useEffect, useState, useRef } from 'react'
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Package, Star, Users, ShoppingCart,
  X, Check, BarChart3, ArrowLeft, Image as ImageIcon, ToggleLeft, ToggleRight
} from 'lucide-react'
import { supabase, Product, Review, Order, CATEGORIES } from '@/lib/supabase'
import { useApp } from '@/lib/context'

type AdminPageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

type AdminTab = 'dashboard' | 'products' | 'reviews' | 'orders'

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: 0,
  category: 'kolye',
  images: [''],
  stock: 1,
  featured: false,
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, isAdmin } = useApp()
  const [tab, setTab] = useState<AdminTab>('dashboard')

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [formData, setFormData] = useState(EMPTY_PRODUCT)
  const [formImages, setFormImages] = useState([''])
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Reviews
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Dashboard stats
  const [stats, setStats] = useState({ products: 0, orders: 0, reviews: 0, revenue: 0 })

  useEffect(() => {
    if (!isAdmin) return
    loadDashboard()
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    if (tab === 'products') loadProducts()
    if (tab === 'reviews') loadReviews()
    if (tab === 'orders') loadOrders()
  }, [tab, isAdmin])

  const loadDashboard = async () => {
    const [p, o, r] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
    ])
    const revenue = (o.data || []).reduce((s: number, o: any) => s + (o.total || 0), 0)
    setStats({ products: p.count || 0, orders: o.data?.length || 0, reviews: r.count || 0, revenue })
  }

  const loadProducts = async () => {
    setProductsLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setProductsLoading(false)
  }

  const loadReviews = async () => {
    setReviewsLoading(true)
    const { data } = await supabase.from('reviews').select('*, user_profiles(full_name), products(name)').order('created_at', { ascending: false })
    setReviews(data || [])
    setReviewsLoading(false)
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setOrdersLoading(false)
  }

  const openAddProduct = () => {
    setEditProduct(null)
    setFormData(EMPTY_PRODUCT)
    setFormImages([''])
    setShowProductForm(true)
  }

  const openEditProduct = (product: Product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      images: product.images || [''],
      stock: product.stock,
      featured: product.featured,
    })
    setFormImages(product.images?.length ? product.images : [''])
    setShowProductForm(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    const images = formImages.filter(img => img.trim() !== '')
    const payload = { ...formData, images, price: Number(formData.price), stock: Number(formData.stock) }

    if (editProduct?.id) {
      await supabase.from('products').update(payload).eq('id', editProduct.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    setShowProductForm(false)
    await loadProducts()
    await loadDashboard()
    setFormLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setDeleteConfirm(null)
    await loadProducts()
    await loadDashboard()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ featured: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const toggleReviewVisibility = async (id: string, current: boolean) => {
    await supabase.from('reviews').update({ visible: !current }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, visible: !current } : r))
  }

  const deleteReview = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o))
  }

  if (!user || !isAdmin) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="font-serif text-2xl text-muted-foreground">Erişim Reddedildi</p>
      <button onClick={() => onNavigate('home')} className="mt-4 text-primary hover:underline text-sm">Ana sayfaya dön</button>
    </div>
  )

  const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  const STATUS_LABELS: Record<string, string> = { pending: 'Beklemede', paid: 'Ödendi', shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal' }

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'products', label: 'Ürünler', icon: Package },
    { key: 'reviews', label: 'Yorumlar', icon: Star },
    { key: 'orders', label: 'Siparişler', icon: ShoppingCart },
  ] as const

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Admin Paneli</h1>
            <p className="text-sm text-muted-foreground mt-1">Aurelle Yönetim Merkezi</p>
          </div>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Siteye Dön
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border mb-8 gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Ürünler', value: stats.products, icon: Package, color: 'text-primary' },
                { label: 'Siparişler', value: stats.orders, icon: ShoppingCart, color: 'text-blue-500' },
                { label: 'Yorumlar', value: stats.reviews, icon: Star, color: 'text-yellow-500' },
                { label: 'Toplam Gelir', value: `${stats.revenue.toLocaleString('tr-TR')} ₺`, icon: BarChart3, color: 'text-green-500' },
              ].map(item => (
                <div key={item.label} className="border border-border rounded-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground tracking-wider uppercase">{item.label}</span>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <p className="text-2xl font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="border border-border rounded-sm p-6">
              <h3 className="font-medium mb-4">Hızlı Eylemler</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setTab('products'); setTimeout(openAddProduct, 100) }} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-sm rounded-sm hover:bg-primary/90 transition-colors">
                  <Plus size={14} /> Yeni Ürün Ekle
                </button>
                <button onClick={() => setTab('orders')} className="flex items-center gap-2 border border-border px-5 py-2.5 text-sm rounded-sm hover:bg-secondary transition-colors">
                  <ShoppingCart size={14} /> Siparişleri Gör
                </button>
                <button onClick={() => setTab('reviews')} className="flex items-center gap-2 border border-border px-5 py-2.5 text-sm rounded-sm hover:bg-secondary transition-colors">
                  <Star size={14} /> Yorumları Yönet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl">Ürün Yönetimi ({products.length})</h2>
              <button onClick={openAddProduct} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-sm hover:bg-primary/90 transition-colors rounded-sm">
                <Plus size={14} /> Yeni Ürün
              </button>
            </div>

            {productsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-secondary animate-pulse rounded-sm" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-sm">
                <Package size={40} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz ürün yok. İlk ürününüzü ekleyin!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Ürün</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Kategori</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Fiyat</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Stok</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Öne Çıkan</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm overflow-hidden bg-secondary flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              ) : <ImageIcon size={14} className="m-auto mt-3 text-muted-foreground" />}
                            </div>
                            <span className="font-medium truncate max-w-[160px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground capitalize">{product.category}</td>
                        <td className="py-3 px-3 font-medium">{product.price.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-sm ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button onClick={() => toggleFeatured(product.id, product.featured)} className={`transition-colors ${product.featured ? 'text-primary' : 'text-muted-foreground'}`}>
                            {product.featured ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditProduct(product)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => setDeleteConfirm(product.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                              <Trash2 size={15} />
                            </button>
                            <button onClick={() => onNavigate('product-detail', { id: product.id })} className="text-muted-foreground hover:text-primary transition-colors p-1">
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div>
            <h2 className="font-serif text-xl mb-6">Yorum Yönetimi ({reviews.length})</h2>
            {reviewsLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-secondary animate-pulse rounded-sm" />)}</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Henüz yorum yok.</p></div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review: any) => (
                  <div key={review.id} className={`border rounded-sm p-4 ${!review.visible ? 'opacity-50 bg-secondary/30' : 'border-border'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-sm font-medium">{review.user_profiles?.full_name || 'Kullanıcı'}</span>
                          <span className="text-xs text-muted-foreground">→ {review.products?.name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= review.rating ? '#C4A05C' : 'none'} className="text-primary" />)}
                          </div>
                          {!review.visible && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-sm">Gizli</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">{new Date(review.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <button onClick={() => toggleReviewVisibility(review.id, review.visible)} className="text-muted-foreground hover:text-primary transition-colors p-1" title={review.visible ? 'Gizle' : 'Göster'}>
                          {review.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => deleteReview(review.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-serif text-xl mb-6">Sipariş Yönetimi ({orders.length})</h2>
            {ordersLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-secondary animate-pulse rounded-sm" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Henüz sipariş yok.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Sipariş</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Ürünler</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Tutar</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Tarih</th>
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3 px-3 max-w-[200px]">
                          <p className="text-xs text-muted-foreground truncate">
                            {(order.items as any[]).map((item: any) => `${item.name} ×${item.quantity}`).join(', ')}
                          </p>
                        </td>
                        <td className="py-3 px-3 font-medium">{order.total.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3 px-3">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-border rounded-sm px-2 py-1 focus:outline-none focus:border-primary bg-white"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Product Form Modal ── */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProductForm(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-serif text-xl">{editProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
              <button onClick={() => setShowProductForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Ürün Adı *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Fiyat (₺) *</label>
                  <input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Kategori *</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20">
                    {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Stok Adedi *</label>
                  <input type="number" min="0" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: Number(e.target.value) }))} required className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button type="button" onClick={() => setFormData(f => ({ ...f, featured: !f.featured }))}>
                    {formData.featured ? <ToggleRight size={28} className="text-primary" /> : <ToggleLeft size={28} className="text-muted-foreground" />}
                  </button>
                  <label className="text-sm">Öne Çıkan Ürün</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Açıklama</label>
                  <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20 resize-none" placeholder="Ürün açıklaması..." />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Ürün Görselleri (URL)</label>
                <div className="space-y-2">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={img}
                        onChange={e => {
                          const updated = [...formImages]
                          updated[idx] = e.target.value
                          setFormImages(updated)
                        }}
                        placeholder="https://örnek.com/resim.jpg"
                        className="flex-1 px-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20"
                      />
                      {img && <img src={img} alt="" className="w-10 h-10 object-cover rounded-sm border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                      {formImages.length > 1 && (
                        <button type="button" onClick={() => setFormImages(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formImages.length < 6 && (
                    <button type="button" onClick={() => setFormImages(prev => [...prev, ''])} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Plus size={12} /> Görsel Ekle
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 py-3 border border-border text-sm hover:bg-secondary transition-colors rounded-sm">
                  İptal
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-primary text-white text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-sm flex items-center justify-center gap-2">
                  <Check size={15} /> {formLoading ? 'Kaydediliyor...' : (editProduct ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-sm p-6 shadow-xl max-w-sm w-full">
            <h3 className="font-serif text-lg mb-3">Ürünü Sil</h3>
            <p className="text-sm text-muted-foreground mb-5">Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-border text-sm hover:bg-secondary transition-colors rounded-sm">İptal</button>
              <button onClick={() => handleDeleteProduct(deleteConfirm)} className="flex-1 py-2.5 bg-destructive text-white text-sm hover:bg-destructive/90 transition-colors rounded-sm">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
