import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Database types
export interface User {
  id: string
  email: string
  role: 'dinas' | 'upt'
  upt_id?: string
  created_at: string
}

export interface UPT {
  id: string
  name: string
  address: string
  phone: string
  created_at: string
}

export interface Medicine {
  id: string
  name: string
  category: string
  unit: string
  stock_initial: number
  stock_current: number
  created_at: string
  updated_at: string
}

export interface MedicineUsage {
  id: string
  medicine_id: string
  upt_id: string
  quantity_used: number
  disease_treated: string
  animal_type: string
  usage_date: string
  notes?: string
  created_at: string
  medicines?: {
    name: string
    unit: string
  }
  upt?: {
    name: string
  }
}

export interface StockTransaction {
  id: string
  medicine_id: string
  upt_id: string
  transaction_type: 'in' | 'out'
  quantity: number
  reason: string
  created_at: string
}

export interface MedicalRecord {
  id: string
  bulan: string
  tanggal: string
  pemilik: string
  alamat_desa: string
  alamat_kecamatan: string
  jenis_ternak: {
    sapi: number
    kerbau: number
    kambing: number
    domba: number
    kucing: number
    kelinci: number
    ayam: number
    anjing: number
    lainnya: number
  }
  total_hewan: number
  gejala_klinis: string[]
  jenis_pengobatan: string
  dosis_ml_ekor: number
  petugas: string
  status: 'AKTIF' | 'PASIF' | 'SEMI AKTIF'
  created_at: string
  updated_at: string
}

export interface AnimalOwner {
  id: string
  name: string
  phone?: string
  address?: string
  village?: string
  district?: string
  created_at: string
  updated_at: string
}

export interface Animal {
  id: string
  owner_id: string
  name?: string
  species: string
  breed?: string
  age_months?: number
  gender?: 'jantan' | 'betina'
  weight_kg?: number
  color?: string
  created_at: string
  updated_at: string
  animal_owners?: AnimalOwner
}

export interface HealthService {
  id: string
  animal_id: string
  upt_id: string
  service_date: string
  service_type: 'pemeriksaan' | 'pengobatan' | 'vaksinasi' | 'operasi' | 'konsultasi'
  chief_complaint?: string
  anamnesis?: string
  physical_examination?: string
  diagnosis?: string
  treatment_plan?: string
  follow_up_notes?: string
  veterinarian_name: string
  status: 'selesai' | 'rawat_jalan' | 'rawat_inap' | 'rujukan'
  created_at: string
  updated_at: string
  animals?: Animal
  upt?: UPT
  health_service_medicines?: HealthServiceMedicine[]
}

export interface HealthServiceMedicine {
  id: string
  health_service_id: string
  medicine_id: string
  quantity_used: number
  dosage?: string
  administration_route?: string
  notes?: string
  created_at: string
  medicines?: Medicine
}