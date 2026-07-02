import { useEffect, useState } from 'react'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { supabase, Product, CATEGORIES } from '@/lib/supabase'
import ProductCard from '@/app/components/ProductCard'

type ProductsPageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
  selectedCategory: string
  onCategory: (c: string) => void
  searchQuery: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Yeniden Eskiye' },
  { value: 'price_asc', label: 'Fiyat: Artan' },
  { value: 'price_desc', label: 'Fiyat: Azalan' },
  { value: 'featured', label: 'Öne Çıkanlar' },
]

export default function ProductsPage({ onNavigate, selectedCategory, onCategory, searchQuery }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [filterPrice, setFilterPrice] = useState(50000)

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, sort])

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*')
    if (selectedCategory) query = query.eq('category', selectedCategory)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (sort === 'price_desc') query = query.order('price', { ascending: false })
    else if (sort === 'featured') query = query.eq('featured', true).order('created_at', { ascending: false })
    const { data } = await query
    const all = data || []
    const maxP = all.reduce((m, p) => Math.max(m, p.price), 0) || 50000
    setMaxPrice(maxP)
    setFilterPrice(maxP)
    setProducts(all)
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPrice = p.price <= filterPrice
    return matchSearch && matchPrice
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-primary uppercase mb-2">
          {selectedCategory ? CATEGORIES.find(c => c.value === selectedCategory)?.label : 'Tüm Ürünler'}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          {searchQuery ? `"${searchQuery}" için sonuçlar` : (selectedCategory ? CATEGORIES.find(c => c.value === selectedCategory)?.label : 'Koleksiyonumuz')}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{filtered.length} ürün</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-sm hover:border-primary transition-colors"
          >
            <SlidersHorizontal size={14} /> Filtrele
          </button>
          {selectedCategory && (
            <button
              onClick={() => onCategory('')}
              className="flex items-center gap-1.5 text-xs bg-secondary px-3 py-2 rounded-sm hover:bg-secondary/80 transition-colors"
            >
              {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              <X size={12} />
            </button>
          )}
          {/* Category pills */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCategory('')}
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${!selectedCategory ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}
            >
              Tümü
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => onCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${selectedCategory === cat.value ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm border border-border px-3 py-2 rounded-sm focus:outline-none focus:border-primary bg-white"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="mb-6 p-5 border border-border rounded-sm bg-secondary/20">
          <h4 className="text-xs tracking-wider uppercase mb-4 font-medium">Fiyat Filtresi</h4>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">0 ₺</span>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={filterPrice}
              onChange={e => setFilterPrice(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-medium min-w-[80px] text-right">{filterPrice.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded-sm mb-4" />
              <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-muted-foreground mb-3">Ürün bulunamadı</p>
          <p className="text-sm text-muted-foreground mb-6">Farklı bir arama terimi veya kategori deneyin.</p>
          <button onClick={() => onCategory('')} className="text-sm text-primary hover:underline">Tüm ürünlere dön</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}
