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
