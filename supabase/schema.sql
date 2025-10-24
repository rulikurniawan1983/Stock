-- Create UPT table
CREATE TABLE IF NOT EXISTS upt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('dinas', 'upt')),
  upt_id UUID REFERENCES upt(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL,
  stock_initial INTEGER NOT NULL DEFAULT 0,
  stock_current INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 1000,
  expiry_date DATE,
  batch_number VARCHAR(100),
  supplier VARCHAR(255),
  price_per_unit DECIMAL(10,2),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine_usage table
CREATE TABLE IF NOT EXISTS medicine_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  disease_treated VARCHAR(255) NOT NULL,
  animal_type VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL,
  dosage VARCHAR(100),
  administration_route VARCHAR(50),
  veterinarian_name VARCHAR(255),
  patient_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'expired', 'damaged')),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  supplier VARCHAR(255),
  batch_number VARCHAR(100),
  expiry_date DATE,
  reason TEXT,
  reference_number VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicine_usage_upt_id ON medicine_usage(upt_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_medicine_id ON medicine_usage(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_date ON medicine_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_veterinarian ON medicine_usage(veterinarian_name);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_upt_id ON stock_transactions(upt_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_medicine_id ON stock_transactions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_supplier ON medicines(supplier);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_upt_active ON upt(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Create notifications table for system notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table for application configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create backup_logs table for tracking data exports
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  export_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  record_count INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_backup_logs_user_id ON backup_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(export_type);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE upt ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

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
  ('11111111-1111-1111-1111-111111111111', 'UPT Puskeswan 1', 'Jl. Puskeswan 1 No. 1', '081234567890'),
  ('22222222-2222-2222-2222-222222222222', 'UPT Puskeswan 2', 'Jl. Puskeswan 2 No. 2', '081234567891'),
  ('33333333-3333-3333-3333-333333333333', 'UPT Puskeswan 3', 'Jl. Puskeswan 3 No. 3', '081234567892'),
  ('44444444-4444-4444-4444-444444444444', 'UPT Puskeswan 4', 'Jl. Puskeswan 4 No. 4', '081234567893'),
  ('55555555-5555-5555-5555-555555555555', 'UPT Puskeswan 5', 'Jl. Puskeswan 5 No. 5', '081234567894'),
  ('66666666-6666-6666-6666-666666666666', 'UPT Puskeswan 6', 'Jl. Puskeswan 6 No. 6', '081234567895')
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', true),
  ('images', 'images', true),
  ('reports', 'reports', true),
  ('templates', 'templates', true),
  ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create file_uploads table for tracking uploaded files
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  bucket_name VARCHAR(50) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Create indexes for file_uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_bucket ON file_uploads(bucket_name);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_at ON file_uploads(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_mime_type ON file_uploads(mime_type);

-- RLS policies for file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all public files
CREATE POLICY "Public files are viewable by everyone" ON file_uploads
  FOR SELECT USING (is_public = true);

-- Policy: Users can view their own files
CREATE POLICY "Users can view their own files" ON file_uploads
  FOR SELECT USING (auth.uid() = uploaded_by);

-- Policy: Users can insert their own files
CREATE POLICY "Users can insert their own files" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files" ON file_uploads
  FOR UPDATE USING (auth.uid() = uploaded_by);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files" ON file_uploads
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Policy: Dinas can manage all files
CREATE POLICY "Dinas can manage all files" ON file_uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

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
  upt_id UUID REFERENCES upt(id) ON DELETE CASCADE,
  record_number VARCHAR(100),
  follow_up_date DATE,
  follow_up_notes TEXT,
  treatment_cost DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add upt_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medical_records' 
        AND column_name = 'upt_id'
    ) THEN
        ALTER TABLE medical_records ADD COLUMN upt_id UUID REFERENCES upt(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing columns to medicine_usage table if they don't exist
DO $$ 
BEGIN
    -- Add veterinarian_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_usage' 
        AND column_name = 'veterinarian_name'
    ) THEN
        ALTER TABLE medicine_usage ADD COLUMN veterinarian_name VARCHAR(255);
    END IF;
    
    -- Add patient_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_usage' 
        AND column_name = 'patient_name'
    ) THEN
        ALTER TABLE medicine_usage ADD COLUMN patient_name VARCHAR(255);
    END IF;
    
    -- Add dosage column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_usage' 
        AND column_name = 'dosage'
    ) THEN
        ALTER TABLE medicine_usage ADD COLUMN dosage VARCHAR(100);
    END IF;
    
    -- Add administration_route column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_usage' 
        AND column_name = 'administration_route'
    ) THEN
        ALTER TABLE medicine_usage ADD COLUMN administration_route VARCHAR(50);
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_usage' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE medicine_usage ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add missing columns to other tables if they don't exist
DO $$ 
BEGIN
    -- Add missing columns to medicines table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'min_stock_level'
    ) THEN
        ALTER TABLE medicines ADD COLUMN min_stock_level INTEGER DEFAULT 10;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'max_stock_level'
    ) THEN
        ALTER TABLE medicines ADD COLUMN max_stock_level INTEGER DEFAULT 1000;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'expiry_date'
    ) THEN
        ALTER TABLE medicines ADD COLUMN expiry_date DATE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'batch_number'
    ) THEN
        ALTER TABLE medicines ADD COLUMN batch_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'supplier'
    ) THEN
        ALTER TABLE medicines ADD COLUMN supplier VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'price_per_unit'
    ) THEN
        ALTER TABLE medicines ADD COLUMN price_per_unit DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE medicines ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicines' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE medicines ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add missing columns to upt table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'upt' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE upt ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'upt' 
        AND column_name = 'website'
    ) THEN
        ALTER TABLE upt ADD COLUMN website VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'upt' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE upt ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'upt' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE upt ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'upt' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE upt ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add missing columns to users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_tanggal ON medical_records(tanggal);
