-- ═══════════════════════════════════════════════════════════════
-- AURELLE - Supabase Veritabanı Kurulum SQL'i
-- Supabase Dashboard > SQL Editor > New Query kısmına yapıştırın
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Ürünler tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'diğer',
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 2. Kullanıcı profilleri tablosu ────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 3. Favoriler tablosu ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── 4. Sepet tablosu ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── 5. Siparişler tablosu ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  shopier_order_id TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 6. Yorumlar tablosu ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Products: herkes okuyabilir, sadece admin yazabilir
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by admin" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- User profiles: kullanıcılar kendi profillerini okuyup yazabilir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can upsert own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Favorites: kullanıcılar kendi favorilerini yönetebilir
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Cart: kullanıcılar kendi sepetlerini yönetebilir
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders: kullanıcılar kendi siparişlerini görebilir, admin hepsini
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Reviews: herkes görebilir, kullanıcılar kendi yorumlarını ekleyebilir, admin tümünü yönetebilir
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible reviews are public" ON reviews FOR SELECT USING (visible = true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ═══════════════════════════════════════════════════════════════
-- ÖRNEK ÜRÜNLER (İsteğe bağlı — test için)
-- ═══════════════════════════════════════════════════════════════
-- Aşağıdaki INSERT komutlarını çalıştırarak örnek ürünler ekleyebilirsiniz:

/*
INSERT INTO products (name, description, price, category, images, stock, featured) VALUES
  ('Altın Zincir Kolye', 'İnce 14 ayar altın zincir, zarif ve minimal tasarım.', 1250.00, 'kolye', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'], 10, true),
  ('Solitaire Yüzük', 'Tek taş pırlanta yüzük, 18 ayar altın kasa.', 4500.00, 'yüzük', ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'], 5, true),
  ('İnce Bileklik', 'Çok şık 925 gümüş zincir bileklik.', 650.00, 'bileklik', ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'], 15, true),
  ('Damla Küpe', 'Altın kaplama gümüş damla küpe.', 890.00, 'küpe', ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'], 8, true);
*/

-- ═══════════════════════════════════════════════════════════════
-- ADMİN KULLANICI KURULUMU
-- ═══════════════════════════════════════════════════════════════
-- 1. Supabase > Authentication > Users > Add User ile admin@aurella.com ekleyin
-- 2. Kullanıcı oluştuktan sonra bu SQL'i çalıştırın (UUID'yi kopyalayın):
-- UPDATE user_profiles SET is_admin = true WHERE id = 'ADMIN_USER_UUID_BURAYA';
