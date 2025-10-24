'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Medicine, MedicineUsage } from '@/lib/supabase'
import { 
  Package, 
  Activity, 
  Plus,
  LogOut,
  Calendar,
  FileText,
  Stethoscope,
  Heart,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ExcelImportModal from './ExcelImportModal'
import * as ExcelJS from 'exceljs'

export default function UPTDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicineUsage, setMedicineUsage] = useState<MedicineUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUsage, setShowAddUsage] = useState(false)
  const [showMedicalDropdown, setShowMedicalDropdown] = useState(false)
  const [showExcelImport, setShowExcelImport] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }

      const [medicinesRes, usageRes] = await Promise.all([
        supabase.from('medicines').select('*').order('name'),
        supabase.from('medicine_usage')
          .select(`
            *,
            medicines(name, unit)
          `)
          .eq('upt_id', user?.upt_id)
          .order('created_at', { ascending: false })
      ])

      if (medicinesRes.data) setMedicines(medicinesRes.data)
      if (usageRes.data) setMedicineUsage(usageRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUsage = async (usageData: any) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      const { data, error } = await supabase
        .from('medicine_usage')
        .insert([{
          ...usageData,
          upt_id: user?.upt_id
        }])
        .select(`
          *,
          medicines(name, unit)
        `)

      if (error) throw error
      
      setMedicineUsage([data[0], ...medicineUsage])
      setShowAddUsage(false)
      
      // Refresh medicines to update stock
      const { data: updatedMedicines } = await supabase
        .from('medicines')
        .select('*')
        .order('name')
      
      if (updatedMedicines) setMedicines(updatedMedicines)
    } catch (error) {
      console.error('Error adding usage:', error)
    }
  }

  const handleExcelImportSuccess = () => {
    // Refresh data after successful import
    fetchData()
    setShowExcelImport(false)
  }

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Riwayat Penggunaan Obat')

      // Set headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Nama Obat', key: 'medicine', width: 25 },
        { header: 'Jumlah', key: 'quantity', width: 15 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Penyakit', key: 'disease', width: 25 },
        { header: 'Jenis Hewan', key: 'animal', width: 20 },
        { header: 'Catatan', key: 'notes', width: 30 }
      ]

      // Style headers
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add data
      medicineUsage.forEach((usage) => {
        worksheet.addRow({
          date: new Date(usage.usage_date).toLocaleDateString('id-ID'),
          medicine: usage.medicines?.name || '',
          quantity: usage.quantity_used,
          unit: usage.medicines?.unit || '',
          disease: usage.disease_treated || '',
          animal: usage.animal_type || '',
          notes: usage.notes || ''
        })
      })

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        if (column.eachCell) {
          column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.value) {
              const columnLength = cell.value.toString().length
              if (column.width && columnLength > column.width) {
                column.width = columnLength + 2
              }
            }
          })
        }
      })

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `Riwayat_Penggunaan_Obat_${currentDate}.xlsx`

      // Save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Gagal mengexport data ke Excel. Silakan coba lagi.')
    }
  }

  const totalUsage = medicineUsage.reduce((sum, usage) => sum + usage.quantity_used, 0)
  const thisMonthUsage = medicineUsage.filter(usage => {
    const usageDate = new Date(usage.usage_date)
    const now = new Date()
    return usageDate.getMonth() === now.getMonth() && usageDate.getFullYear() === now.getFullYear()
  }).reduce((sum, usage) => sum + usage.quantity_used, 0)

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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard UPT</h1>
              <p className="text-gray-600">Manajemen Penggunaan Obat Hewan</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Obat Tersedia</p>
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
                <p className="text-sm font-medium text-gray-600">Total Penggunaan</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">{thisMonthUsage}</p>
              </div>
            </div>
          </div>

          <div className="card relative">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Pelayanan Hewan</p>
                <p className="text-lg font-bold text-purple-600">Tambah Baru</p>
              </div>
              <button
                onClick={() => setShowMedicalDropdown(!showMedicalDropdown)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showMedicalDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Dropdown Menu */}
            {showMedicalDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/pelayanan-terpadu')
                      setShowMedicalDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 bg-blue-50"
                  >
                    <Heart className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Form Terpadu (Rekomended)</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      router.push('/rekam-medis')
                      setShowMedicalDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Tambah Pelayanan Lapangan
                  </button>
                  <button
                    onClick={() => {
                      router.push('/pelayanan-kesehatan')
                      setShowMedicalDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Tambah Pelayanan Klinik Hewan
                  </button>
                </div>
              </div>
            )}
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
                { id: 'medical', name: 'Kesehatan Hewan' }
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
                {medicines.filter(med => med.stock_current < 50).slice(0, 5).map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">{medicine.name}</span>
                    <span className="text-red-600 font-bold">{medicine.stock_current} {medicine.unit}</span>
                  </div>
                ))}
                {medicines.filter(med => med.stock_current < 50).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Semua obat memiliki stock yang cukup</p>
                )}
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
                        <p className="text-sm text-gray-600">{usage.disease_treated}</p>
                        <p className="text-sm text-gray-500">{usage.animal_type}</p>
                      </div>
                      <span className="text-sm font-medium">{usage.quantity_used} {usage.medicines?.unit}</span>
                    </div>
                  </div>
                ))}
                {medicineUsage.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Belum ada penggunaan obat</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medicines' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Daftar Obat Tersedia</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Nama Obat</th>
                    <th className="table-header">Kategori</th>
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
                      <td className="table-cell">{medicine.stock_current}</td>
                      <td className="table-cell">{medicine.unit}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          medicine.stock_current < 50 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {medicine.stock_current < 50 ? 'Stock Rendah' : 'Tersedia'}
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Riwayat Penggunaan Obat</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
                <button
                  onClick={() => setShowExcelImport(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Excel
                </button>
                <button
                  onClick={() => setShowAddUsage(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Penggunaan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Tanggal</th>
                    <th className="table-header">Obat</th>
                    <th className="table-header">Jumlah</th>
                    <th className="table-header">Penyakit</th>
                    <th className="table-header">Jenis Hewan</th>
                    <th className="table-header">Catatan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicineUsage.map((usage) => (
                    <tr key={usage.id}>
                      <td className="table-cell">{new Date(usage.usage_date).toLocaleDateString('id-ID')}</td>
                      <td className="table-cell font-medium">{usage.medicines?.name}</td>
                      <td className="table-cell">{usage.quantity_used} {usage.medicines?.unit}</td>
                      <td className="table-cell">{usage.disease_treated}</td>
                      <td className="table-cell">{usage.animal_type}</td>
                      <td className="table-cell">{usage.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            {/* Pelayanan Lapangan Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Pelayanan Lapangan</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/rekam-medis/daftar')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Lihat Semua
                  </button>
                  <button
                    onClick={() => router.push('/rekam-medis')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Tambah Pelayanan Lapangan
                  </button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Pelayanan Lapangan</h4>
                <p className="text-gray-600 mb-4">
                  Catat rekam medis hewan dengan lengkap termasuk gejala klinis, pengobatan, dan informasi pemilik
                </p>
                <button
                  onClick={() => router.push('/rekam-medis')}
                  className="btn-primary"
                >
                  Mulai Pelayanan Lapangan
                </button>
              </div>
            </div>

            {/* Pelayanan Klinik Hewan Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Pelayanan Klinik Hewan</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/pelayanan-kesehatan/daftar')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Lihat Semua
                  </button>
                  <button
                    onClick={() => router.push('/pelayanan-kesehatan')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Tambah Pelayanan
                  </button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Pelayanan Klinik Hewan</h4>
                <p className="text-gray-600 mb-4">
                  Catat pelayanan kesehatan hewan dengan lengkap termasuk anamnesis, pemeriksaan fisik, diagnosis, dan penggunaan obat
                </p>
                <button
                  onClick={() => router.push('/pelayanan-kesehatan')}
                  className="btn-primary"
                >
                  Mulai Pelayanan Klinik Hewan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Usage Modal */}
      {showAddUsage && (
        <AddUsageModal
          medicines={medicines}
          onClose={() => setShowAddUsage(false)}
          onAdd={handleAddUsage}
        />
      )}

      {/* Excel Import Modal */}
      {showExcelImport && (
        <ExcelImportModal
          isOpen={showExcelImport}
          onClose={() => setShowExcelImport(false)}
          onSuccess={handleExcelImportSuccess}
          uptId={user?.upt_id || ''}
        />
      )}
    </div>
  )
}

function AddUsageModal({ 
  medicines, 
  onClose, 
  onAdd 
}: { 
  medicines: Medicine[], 
  onClose: () => void, 
  onAdd: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    medicine_id: '',
    quantity_used: 0,
    disease_treated: '',
    animal_type: '',
    usage_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Penggunaan Obat</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Obat</label>
            <select
              value={formData.medicine_id}
              onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Pilih obat...</option>
              {medicines.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name} (Stock: {medicine.stock_current} {medicine.unit})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah Digunakan</label>
            <input
              type="number"
              value={formData.quantity_used}
              onChange={(e) => setFormData({ ...formData, quantity_used: parseInt(e.target.value) })}
              className="input-field"
              required
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Penyakit yang Diobati</label>
            <input
              type="text"
              value={formData.disease_treated}
              onChange={(e) => setFormData({ ...formData, disease_treated: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Hewan</label>
            <input
              type="text"
              value={formData.animal_type}
              onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Penggunaan</label>
            <input
              type="date"
              value={formData.usage_date}
              onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
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
