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

-- Drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

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
DROP TRIGGER IF EXISTS trigger_update_medicine_stock ON medicine_usage;
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

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bulan VARCHAR(50) NOT NULL,
  tanggal DATE NOT NULL,
  pemilik VARCHAR(255) NOT NULL,
  alamat_desa VARCHAR(255) NOT NULL,
  alamat_kecamatan VARCHAR(255) NOT NULL,
  jenis_ternak JSONB NOT NULL,
  total_hewan INTEGER NOT NULL DEFAULT 0,
  gejala_klinis TEXT[],
  jenis_pengobatan VARCHAR(255) NOT NULL,
  dosis_ml_ekor DECIMAL(10,2) NOT NULL,
  petugas VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('AKTIF', 'PASIF', 'SEMI AKTIF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_tanggal ON medical_records(tanggal);
CREATE INDEX IF NOT EXISTS idx_medical_records_pemilik ON medical_records(pemilik);
CREATE INDEX IF NOT EXISTS idx_medical_records_petugas ON medical_records(petugas);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);

-- Enable RLS for medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records table
CREATE POLICY "Dinas can view all medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

CREATE POLICY "Dinas can insert medical records" ON medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can insert medical records" ON medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

-- Create animal_owners table
CREATE TABLE IF NOT EXISTS animal_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  village VARCHAR(255),
  district VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES animal_owners(id) ON DELETE CASCADE,
  name VARCHAR(255),
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age_months INTEGER,
  gender VARCHAR(10) CHECK (gender IN ('jantan', 'betina')),
  weight_kg DECIMAL(5,2),
  color VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_services table
CREATE TABLE IF NOT EXISTS health_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('pemeriksaan', 'pengobatan', 'vaksinasi', 'operasi', 'konsultasi')),
  chief_complaint TEXT,
  anamnesis TEXT,
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_notes TEXT,
  veterinarian_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('selesai', 'rawat_jalan', 'rawat_inap', 'rujukan')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_service_medicines table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS health_service_medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_service_id UUID NOT NULL REFERENCES health_services(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  dosage VARCHAR(100),
  administration_route VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_health_services_animal_id ON health_services(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_services_upt_id ON health_services(upt_id);
CREATE INDEX IF NOT EXISTS idx_health_services_date ON health_services(service_date);
CREATE INDEX IF NOT EXISTS idx_health_service_medicines_service_id ON health_service_medicines(health_service_id);
CREATE INDEX IF NOT EXISTS idx_health_service_medicines_medicine_id ON health_service_medicines(medicine_id);

-- Enable RLS for new tables
ALTER TABLE animal_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_service_medicines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animal_owners table
CREATE POLICY "Dinas can view all animal owners" ON animal_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view animal owners in their area" ON animal_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

CREATE POLICY "UPT can insert animal owners" ON animal_owners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

-- RLS Policies for animals table
CREATE POLICY "Dinas can view all animals" ON animals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view animals in their area" ON animals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

CREATE POLICY "UPT can insert animals" ON animals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

-- RLS Policies for health_services table
CREATE POLICY "Dinas can view all health services" ON health_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own health services" ON health_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = health_services.upt_id
    )
  );

CREATE POLICY "UPT can insert health services" ON health_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = health_services.upt_id
    )
  );

-- RLS Policies for health_service_medicines table
CREATE POLICY "Dinas can view all health service medicines" ON health_service_medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own health service medicines" ON health_service_medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = (
        SELECT upt_id FROM health_services WHERE id = health_service_medicines.health_service_id
      )
    )
  );

CREATE POLICY "UPT can insert health service medicines" ON health_service_medicines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.upt_id = (
        SELECT upt_id FROM health_services WHERE id = health_service_medicines.health_service_id
      )
    )
  );

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
