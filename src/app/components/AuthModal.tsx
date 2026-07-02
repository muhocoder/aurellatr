import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/lib/context'
import logoImg from '@/imports/WhatsApp_Image_2026-06-30_at_16.26.31.jpeg'

export default function AuthModal() {
  const { showAuthModal, authModalMode, closeAuthModal, signIn, signUp, openAuthModal } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!showAuthModal) return null

  const isLogin = authModalMode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        setError('E-posta veya şifre hatalı.')
      } else {
        closeAuthModal()
        setEmail(''); setPassword('')
      }
    } else {
      if (!fullName.trim()) { setError('Ad soyad gereklidir.'); setLoading(false); return }
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setError(error.includes('already') ? 'Bu e-posta zaten kayıtlı.' : error)
      } else {
        setSuccess('Hesabınız oluşturuldu! Giriş yapabilirsiniz.')
        setTimeout(() => { openAuthModal('login') }, 2000)
      }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden">
        <button onClick={closeAuthModal} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoImg} alt="Aurella" className="h-20 w-20 object-contain rounded-full" />
          </div>

          <h2 className="font-serif text-2xl text-center text-foreground mb-1">
            {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Aurella ailesine katılın'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1 uppercase tracking-wider">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/30 transition-colors"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1 uppercase tracking-wider">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/30 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1 uppercase tracking-wider">Şifre</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:outline-none focus:border-primary bg-secondary/30 transition-colors pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Lütfen bekleyin...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
            <button
              onClick={() => { openAuthModal(isLogin ? 'register' : 'login'); setError(''); setSuccess('') }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Üye olun' : 'Giriş yapın'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
