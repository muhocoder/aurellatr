import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, CartItem, Product, UserProfile } from './supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

type AppContextType = {
  // Auth
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  authLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>

  // Cart
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  cartLoading: boolean

  // Favorites
  favorites: string[] // product IDs
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  favLoading: boolean

  // Auth modal
  showAuthModal: boolean
  authModalMode: 'login' | 'register'
  openAuthModal: (mode?: 'login' | 'register') => void
  closeAuthModal: () => void

  // Admin config
  adminEmail: string
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('admin@aurella.com')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(false)

  const [favorites, setFavorites] = useState<string[]>([])
  const [favLoading, setFavLoading] = useState(false)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const isAdmin = !!(user && user.email === adminEmail)

  // Load admin config
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/'
    fetch(`${base}config/admin.json`)
      .then(r => r.json())
      .then(d => { if (d.admin_email) setAdminEmail(d.admin_email) })
      .catch(() => {})
  }, [])

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setCartItems([])
      setFavorites([])
      return
    }
    loadProfile()
    loadCart()
    loadFavorites()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  const loadCart = async () => {
    if (!user) return
    setCartLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
    setCartItems(data || [])
    setCartLoading(false)
  }

  const loadFavorites = async () => {
    if (!user) return
    setFavLoading(true)
    const { data } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
    setFavorites((data || []).map(f => f.product_id))
    setFavLoading(false)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: '',
        address: '',
        city: '',
        is_admin: false,
      })
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setCartItems([])
    setFavorites([])
    setProfile(null)
  }

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (!user) { openAuthModal('login'); return }

    const existing = cartItems.find(c => c.product_id === product.id)
    if (existing) {
      const newQty = existing.quantity + quantity
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id)
      setCartItems(prev => prev.map(c => c.id === existing.id ? { ...c, quantity: newQty } : c))
    } else {
      const { data } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity,
      }).select('*, product:products(*)').single()
      if (data) setCartItems(prev => [...prev, data])
    }
  }, [user, cartItems])

  const removeFromCart = useCallback(async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId)
    setCartItems(prev => prev.filter(c => c.id !== cartItemId))
  }, [])

  const updateCartQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(cartItemId); return }
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)
    setCartItems(prev => prev.map(c => c.id === cartItemId ? { ...c, quantity } : c))
  }, [removeFromCart])

  const clearCart = useCallback(async () => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setCartItems([])
  }, [user])

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) { openAuthModal('login'); return }
    const isFav = favorites.includes(productId)
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
      setFavorites(prev => prev.filter(id => id !== productId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId })
      setFavorites(prev => [...prev, productId])
    }
  }, [user, favorites])

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites])

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }

  const closeAuthModal = () => setShowAuthModal(false)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = (item.product as Product)?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  return (
    <AppContext.Provider value={{
      user, profile, isAdmin, authLoading,
      signIn, signUp, signOut,
      cartItems, cartCount, cartTotal,
      addToCart, removeFromCart, updateCartQuantity, clearCart, cartLoading,
      favorites, toggleFavorite, isFavorite, favLoading,
      showAuthModal, authModalMode, openAuthModal, closeAuthModal,
      adminEmail,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
