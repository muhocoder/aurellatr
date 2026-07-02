import logoImg from '@/imports/aurelle-logo.png'
import { Instagram, Mail, Phone } from 'lucide-react'

type FooterProps = {
  onNavigate: (page: string) => void
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-foreground text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Aurella"
              className="h-14 w-14 object-contain"
              style={{ mixBlendMode: 'lighten' }}
            />
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
            <a href="mailto:halebimuhaned@gmail.com" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Mail size={16} />
            </a>
            <a href="tel:+905366422984" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Phone size={16} />
            </a>
            <a href="https://wa.me/905366422984" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/20 rounded-sm flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <WhatsAppIcon size={16} />
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
            <p>halebimuhaned@gmail.com</p>
            <p>+90 536 642 29 84</p>
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