CREATE INDEX IF NOT EXISTS idx_medical_records_pemilik ON medical_records(pemilik);
CREATE INDEX IF NOT EXISTS idx_medical_records_petugas ON medical_records(petugas);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_upt_id ON medical_records(upt_id);

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

CREATE POLICY "UPT can view their own medical records by upt_id" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
      AND users.upt_id = medical_records.upt_id
    )
  );

-- Create animal_owners table
CREATE TABLE IF NOT EXISTS animal_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  village VARCHAR(255),
  district VARCHAR(255),
  postal_code VARCHAR(10),
  id_number VARCHAR(50),
  occupation VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
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
  microchip_id VARCHAR(100),
  birth_date DATE,
  health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'sick', 'recovering', 'quarantine')),
  vaccination_status VARCHAR(20) DEFAULT 'unknown' CHECK (vaccination_status IN ('up_to_date', 'overdue', 'unknown')),
  last_vaccination_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_services table
CREATE TABLE IF NOT EXISTS health_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  upt_id UUID NOT NULL REFERENCES upt(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('pemeriksaan', 'pengobatan', 'vaksinasi', 'operasi', 'konsultasi', 'emergency', 'follow_up')),
  chief_complaint TEXT,
  anamnesis TEXT,
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_notes TEXT,
  veterinarian_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('selesai', 'rawat_jalan', 'rawat_inap', 'rujukan', 'pending', 'cancelled')),
  service_number VARCHAR(100),
  total_cost DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  next_appointment DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_service_medicines table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS health_service_medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_service_id UUID NOT NULL REFERENCES health_services(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  dosage VARCHAR(100),
  administration_route VARCHAR(50),
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_gender ON animals(gender);
CREATE INDEX IF NOT EXISTS idx_health_services_animal_id ON health_services(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_services_upt_id ON health_services(upt_id);
CREATE INDEX IF NOT EXISTS idx_health_services_date ON health_services(service_date);
CREATE INDEX IF NOT EXISTS idx_health_services_type ON health_services(service_type);
CREATE INDEX IF NOT EXISTS idx_health_services_status ON health_services(status);
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

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for audit_logs table
CREATE POLICY "Dinas can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "UPT can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'upt'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for system_settings table
CREATE POLICY "Dinas can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'dinas'
    )
  );

CREATE POLICY "Users can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

