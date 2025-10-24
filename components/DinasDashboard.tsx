'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Medicine, MedicineUsage, UPT } from '@/lib/supabase'
import EditUPTModal from '@/components/EditUPTModal'
import * as ExcelJS from 'exceljs'
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
  Heart,
  ChevronDown,
  Filter,
  Download,
  Calendar,
  Search,
  Folder,
  HardDrive
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
  const [showMedicalDropdown, setShowMedicalDropdown] = useState(false)
  const [usageFilters, setUsageFilters] = useState({
    search: '',
    upt: '',
    dateFrom: '',
    dateTo: '',
    medicine: ''
  })
  const [filteredUsage, setFilteredUsage] = useState<MedicineUsage[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showEditUPTModal, setShowEditUPTModal] = useState(false)
  const [selectedUPT, setSelectedUPT] = useState<UPT | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [medicineUsage, usageFilters])

  const fetchData = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }

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
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

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

  const applyFilters = () => {
    let filtered = [...medicineUsage]

    // Search filter
    if (usageFilters.search) {
      const searchTerm = usageFilters.search.toLowerCase()
      filtered = filtered.filter(usage => 
        usage.medicines?.name?.toLowerCase().includes(searchTerm) ||
        usage.upt?.name?.toLowerCase().includes(searchTerm) ||
        usage.disease_treated?.toLowerCase().includes(searchTerm) ||
        usage.animal_type?.toLowerCase().includes(searchTerm)
      )
    }

    // UPT filter
    if (usageFilters.upt) {
      filtered = filtered.filter(usage => usage.upt_id === usageFilters.upt)
    }

    // Medicine filter
    if (usageFilters.medicine) {
      filtered = filtered.filter(usage => usage.medicine_id === usageFilters.medicine)
    }

    // Date filters
    if (usageFilters.dateFrom) {
      filtered = filtered.filter(usage => 
        new Date(usage.usage_date) >= new Date(usageFilters.dateFrom)
      )
    }

    if (usageFilters.dateTo) {
      filtered = filtered.filter(usage => 
        new Date(usage.usage_date) <= new Date(usageFilters.dateTo)
      )
    }

    setFilteredUsage(filtered)
  }

  const clearFilters = () => {
    setUsageFilters({
      search: '',
      upt: '',
      dateFrom: '',
      dateTo: '',
      medicine: ''
    })
  }

  const exportUsageToExcel = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const { saveAs } = await import('file-saver')
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Riwayat Penggunaan Obat')

      // Define columns
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 12 },
        { header: 'UPT', key: 'upt', width: 20 },
        { header: 'Nama Obat', key: 'medicine', width: 25 },
        { header: 'Jumlah', key: 'quantity', width: 10 },
        { header: 'Satuan', key: 'unit', width: 10 },
        { header: 'Penyakit', key: 'disease', width: 20 },
        { header: 'Jenis Hewan', key: 'animal', width: 15 },
        { header: 'Catatan', key: 'notes', width: 30 }
      ]

      // Style header row
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add data rows
      filteredUsage.forEach(usage => {
        worksheet.addRow({
          date: new Date(usage.usage_date).toLocaleDateString('id-ID'),
          upt: usage.upt?.name || '-',
          medicine: usage.medicines?.name || '-',
          quantity: usage.quantity_used,
          unit: usage.medicines?.unit || '-',
          disease: usage.disease_treated || '-',
          animal: usage.animal_type || '-',
          notes: usage.notes || '-'
        })
      })

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 10, 15)
      })

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const data = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const fileName = `riwayat_penggunaan_obat_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(data, fileName)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }

  const exportPelayananLapanganToExcel = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      // Fetch medical records data
      const { data: medicalRecords, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          upt(name)
        `)
        .order('tanggal', { ascending: false })

      if (error) throw error

      // Check if data exists
      if (!medicalRecords || medicalRecords.length === 0) {
        alert('Tidak ada data pelayanan lapangan untuk diexport.')
        return
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Pelayanan Lapangan')

      // Set headers
      worksheet.columns = [
        { header: 'Bulan', key: 'bulan', width: 15 },
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'UPT', key: 'upt_name', width: 25 },
        { header: 'Pemilik', key: 'pemilik', width: 25 },
        { header: 'Alamat Desa', key: 'alamat_desa', width: 25 },
        { header: 'Alamat Kecamatan', key: 'alamat_kecamatan', width: 25 },
        { header: 'Jenis Ternak', key: 'jenis_ternak', width: 20 },
        { header: 'Total Hewan', key: 'total_hewan', width: 15 },
        { header: 'Gejala Klinis', key: 'gejala_klinis', width: 30 },
        { header: 'Jenis Pengobatan', key: 'jenis_pengobatan', width: 25 },
        { header: 'Dosis (ml/ekor)', key: 'dosis_ml_ekor', width: 15 },
        { header: 'Petugas', key: 'petugas', width: 25 },
        { header: 'Status', key: 'status', width: 15 }
      ]

      // Style headers
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add data
      medicalRecords?.forEach((record: any) => {
        worksheet.addRow({
          bulan: record.bulan,
          tanggal: new Date(record.tanggal).toLocaleDateString('id-ID'),
          upt_name: record.upt?.name || '',
          pemilik: record.pemilik,
          alamat_desa: record.alamat_desa,
          alamat_kecamatan: record.alamat_kecamatan,
          jenis_ternak: JSON.stringify(record.jenis_ternak),
          total_hewan: record.total_hewan,
          gejala_klinis: record.gejala_klinis?.join(', ') || '',
          jenis_pengobatan: record.jenis_pengobatan,
          dosis_ml_ekor: record.dosis_ml_ekor,
          petugas: record.petugas,
          status: record.status
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

      // Generate filename
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `Pelayanan_Lapangan_${currentDate}.xlsx`

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
      console.error('Error exporting pelayanan lapangan:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`Gagal mengexport data pelayanan lapangan ke Excel. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const exportPelayananKlinikToExcel = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      // Fetch health services data
      const { data: healthServices, error } = await supabase
        .from('health_services')
        .select(`
          *,
          animals(
            name, 
            species, 
            breed,
            animal_owners(
              name, 
              phone
            )
          ),
          upt(name)
        `)
        .order('service_date', { ascending: false })

      if (error) throw error

      // Check if data exists
      if (!healthServices || healthServices.length === 0) {
        alert('Tidak ada data pelayanan klinik hewan untuk diexport.')
        return
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Pelayanan Klinik Hewan')

      // Set headers
      worksheet.columns = [
        { header: 'Tanggal Layanan', key: 'service_date', width: 15 },
        { header: 'UPT', key: 'upt_name', width: 20 },
        { header: 'Jenis Layanan', key: 'service_type', width: 20 },
        { header: 'Nama Hewan', key: 'animal_name', width: 20 },
        { header: 'Jenis Hewan', key: 'animal_species', width: 20 },
        { header: 'Ras', key: 'animal_breed', width: 20 },
        { header: 'Pemilik', key: 'owner_name', width: 25 },
        { header: 'Telepon Pemilik', key: 'owner_phone', width: 20 },
        { header: 'Keluhan Utama', key: 'chief_complaint', width: 30 },
        { header: 'Anamnesis', key: 'anamnesis', width: 30 },
        { header: 'Pemeriksaan Fisik', key: 'physical_examination', width: 30 },
        { header: 'Diagnosis', key: 'diagnosis', width: 30 },
        { header: 'Rencana Pengobatan', key: 'treatment_plan', width: 30 },
        { header: 'Dokter Hewan', key: 'veterinarian_name', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Catatan Follow-up', key: 'follow_up_notes', width: 30 }
      ]

      // Style headers
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add data
      healthServices?.forEach((service: any) => {
        worksheet.addRow({
          service_date: new Date(service.service_date).toLocaleDateString('id-ID'),
          upt_name: service.upt?.name || '',
          service_type: service.service_type,
          animal_name: service.animals?.name || '',
          animal_species: service.animals?.species || '',
          animal_breed: service.animals?.breed || '',
          owner_name: service.animals?.animal_owners?.name || '',
          owner_phone: service.animals?.animal_owners?.phone || '',
          chief_complaint: service.chief_complaint || '',
          anamnesis: service.anamnesis || '',
          physical_examination: service.physical_examination || '',
          diagnosis: service.diagnosis || '',
          treatment_plan: service.treatment_plan || '',
          veterinarian_name: service.veterinarian_name,
          status: service.status,
          follow_up_notes: service.follow_up_notes || ''
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

      // Generate filename
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `Pelayanan_Klinik_Hewan_${currentDate}.xlsx`

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
      console.error('Error exporting pelayanan klinik:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`Gagal mengexport data pelayanan klinik hewan ke Excel. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const totalStock = medicines.reduce((sum, med) => sum + med.stock_current, 0)
  const lowStockMedicines = medicines.filter(med => med.stock_current < 50)
  const totalUsage = medicineUsage.reduce((sum, usage) => sum + usage.quantity_used, 0)

  const handleEditUPT = (upt: UPT) => {
    setSelectedUPT(upt)
    setShowEditUPTModal(true)
  }

  const handleUPTEditSuccess = () => {
    fetchData() // Refresh data after edit
  }

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

          <div className="card relative">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Pelayanan Hewan</p>
                <p className="text-lg font-bold text-purple-600">Lihat Semua</p>
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
                      router.push('/rekam-medis/daftar')
                      setShowMedicalDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Pelayanan Lapangan
                  </button>
                  <button
                    onClick={() => {
                      router.push('/pelayanan-kesehatan/daftar')
                      setShowMedicalDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Pelayanan Kesehatan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/storage')}>
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-lg font-bold text-indigo-600">Kelola File</p>
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
                { id: 'medical', name: 'Pelayanan Hewan' }
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddMedicine(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Obat
                </button>
              </div>
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
          <div className="space-y-6">
            {/* Filter and Export Controls */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Riwayat Penggunaan Obat</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                  <button
                    onClick={exportUsageToExcel}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Cari obat, UPT, penyakit..."
                          value={usageFilters.search}
                          onChange={(e) => setUsageFilters({ ...usageFilters, search: e.target.value })}
                          className="pl-10 input-field"
                        />
                      </div>
                    </div>

                    {/* UPT Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPT</label>
                      <select
                        value={usageFilters.upt}
                        onChange={(e) => setUsageFilters({ ...usageFilters, upt: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Semua UPT</option>
                        {upts.map((upt) => (
                          <option key={upt.id} value={upt.id}>{upt.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Medicine Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Obat</label>
                      <select
                        value={usageFilters.medicine}
                        onChange={(e) => setUsageFilters({ ...usageFilters, medicine: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Semua Obat</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>{medicine.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={usageFilters.dateFrom}
                          onChange={(e) => setUsageFilters({ ...usageFilters, dateFrom: e.target.value })}
                          className="pl-10 input-field"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={usageFilters.dateTo}
                          onChange={(e) => setUsageFilters({ ...usageFilters, dateTo: e.target.value })}
                          className="pl-10 input-field"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="btn-secondary w-full"
                      >
                        Hapus Filter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {filteredUsage.length} dari {medicineUsage.length} penggunaan obat
                </p>
                {Object.values(usageFilters).some(filter => filter !== '') && (
                  <p className="text-sm text-blue-600">
                    Filter aktif
                  </p>
                )}
              </div>
            </div>

            {/* Usage Table */}
            <div className="card">
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
                    {filteredUsage.map((usage) => (
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
                {filteredUsage.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data yang sesuai dengan filter
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upts' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Daftar UPT Puskeswan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upts.map((upt) => (
                <div key={upt.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{upt.name}</h4>
                    <button
                      onClick={() => handleEditUPT(upt)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Edit UPT"
                    >
                      <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{upt.address}</p>
                  <p className="text-sm text-gray-500 mt-1">{upt.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            {/* Pelayanan Lapangan Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Pelayanan Lapangan</h3>
                <div className="flex gap-3">
                  <button
                    onClick={exportPelayananLapanganToExcel}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => router.push('/rekam-medis/daftar')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Lihat Semua Pelayanan Lapangan
                  </button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Pelayanan Lapangan</h4>
                <p className="text-gray-600 mb-4">
                  Pantau semua pelayanan lapangan dari seluruh UPT Puskeswan. Lihat gejala klinis, pengobatan yang diberikan, dan status kesehatan hewan.
                </p>
                <button
                  onClick={() => router.push('/rekam-medis/daftar')}
                  className="btn-primary"
                >
                  Lihat Semua Pelayanan Lapangan
                </button>
              </div>
            </div>

            {/* Pelayanan Kesehatan Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Pelayanan Klinik Hewan</h3>
                <div className="flex gap-3">
                  <button
                    onClick={exportPelayananKlinikToExcel}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => router.push('/pelayanan-kesehatan/daftar')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Lihat Semua Pelayanan
                  </button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Pelayanan Klinik Hewan</h4>
                <p className="text-gray-600 mb-4">
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

      {/* Edit UPT Modal */}
      <EditUPTModal
        isOpen={showEditUPTModal}
        onClose={() => setShowEditUPTModal(false)}
        onSuccess={handleUPTEditSuccess}
        upt={selectedUPT}
      />

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
