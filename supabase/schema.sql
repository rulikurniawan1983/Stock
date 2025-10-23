-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create UPT table
CREATE TABLE IF NOT EXISTS upt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('dinas', 'upt')),
  upt_id UUID REFERENCES upt(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL,
  stock_initial INTEGER NOT NULL DEFAULT 0,
  stock_current INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine_usage table
CREATE TABLE IF NOT EXISTS medicine_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  disease_treated VARCHAR(255) NOT NULL,
  animal_type VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicine_usage_upt_id ON medicine_usage(upt_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_medicine_id ON medicine_usage(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_date ON medicine_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_upt_id ON stock_transactions(upt_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_medicine_id ON stock_transactions(medicine_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE upt ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for UPT table
CREATE POLICY "Dinas can view all UPT" ON upt
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own data" ON upt
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = upt.id
    )
  );

-- RLS Policies for medicines table
CREATE POLICY "Dinas can manage all medicines" ON medicines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view all medicines" ON medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

-- RLS Policies for medicine_usage table
CREATE POLICY "Dinas can view all medicine usage" ON medicine_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can manage their own medicine usage" ON medicine_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = medicine_usage.upt_id
    )
  );

-- RLS Policies for stock_transactions table
CREATE POLICY "Dinas can view all stock transactions" ON stock_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own stock transactions" ON stock_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = stock_transactions.upt_id
    )
  );

-- Function to update stock_current when medicine_usage is inserted
CREATE OR REPLACE FUNCTION update_medicine_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock_current when medicine is used
  UPDATE medicines 
  SET stock_current = stock_current - NEW.quantity_used,
      updated_at = NOW()
  WHERE id = NEW.medicine_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stock when medicine is used
CREATE TRIGGER trigger_update_medicine_stock
  AFTER INSERT ON medicine_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_medicine_stock();

-- Insert sample UPT data
INSERT INTO upt (id, name, address, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'UPT Puskeswan Kecamatan A', 'Jl. Puskeswan A No. 1', '081234567890'),
  ('22222222-2222-2222-2222-222222222222', 'UPT Puskeswan Kecamatan B', 'Jl. Puskeswan B No. 2', '081234567891'),
  ('33333333-3333-3333-3333-333333333333', 'UPT Puskeswan Kecamatan C', 'Jl. Puskeswan C No. 3', '081234567892'),
  ('44444444-4444-4444-4444-444444444444', 'UPT Puskeswan Kecamatan D', 'Jl. Puskeswan D No. 4', '081234567893'),
  ('55555555-5555-5555-5555-555555555555', 'UPT Puskeswan Kecamatan E', 'Jl. Puskeswan E No. 5', '081234567894'),
  ('66666666-6666-6666-6666-666666666666', 'UPT Puskeswan Kecamatan F', 'Jl. Puskeswan F No. 6', '081234567895')
ON CONFLICT (id) DO NOTHING;

-- Insert sample medicines data
INSERT INTO medicines (name, category, unit, stock_initial, stock_current) VALUES
  ('Antibiotik Amoxicillin', 'Antibiotik', 'tablet', 1000, 1000),
  ('Vitamin B Kompleks', 'Vitamin', 'tablet', 500, 500),
  ('Antiseptik Povidone Iodine', 'Antiseptik', 'ml', 200, 200),
  ('Obat Cacing Albendazole', 'Anthelmintik', 'tablet', 300, 300),
  ('Antibiotik Penicillin', 'Antibiotik', 'vial', 100, 100),
  ('Vitamin C', 'Vitamin', 'tablet', 400, 400),
  ('Antiseptik Chlorhexidine', 'Antiseptik', 'ml', 150, 150),
  ('Obat Cacing Mebendazole', 'Anthelmintik', 'tablet', 250, 250)
ON CONFLICT DO NOTHING;
