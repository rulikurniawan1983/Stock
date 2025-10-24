'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Medicine, MedicineUsage, UPT } from '@/lib/supabase'
import { 
  Package, 
  Users, 
  Activity, 
  TrendingDown,
  LogOut,
  Plus,
  Eye,
  Edit,
  Stethoscope,
  Heart
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DinasDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicineUsage, setMedicineUsage] = useState<MedicineUsage[]>([])
  const [upts, setUPTs] = useState<UPT[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddMedicine, setShowAddMedicine] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [medicinesRes, usageRes, uptsRes] = await Promise.all([
        supabase.from('medicines').select('*').order('created_at', { ascending: false }),
        supabase.from('medicine_usage').select(`
          *,
          medicines(name),
          upt(name)
        `).order('created_at', { ascending: false }),
        supabase.from('upt').select('*').order('name')
      ])

      if (medicinesRes.data) setMedicines(medicinesRes.data)
      if (usageRes.data) setMedicineUsage(usageRes.data)
      if (uptsRes.data) setUPTs(uptsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = async (medicineData: any) => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert([medicineData])
        .select()

      if (error) throw error
      
      setMedicines([data[0], ...medicines])
      setShowAddMedicine(false)
    } catch (error) {
      console.error('Error adding medicine:', error)
    }
  }

  const totalStock = medicines.reduce((sum, med) => sum + med.stock_current, 0)
  const lowStockMedicines = medicines.filter(med => med.stock_current < 50)
  const totalUsage = medicineUsage.reduce((sum, usage) => sum + usage.quantity_used, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Dinas</h1>
              <p className="text-gray-600">Manajemen Stock Obat Hewan</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Logged in as: {user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Obat</p>
                <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Rendah</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockMedicines.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">UPT Puskeswan</p>
                <p className="text-2xl font-bold text-gray-900">{upts.length}</p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/rekam-medis/daftar')}>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rekam Medis</p>
                <p className="text-lg font-bold text-purple-600">Lihat Semua</p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pelayanan-kesehatan/daftar')}>
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pelayanan</p>
                <p className="text-lg font-bold text-pink-600">Kesehatan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'medicines', name: 'Daftar Obat' },
                { id: 'usage', name: 'Penggunaan Obat' },
                { id: 'upts', name: 'UPT Puskeswan' },
                { id: 'medical', name: 'Rekam Medis' },
                { id: 'health', name: 'Pelayanan Kesehatan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Obat dengan Stock Rendah</h3>
              <div className="space-y-3">
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">{medicine.name}</span>
                    <span className="text-red-600 font-bold">{medicine.stock_current} {medicine.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Penggunaan Terbaru</h3>
              <div className="space-y-3">
                {medicineUsage.slice(0, 5).map((usage) => (
                  <div key={usage.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{usage.medicines?.name}</p>
                        <p className="text-sm text-gray-600">{usage.upt?.name}</p>
                        <p className="text-sm text-gray-500">{usage.disease_treated}</p>
                      </div>
                      <span className="text-sm font-medium">{usage.quantity_used} {usage.medicines?.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medicines' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Daftar Obat</h3>
              <button
                onClick={() => setShowAddMedicine(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Obat
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Nama Obat</th>
                    <th className="table-header">Kategori</th>
                    <th className="table-header">Stock Awal</th>
                    <th className="table-header">Stock Saat Ini</th>
                    <th className="table-header">Unit</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="table-cell font-medium">{medicine.name}</td>
                      <td className="table-cell">{medicine.category}</td>
                      <td className="table-cell">{medicine.stock_initial}</td>
                      <td className="table-cell">{medicine.stock_current}</td>
                      <td className="table-cell">{medicine.unit}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          medicine.stock_current < 50 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {medicine.stock_current < 50 ? 'Stock Rendah' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Riwayat Penggunaan Obat</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Tanggal</th>
                    <th className="table-header">Obat</th>
                    <th className="table-header">UPT</th>
                    <th className="table-header">Jumlah</th>
                    <th className="table-header">Penyakit</th>
                    <th className="table-header">Jenis Hewan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicineUsage.map((usage) => (
                    <tr key={usage.id}>
                      <td className="table-cell">{new Date(usage.usage_date).toLocaleDateString('id-ID')}</td>
                      <td className="table-cell font-medium">{usage.medicines?.name}</td>
                      <td className="table-cell">{usage.upt?.name}</td>
                      <td className="table-cell">{usage.quantity_used}</td>
                      <td className="table-cell">{usage.disease_treated}</td>
                      <td className="table-cell">{usage.animal_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'upts' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Daftar UPT Puskeswan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upts.map((upt) => (
                <div key={upt.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{upt.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{upt.address}</p>
                  <p className="text-sm text-gray-500 mt-1">{upt.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Rekam Medis Hewan</h3>
              <button
                onClick={() => router.push('/rekam-medis/daftar')}
                className="btn-primary flex items-center gap-2"
              >
                <Stethoscope className="h-4 w-4" />
                Lihat Semua Rekam Medis
              </button>
            </div>
            
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Rekam Medis Hewan</h4>
              <p className="text-gray-600 mb-6">
                Pantau semua rekam medis hewan dari seluruh UPT Puskeswan. Lihat gejala klinis, pengobatan yang diberikan, dan status kesehatan hewan.
              </p>
              <button
                onClick={() => router.push('/rekam-medis/daftar')}
                className="btn-primary"
              >
                Lihat Semua Rekam Medis
              </button>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Pelayanan Kesehatan Hewan</h3>
              <button
                onClick={() => router.push('/pelayanan-kesehatan/daftar')}
                className="btn-primary flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Lihat Semua Pelayanan
              </button>
            </div>
            
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Pelayanan Kesehatan Hewan</h4>
              <p className="text-gray-600 mb-6">
                Pantau semua pelayanan kesehatan hewan dari seluruh UPT Puskeswan. Lihat anamnesis, diagnosis, pengobatan, dan penggunaan obat.
              </p>
              <button
                onClick={() => router.push('/pelayanan-kesehatan/daftar')}
                className="btn-primary"
              >
                Lihat Semua Pelayanan Kesehatan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <AddMedicineModal
          onClose={() => setShowAddMedicine(false)}
          onAdd={handleAddMedicine}
        />
      )}
    </div>
  )
}

function AddMedicineModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    stock_initial: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      stock_current: formData.stock_initial
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Obat Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Obat</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Awal</label>
            <input
              type="number"
              value={formData.stock_initial}
              onChange={(e) => setFormData({ ...formData, stock_initial: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Tambah</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
          </div>
        </form>
      </div>
    </div>
  )
}