-- RLS Policies for backup_logs table
CREATE POLICY "Users can view their own backup logs" ON backup_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup logs" ON backup_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample medicines data
INSERT INTO medicines (name, category, unit, stock_initial, stock_current) VALUES
  ('Antibiotik Amoxicillin', 'Antibiotik', 'tablet', 1000, 1000),
  ('Vitamin B Kompleks', 'Vitamin', 'tablet', 500, 500),
  ('Antiseptik Povidone Iodine', 'Antiseptik', 'ml', 200, 200),
  ('Obat Cacing Albendazole', 'Anthelmintik', 'tablet', 300, 300),
  ('Antibiotik Penicillin', 'Antibiotik', 'vial', 100, 100),
  ('Vitamin C', 'Vitamin', 'tablet', 400, 400),
  ('Antiseptik Chlorhexidine', 'Antiseptik', 'ml', 150, 150),
  ('Obat Cacing Mebendazole', 'Anthelmintik', 'tablet', 250, 250),
  ('Antibiotik Tetracycline', 'Antibiotik', 'tablet', 800, 800),
  ('Vitamin A', 'Vitamin', 'ml', 300, 300),
  ('Antiseptik Betadine', 'Antiseptik', 'ml', 250, 250),
  ('Obat Cacing Pyrantel', 'Anthelmintik', 'tablet', 400, 400),
  ('Antibiotik Gentamicin', 'Antibiotik', 'vial', 50, 50),
  ('Vitamin D3', 'Vitamin', 'ml', 200, 200),
  ('Antiseptik Alkohol 70%', 'Antiseptik', 'ml', 500, 500),
  ('Obat Cacing Ivermectin', 'Anthelmintik', 'ml', 100, 100),
  ('Antibiotik Ciprofloxacin', 'Antibiotik', 'tablet', 600, 600),
  ('Vitamin E', 'Vitamin', 'tablet', 300, 300),
  ('Antiseptik Hidrogen Peroksida', 'Antiseptik', 'ml', 150, 150),
  ('Obat Cacing Fenbendazole', 'Anthelmintik', 'tablet', 350, 350)
ON CONFLICT DO NOTHING;

-- Insert sample animal owners
INSERT INTO animal_owners (id, name, phone, address, village, district) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 123', 'Desa Sukamaju', 'Kecamatan Sukajaya'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Siti Rahayu', '081234567891', 'Jl. Pahlawan No. 45', 'Desa Makmur', 'Kecamatan Sukajaya'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ahmad Wijaya', '081234567892', 'Jl. Sejahtera No. 67', 'Desa Sejahtera', 'Kecamatan Sukajaya'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Maya Sari', '081234567893', 'Jl. Bahagia No. 89', 'Desa Bahagia', 'Kecamatan Sukajaya'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Rudi Hartono', '081234567894', 'Jl. Damai No. 12', 'Desa Damai', 'Kecamatan Sukajaya'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Dewi Lestari', '081234567895', 'Jl. Indah No. 34', 'Desa Indah', 'Kecamatan Sukajaya')
ON CONFLICT (id) DO NOTHING;

-- Insert sample animals
INSERT INTO animals (id, owner_id, name, species, breed, age_months, gender, weight_kg, color) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sapi Merah', 'sapi', 'Sapi Bali', 24, 'betina', 350.5, 'Merah'),
  ('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kambing Hitam', 'kambing', 'Kambing Kacang', 18, 'jantan', 45.2, 'Hitam'),
  ('cccccccc-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ayam Jago', 'ayam', 'Ayam Kampung', 12, 'jantan', 2.1, 'Merah'),
  ('dddddddd-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Kucing Putih', 'kucing', 'Kucing Persia', 8, 'betina', 3.5, 'Putih'),
  ('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Anjing Coklat', 'anjing', 'Anjing Kampung', 36, 'jantan', 15.8, 'Coklat'),
  ('ffffffff-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Domba Putih', 'domba', 'Domba Garut', 30, 'betina', 55.3, 'Putih')
ON CONFLICT (id) DO NOTHING;

