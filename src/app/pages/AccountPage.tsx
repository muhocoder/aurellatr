import { useState, useEffect } from 'react'
import { User, Package, MapPin, Save } from 'lucide-react'
import { supabase, Order } from '@/lib/supabase'
import { useApp } from '@/lib/context'

type AccountPageProps = {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Ödendi', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700' },
}

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { user, profile, signOut } = useApp()
  const [tab, setTab] = useState<'profile' | 'orders'>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name, phone: profile.phone, address: profile.address, city: profile.city })
  }, [profile])

  useEffect(() => {
    if (tab === 'orders' && user) loadOrders()
  }, [tab, user])

  const loadOrders = async () => {
    setOrdersLoading(true)
    const { data } = await supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
    setOrders(data || [])
    setOrdersLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    await supabase.from('user_profiles').upsert({ id: user!.id, ...form, is_admin: profile?.is_admin || false })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    setSaveLoading(false)
  }

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <User size={48} className="text-muted-foreground/30 mx-auto mb-6" />
      <h2 className="font-serif text-3xl mb-3">Hesabım</h2>
      <p className="text-muted-foreground text-sm">Hesabınıza giriş yapmalısınız.</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Hesabım</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <button onClick={() => { signOut(); onNavigate('home') }} className="text-sm text-destructive hover:underline">Çıkış Yap</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {([
          { key: 'profile', label: 'Profil', icon: User },
          { key: 'orders', label: 'Siparişlerim', icon: Package },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider border-b-2 transition-colors -mb-px ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Ad Soyad</label>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Telefon</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Adres</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={3} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20 resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Şehir</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/20" />
          </div>
          {saveSuccess && <p className="text-sm text-green-600">Profil güncellendi!</p>}
          <button type="submit" disabled={saveLoading} className="flex items-center gap-2 bg-primary text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save size={14} /> {saveLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-secondary animate-pulse rounded-sm" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-serif text-xl text-muted-foreground mb-2">Henüz sipariş vermediniz</p>
              <button onClick={() => onNavigate('products')} className="text-sm text-primary hover:underline mt-2">Alışverişe başla</button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending
                return (
                  <div key={order.id} className="border border-border rounded-sm p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Sipariş #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-sm font-medium ${status.color}`}>{status.label}</span>
                        <span className="font-medium text-sm">{order.total.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(order.items as any[]).map((item, i) => (
                        <span key={i}>{item.name} × {item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
