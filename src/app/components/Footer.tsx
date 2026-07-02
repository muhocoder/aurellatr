import logoImg from '@/imports/WhatsApp_Image_2026-06-30_at_16.26.31.jpeg'
import { Instagram, Mail, Phone } from 'lucide-react'

type FooterProps = {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-foreground text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Aurella" className="h-14 w-14 rounded-full object-contain bg-[#F5EFE6]" />
            <div>
              <div className="font-serif text-xl tracking-[0.2em] text-white">AURELLE</div>
              <div className="text-[9px] tracking-[0.3em] text-primary font-light">TIMELESS MINIMAL JEWELRY</div>
            </div>
          </div>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Zamansız minimal takılarla her anınızı özel kılın.
          </p>
          <div className="flex gap-3 mt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Instagram size={16} />
            </a>
            <a href="mailto:info@aurella.com" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Mail size={16} />
            </a>
            <a href="tel:+905001234567" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase mb-6">Koleksiyonlar</h4>
          <nav className="space-y-3 text-sm font-light">
            {[
              { label: 'Tüm Ürünler', page: 'products' },
              { label: 'Kolye', page: 'products' },
              { label: 'Bileklik', page: 'products' },
              { label: 'Küpe', page: 'products' },
              { label: 'Yüzük', page: 'products' },
              { label: 'Saat', page: 'products' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className="block text-white/50 hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contact & Info */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase mb-6">İletişim</h4>
          <div className="space-y-3 text-sm font-light text-white/50">
            <p>info@aurella.com</p>
            <p>+90 500 123 45 67</p>
            <p className="leading-relaxed">Müşteri hizmetleri<br />Hafta içi 09:00 – 18:00</p>
          </div>
          <div className="mt-6 p-4 border border-white/10 rounded-sm">
            <p className="text-xs text-white/40 leading-relaxed">
              Güvenli ödeme altyapısı Shopier sanal POS tarafından sağlanmaktadır.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/30 tracking-wider">
        © {new Date().getFullYear()} AURELLE — TÜM HAKLARI SAKLIDIR
      </div>
    </footer>
  )
}