-- Insert sample health services
INSERT INTO health_services (id, animal_id, upt_id, service_date, service_type, chief_complaint, anamnesis, physical_examination, diagnosis, treatment_plan, follow_up_notes, veterinarian_name, status) VALUES
  ('aaaaaaaa-aaaa-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2024-01-15', 'pemeriksaan', 'Sapi tidak mau makan', 'Sapi sudah 3 hari tidak mau makan, terlihat lesu', 'Suhu tubuh 39.5°C, nafsu makan menurun, feses encer', 'Demam dan gangguan pencernaan', 'Pemberian antibiotik dan vitamin', 'Kontrol dalam 3 hari', 'Dr. Ahmad Wijaya', 'selesai'),
  ('bbbbbbbb-bbbb-2222-2222-222222222222', 'bbbbbbbb-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2024-01-16', 'pengobatan', 'Kambing batuk-batuk', 'Kambing batuk sejak 5 hari lalu, nafsu makan menurun', 'Batuk kering, suhu normal, pernapasan agak cepat', 'Infeksi saluran pernapasan', 'Antibiotik dan ekspektoran', 'Istirahat dan pemberian pakan bergizi', 'Dr. Ahmad Wijaya', 'rawat_jalan'),
  ('cccccccc-cccc-3333-3333-333333333333', 'cccccccc-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '2024-01-17', 'vaksinasi', 'Vaksinasi rutin', 'Vaksinasi rutin untuk ayam', 'Kondisi ayam sehat, tidak ada gejala penyakit', 'Sehat', 'Vaksinasi ND dan AI', 'Kontrol vaksinasi berikutnya dalam 3 bulan', 'Dr. Siti Rahayu', 'selesai'),
  ('dddddddd-dddd-4444-4444-444444444444', 'dddddddd-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '2024-01-18', 'pemeriksaan', 'Kucing muntah-muntah', 'Kucing sering muntah, tidak mau makan', 'Suhu normal, perut terasa keras, muntah kuning', 'Gangguan pencernaan', 'Obat anti muntah dan diet khusus', 'Berikan makanan lunak', 'Dr. Siti Rahayu', 'rawat_jalan'),
  ('eeeeeeee-eeee-5555-5555-555555555555', 'eeeeeeee-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '2024-01-19', 'operasi', 'Anjing terluka', 'Anjing terluka di kaki belakang', 'Luka dalam di kaki belakang, perdarahan aktif', 'Luka dalam', 'Operasi penjahitan luka', 'Istirahat total, kontrol luka setiap hari', 'Dr. Budi Santoso', 'rawat_inap'),
  ('ffffffff-ffff-6666-6666-666666666666', 'ffffffff-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '2024-01-20', 'konsultasi', 'Domba tidak subur', 'Domba betina tidak kunjung bunting', 'Kondisi fisik normal, siklus reproduksi tidak teratur', 'Gangguan reproduksi', 'Terapi hormonal dan perbaikan nutrisi', 'Kontrol reproduksi dalam 2 bulan', 'Dr. Budi Santoso', 'rawat_jalan')
ON CONFLICT (id) DO NOTHING;

-- Insert sample health service medicines
INSERT INTO health_service_medicines (health_service_id, medicine_id, quantity_used, dosage, administration_route, notes) VALUES
  ('aaaaaaaa-aaaa-1111-1111-111111111111', (SELECT id FROM medicines WHERE name = 'Antibiotik Amoxicillin' LIMIT 1), 10, '2x1 hari', 'oral', 'Diberikan selama 5 hari'),
  ('aaaaaaaa-aaaa-1111-1111-111111111111', (SELECT id FROM medicines WHERE name = 'Vitamin B Kompleks' LIMIT 1), 5, '1x1 hari', 'oral', 'Diberikan selama 7 hari'),
  ('bbbbbbbb-bbbb-2222-2222-222222222222', (SELECT id FROM medicines WHERE name = 'Antibiotik Penicillin' LIMIT 1), 2, '1x1 hari', 'injeksi', 'Suntikan intramuskular'),
  ('bbbbbbbb-bbbb-2222-2222-222222222222', (SELECT id FROM medicines WHERE name = 'Vitamin C' LIMIT 1), 3, '1x1 hari', 'oral', 'Diberikan selama 5 hari'),
  ('cccccccc-cccc-3333-3333-333333333333', (SELECT id FROM medicines WHERE name = 'Vitamin A' LIMIT 1), 1, '1x1 hari', 'oral', 'Vaksinasi rutin'),
  ('dddddddd-dddd-4444-4444-444444444444', (SELECT id FROM medicines WHERE name = 'Antibiotik Tetracycline' LIMIT 1), 4, '2x1 hari', 'oral', 'Diberikan selama 3 hari'),
  ('eeeeeeee-eeee-5555-5555-555555555555', (SELECT id FROM medicines WHERE name = 'Antiseptik Povidone Iodine' LIMIT 1), 50, '1x1 hari', 'topikal', 'Pembersihan luka'),
  ('eeeeeeee-eeee-5555-5555-555555555555', (SELECT id FROM medicines WHERE name = 'Antibiotik Gentamicin' LIMIT 1), 1, '1x1 hari', 'injeksi', 'Suntikan intramuskular'),
  ('ffffffff-ffff-6666-6666-666666666666', (SELECT id FROM medicines WHERE name = 'Vitamin E' LIMIT 1), 2, '1x1 hari', 'oral', 'Terapi hormonal'),
  ('ffffffff-ffff-6666-6666-666666666666', (SELECT id FROM medicines WHERE name = 'Obat Cacing Albendazole' LIMIT 1), 1, '1x1 hari', 'oral', 'Pemberian obat cacing')
ON CONFLICT DO NOTHING;

-- Insert sample medical records
INSERT INTO medical_records (bulan, tanggal, pemilik, alamat_desa, alamat_kecamatan, jenis_ternak, total_hewan, gejala_klinis, jenis_pengobatan, dosis_ml_ekor, petugas, status) VALUES
  ('Januari 2024', '2024-01-15', 'Budi Santoso', 'Desa Sukamaju', 'Kecamatan Sukajaya', '{"sapi": 1, "kerbau": 0, "kambing": 0, "domba": 0, "kucing": 0, "kelinci": 0, "ayam": 0, "anjing": 0, "lainnya": 0}', 1, '{"Demam", "Anorexia", "Enteritis/Diare"}', 'Antibiotik Amoxicillin', 10.0, 'Dr. Ahmad Wijaya', 'AKTIF'),
  ('Januari 2024', '2024-01-16', 'Siti Rahayu', 'Desa Makmur', 'Kecamatan Sukajaya', '{"sapi": 0, "kerbau": 0, "kambing": 1, "domba": 0, "kucing": 0, "kelinci": 0, "ayam": 0, "anjing": 0, "lainnya": 0}', 1, '{"CRD/SNOT", "Anorexia"}', 'Antibiotik Penicillin', 2.0, 'Dr. Ahmad Wijaya', 'AKTIF'),
  ('Januari 2024', '2024-01-17', 'Ahmad Wijaya', 'Desa Sejahtera', 'Kecamatan Sukajaya', '{"sapi": 0, "kerbau": 0, "kambing": 0, "domba": 0, "kucing": 0, "kelinci": 0, "ayam": 5, "anjing": 0, "lainnya": 0}', 5, '{"Vaksinasi rabie"}', 'Vitamin A', 1.0, 'Dr. Siti Rahayu', 'AKTIF'),
  ('Januari 2024', '2024-01-18', 'Maya Sari', 'Desa Bahagia', 'Kecamatan Sukajaya', '{"sapi": 0, "kerbau": 0, "kambing": 0, "domba": 0, "kucing": 1, "kelinci": 0, "ayam": 0, "anjing": 0, "lainnya": 0}', 1, '{"Maldigesti", "Anorexia"}', 'Antibiotik Tetracycline', 4.0, 'Dr. Siti Rahayu', 'AKTIF'),
  ('Januari 2024', '2024-01-19', 'Rudi Hartono', 'Desa Damai', 'Kecamatan Sukajaya', '{"sapi": 0, "kerbau": 0, "kambing": 0, "domba": 0, "kucing": 0, "kelinci": 0, "ayam": 0, "anjing": 1, "lainnya": 0}', 1, '{"Luka", "Infeksi Luar"}', 'Antiseptik Povidone Iodine', 50.0, 'Dr. Budi Santoso', 'AKTIF'),
  ('Januari 2024', '2024-01-20', 'Dewi Lestari', 'Desa Indah', 'Kecamatan Sukajaya', '{"sapi": 0, "kerbau": 0, "kambing": 0, "domba": 1, "kucing": 0, "kelinci": 0, "ayam": 0, "anjing": 0, "lainnya": 0}', 1, '{"Prolapsusuteri", "Anorexia"}', 'Vitamin E', 2.0, 'Dr. Budi Santoso', 'SEMI AKTIF')
ON CONFLICT DO NOTHING;

-- Update existing medical records with upt_id
UPDATE medical_records 
SET upt_id = '11111111-1111-1111-1111-111111111111' 
WHERE pemilik IN ('Budi Santoso', 'Siti Rahayu') 
AND upt_id IS NULL;

UPDATE medical_records 
SET upt_id = '22222222-2222-2222-2222-222222222222' 
WHERE pemilik IN ('Ahmad Wijaya', 'Maya Sari') 
AND upt_id IS NULL;

UPDATE medical_records 
SET upt_id = '33333333-3333-3333-3333-333333333333' 
WHERE pemilik IN ('Rudi Hartono', 'Dewi Lestari') 
AND upt_id IS NULL;

-- Insert sample medicine usage
INSERT INTO medicine_usage (medicine_id, upt_id, quantity_used, disease_treated, animal_type, usage_date, notes) VALUES
  ((SELECT id FROM medicines WHERE name = 'Antibiotik Amoxicillin' LIMIT 1), '11111111-1111-1111-1111-111111111111', 10, 'Demam dan gangguan pencernaan', 'Sapi', '2024-01-15', 'Pengobatan sapi yang tidak mau makan'),
  ((SELECT id FROM medicines WHERE name = 'Vitamin B Kompleks' LIMIT 1), '11111111-1111-1111-1111-111111111111', 5, 'Demam dan gangguan pencernaan', 'Sapi', '2024-01-15', 'Vitamin untuk meningkatkan nafsu makan'),
  ((SELECT id FROM medicines WHERE name = 'Antibiotik Penicillin' LIMIT 1), '11111111-1111-1111-1111-111111111111', 2, 'Infeksi saluran pernapasan', 'Kambing', '2024-01-16', 'Pengobatan kambing yang batuk-batuk'),
  ((SELECT id FROM medicines WHERE name = 'Vitamin C' LIMIT 1), '11111111-1111-1111-1111-111111111111', 3, 'Infeksi saluran pernapasan', 'Kambing', '2024-01-16', 'Vitamin untuk meningkatkan daya tahan tubuh'),
  ((SELECT id FROM medicines WHERE name = 'Vitamin A' LIMIT 1), '22222222-2222-2222-2222-222222222222', 1, 'Vaksinasi rutin', 'Ayam', '2024-01-17', 'Vaksinasi rutin untuk ayam'),
  ((SELECT id FROM medicines WHERE name = 'Antibiotik Tetracycline' LIMIT 1), '22222222-2222-2222-2222-222222222222', 4, 'Gangguan pencernaan', 'Kucing', '2024-01-18', 'Pengobatan kucing yang muntah-muntah'),
  ((SELECT id FROM medicines WHERE name = 'Antiseptik Povidone Iodine' LIMIT 1), '33333333-3333-3333-3333-333333333333', 50, 'Luka dalam', 'Anjing', '2024-01-19', 'Pembersihan luka anjing yang terluka'),
  ((SELECT id FROM medicines WHERE name = 'Antibiotik Gentamicin' LIMIT 1), '33333333-3333-3333-3333-333333333333', 1, 'Luka dalam', 'Anjing', '2024-01-19', 'Antibiotik untuk mencegah infeksi luka'),
  ((SELECT id FROM medicines WHERE name = 'Vitamin E' LIMIT 1), '33333333-3333-3333-3333-333333333333', 2, 'Gangguan reproduksi', 'Domba', '2024-01-20', 'Terapi hormonal untuk domba yang tidak subur'),
  ((SELECT id FROM medicines WHERE name = 'Obat Cacing Albendazole' LIMIT 1), '33333333-3333-3333-3333-333333333333', 1, 'Gangguan reproduksi', 'Domba', '2024-01-20', 'Obat cacing untuk domba yang tidak subur')
ON CONFLICT DO NOTHING;

-- Insert sample system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('app_name', 'Sistem Manajemen Obat Hewan', 'Nama aplikasi', 'general', true),
  ('app_version', '2.1.0', 'Versi aplikasi', 'general', true),
  ('maintenance_mode', 'false', 'Mode maintenance', 'system', false),
  ('max_file_size', '10485760', 'Maksimal ukuran file upload (bytes)', 'upload', true),
  ('allowed_file_types', 'xlsx,xls,csv', 'Tipe file yang diizinkan', 'upload', true),
  ('backup_retention_days', '30', 'Hari retensi backup', 'backup', false),
  ('notification_enabled', 'true', 'Notifikasi aktif', 'notification', true),
  ('audit_log_enabled', 'true', 'Audit log aktif', 'audit', false),
  ('stock_alert_threshold', '10', 'Threshold alert stok rendah', 'inventory', true),
  ('export_limit_per_day', '10', 'Limit export per hari', 'export', false)
ON CONFLICT (key) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url) VALUES
  ((SELECT id FROM users WHERE role = 'dinas' LIMIT 1), 'Selamat Datang', 'Selamat datang di sistem manajemen obat hewan', 'info', '/dinas'),
  ((SELECT id FROM users WHERE role = 'upt' LIMIT 1), 'Stok Rendah', 'Beberapa obat memiliki stok yang rendah', 'warning', '/upt'),
  ((SELECT id FROM users WHERE role = 'upt' LIMIT 1), 'Export Berhasil', 'Data berhasil diekspor ke Excel', 'success', '/upt')
ON CONFLICT DO NOTHING;
