import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kkyoysucqmhkpxdjiaaa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_15abO5W7wbqHgL4SKuOaSQ_4Vr6jaVi'
// Admin client — used only for storage uploads in AdminPage (bypasses RLS)
// Set VITE_SUPABASE_SERVICE_KEY in .env.local (dev) and Vercel env vars (prod)
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : supabase

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
  featured: boolean
  created_at: string
}

export type UserProfile = {
  id: string
  full_name: string
  phone: string
  address: string
  city: string
  is_admin: boolean
  created_at: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export type Favorite = {
  id: string
  user_id: string
  product_id: string
  product?: Product
}

export type Order = {
  id: string
  user_id: string
  items: { product_id: string; name: string; price: number; quantity: number }[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  shopier_order_id: string
  created_at: string
}

export type Review = {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string
  visible: boolean
  created_at: string
  user_profiles?: { full_name: string }
}

export const CATEGORIES = [
  { value: 'kolye', label: 'Kolye' },
  { value: 'bileklik', label: 'Bileklik' },
  { value: 'yüzük', label: 'Yüzük' },
  { value: 'küpe', label: 'Küpe' },
  { value: 'saat', label: 'Saat' },
  { value: 'set', label: 'Set' },
  { value: 'diğer', label: 'Diğer' },
]
