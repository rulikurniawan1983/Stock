'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, AnimalOwner, Animal, Medicine, HealthService, MedicalRecord } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Plus, Trash2, Save, Calendar, User, Heart, Stethoscope, Package } from 'lucide-react'
import { kecamatanBogor, getDesaByKecamatanId, type Kecamatan, type Desa } from '@/lib/bogor-data'

interface UnifiedHealthFormData {
  // Informasi Umum (dari Medical Record)
  bulan: string
  tanggal: string
  pemilik: string
  alamat_desa: string
  alamat_kecamatan: string
  
  // Informasi Hewan (dari Health Service)
  animal_name: string
  animal_species: string
  animal_breed: string
  animal_age_months: number
  animal_gender: 'jantan' | 'betina'
  animal_weight_kg: number
  animal_color: string
  
  // Jenis Ternak (dari Medical Record)
  sapi: number
  kerbau: number
  kambing: number
  domba: number
  kucing: number
  kelinci: number
  ayam: number
  anjing: number
  lainnya: number
  
  // Gejala Klinis (dari Medical Record)
  gejala_klinis: string[]
  
  // Pelayanan Kesehatan (dari Health Service)
  service_type: 'pemeriksaan' | 'pengobatan' | 'vaksinasi' | 'operasi' | 'konsultasi'
  chief_complaint: string
  anamnesis: string
  physical_examination: string
  diagnosis: string
  treatment_plan: string
  follow_up_notes: string
  veterinarian_name: string
  status: 'selesai' | 'rawat_jalan' | 'rawat_inap' | 'rujukan'
  
  // Pengobatan (dari Medical Record)
  jenis_pengobatan: string
  dosis_ml_ekor: number
  petugas: string
  
  // Status (dari Medical Record)
  status_hewan: 'AKTIF' | 'PASIF' | 'SEMI AKTIF'
  
  // Medicine Usage (dari Health Service)
  medicines: Array<{
    medicine_id: string
    quantity_used: number
    dosage: string
    administration_route: string
    notes: string
  }>
}

const CLINICAL_SYMPTOMS = [
  'scabies', 'helmintiasis', 'orf', 'bloat', 'crd_snot', 'miasis', 'post_partus',
  'anorexia', 'endoparasit', 'demam', 'infeksi_luar', 'paralysis', 'luka_bakar',
  'pink_eye', 'retebsio_plasent', 'otitis', 'enteritis_diare', 'kurus_kahexia',
  'conjuctives', 'flu', 'luka', 'jamur', 'fainting', 'maldigesti'
]

const SYMPTOM_LABELS = {
  scabies: 'Scabies',
  helmintiasis: 'Helmintiasis',
  orf: 'ORF',
  bloat: 'Bloat',
  crd_snot: 'CRD/Snot',
  miasis: 'Miasis',
  post_partus: 'Post Partus',
  anorexia: 'Anorexia',
  endoparasit: 'Endoparasit',
  demam: 'Demam',
  infeksi_luar: 'Infeksi Luar',
  paralysis: 'Paralysis',
  luka_bakar: 'Luka Bakar',
  pink_eye: 'Pink Eye',
  retebsio_plasent: 'Retebsio Plasent',
  otitis: 'Otitis',
  enteritis_diare: 'Enteritis/Diare',
  kurus_kahexia: 'Kurus/Kahexia',
  conjuctives: 'Conjuctives',
  flu: 'Flu',
  luka: 'Luka',
  jamur: 'Jamur',
  fainting: 'Fainting',
  maldigesti: 'Maldigesti'
}

export default function UnifiedHealthForm() {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<UnifiedHealthFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
  const [availableDesas, setAvailableDesas] = useState<Desa[]>([])
  const { user } = useAuth()

  useEffect(() => {
    fetchMedicines()
  }, [])

  // Handler untuk perubahan kecamatan
  const handleKecamatanChange = (kecamatanId: string) => {
    setSelectedKecamatan(kecamatanId)
    const desas = getDesaByKecamatanId(kecamatanId)
    setAvailableDesas(desas)
    // Reset desa yang dipilih
    setValue('alamat_desa', '')
  }

  const fetchMedicines = async () => {
    try {
      const { data } = await supabase
        .from('medicines')
        .select('*')
        .order('name')
      setMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const onSubmit = async (data: UnifiedHealthFormData) => {
    setIsSubmitting(true)
    try {
      // 1. Create or find animal owner
      let ownerId: string
      const { data: existingOwner } = await supabase
        .from('animal_owners')
        .select('id')
        .eq('name', data.pemilik)
        .single()

      if (existingOwner) {
        ownerId = existingOwner.id
      } else {
        const selectedKecamatanName = kecamatanBogor.find(k => k.id === selectedKecamatan)?.name || ''
        const { data: newOwner, error: ownerError } = await supabase
          .from('animal_owners')
          .insert([{
            name: data.pemilik,
            address: data.alamat_desa,
            village: data.alamat_desa,
            district: selectedKecamatanName
          }])
          .select()
          .single()

        if (ownerError) throw ownerError
        ownerId = newOwner.id
      }

      // 2. Create animal record
      const { data: animal, error: animalError } = await supabase
        .from('animals')
        .insert([{
          owner_id: ownerId,
          name: data.animal_name,
          species: data.animal_species,
          breed: data.animal_breed,
          age_months: data.animal_age_months,
          gender: data.animal_gender,
          weight_kg: data.animal_weight_kg,
          color: data.animal_color
        }])
        .select()
        .single()

      if (animalError) throw animalError

      // 3. Create medical record
      const selectedKecamatanName = kecamatanBogor.find(k => k.id === selectedKecamatan)?.name || ''
      const { error: medicalError } = await supabase
        .from('medical_records')
        .insert([{
          bulan: data.bulan,
          tanggal: data.tanggal,
          pemilik: data.pemilik,
          alamat_desa: data.alamat_desa,
          alamat_kecamatan: selectedKecamatanName,
          jenis_ternak: {
            sapi: data.sapi,
            kerbau: data.kerbau,
            kambing: data.kambing,
            domba: data.domba,
            kucing: data.kucing,
            kelinci: data.kelinci,
            ayam: data.ayam,
            anjing: data.anjing,
            lainnya: data.lainnya
          },
          total_hewan: data.sapi + data.kerbau + data.kambing + data.domba + 
                      data.kucing + data.kelinci + data.ayam + data.anjing + data.lainnya,
          gejala_klinis: selectedSymptoms,
          jenis_pengobatan: data.jenis_pengobatan,
          dosis_ml_ekor: data.dosis_ml_ekor,
          petugas: data.petugas,
          status: data.status_hewan
        }])

      if (medicalError) throw medicalError

      // 4. Create health service
      const { data: healthService, error: serviceError } = await supabase
        .from('health_services')
        .insert([{
          animal_id: animal.id,
          upt_id: user?.upt_id,
          service_date: data.tanggal,
          service_type: data.service_type,
          chief_complaint: data.chief_complaint,
          anamnesis: data.anamnesis,
          physical_examination: data.physical_examination,
          diagnosis: data.diagnosis,
          treatment_plan: data.treatment_plan,
          follow_up_notes: data.follow_up_notes,
          veterinarian_name: data.veterinarian_name,
          status: data.status
        }])
        .select()
        .single()

      if (serviceError) throw serviceError

      // 5. Create medicine usage records
      if (data.medicines && data.medicines.length > 0) {
        const medicineRecords = data.medicines.map(med => ({
          health_service_id: healthService.id,
          medicine_id: med.medicine_id,
          quantity_used: med.quantity_used,
          dosage: med.dosage,
          administration_route: med.administration_route,
          notes: med.notes
        }))

        const { error: medicineError } = await supabase
          .from('health_service_medicines')
          .insert(medicineRecords)

        if (medicineError) throw medicineError
      }

      alert('Data berhasil disimpan!')
      reset()
      setSelectedSymptoms([])
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMedicine = () => {
    const currentMedicines = watch('medicines') || []
    setValue('medicines', [...currentMedicines, {
      medicine_id: '',
      quantity_used: 0,
      dosage: '',
      administration_route: '',
      notes: ''
    }])
  }

  const removeMedicine = (index: number) => {
    const currentMedicines = watch('medicines') || []
    setValue('medicines', currentMedicines.filter((_, i) => i !== index))
  }

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom]
    setSelectedSymptoms(newSymptoms)
    setValue('gejala_klinis', newSymptoms)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Form Terpadu Pelayanan Lapangan & Pelayanan Klinik Hewan
          </h2>
          <p className="text-gray-600 mt-1">
            Form lengkap untuk pelayanan lapangan dan pelayanan klinik hewan
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Informasi Umum */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                <input
                  {...register('bulan', { required: 'Bulan harus diisi' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Januari 2024"
                />
                {errors.bulan && <p className="text-red-500 text-sm mt-1">{errors.bulan.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  {...register('tanggal', { required: 'Tanggal harus diisi' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.tanggal && <p className="text-red-500 text-sm mt-1">{errors.tanggal.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
                <input
                  {...register('pemilik', { required: 'Nama pemilik harus diisi' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap pemilik"
                />
                {errors.pemilik && <p className="text-red-500 text-sm mt-1">{errors.pemilik.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <select
                  value={selectedKecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatanBogor.map((kecamatan) => (
                    <option key={kecamatan.id} value={kecamatan.id}>
                      {kecamatan.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                <select
                  {...register('alamat_desa', { required: 'Desa harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedKecamatan}
                >
                  <option value="">Pilih Desa</option>
                  {availableDesas.map((desa) => (
                    <option key={desa.id} value={desa.name}>
                      {desa.name}
                    </option>
                  ))}
                </select>
                {errors.alamat_desa && <p className="text-red-500 text-sm mt-1">{errors.alamat_desa.message}</p>}
              </div>
            </div>
          </div>

          {/* Informasi Hewan */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Informasi Hewan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Hewan</label>
                <input
                  {...register('animal_name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nama hewan (opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Hewan</label>
                <select
                  {...register('animal_species', { required: 'Jenis hewan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Pilih jenis hewan</option>
                  <option value="Sapi">Sapi</option>
                  <option value="Kerbau">Kerbau</option>
                  <option value="Kambing">Kambing</option>
                  <option value="Domba">Domba</option>
                  <option value="Kucing">Kucing</option>
                  <option value="Kelinci">Kelinci</option>
                  <option value="Ayam">Ayam</option>
                  <option value="Anjing">Anjing</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                {errors.animal_species && <p className="text-red-500 text-sm mt-1">{errors.animal_species.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ras/Breed</label>
                <input
                  {...register('animal_breed')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ras hewan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usia (bulan)</label>
                <input
                  {...register('animal_age_months', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  {...register('animal_gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="jantan">Jantan</option>
                  <option value="betina">Betina</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
                <input
                  {...register('animal_weight_kg', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                <input
                  {...register('animal_color')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Warna hewan"
                />
              </div>
            </div>
          </div>

          {/* Jenis Ternak */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Jenis Ternak
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'sapi', label: 'Sapi' },
                { key: 'kerbau', label: 'Kerbau' },
                { key: 'kambing', label: 'Kambing' },
                { key: 'domba', label: 'Domba' },
                { key: 'kucing', label: 'Kucing' },
                { key: 'kelinci', label: 'Kelinci' },
                { key: 'ayam', label: 'Ayam' },
                { key: 'anjing', label: 'Anjing' },
                { key: 'lainnya', label: 'Lainnya' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    {...register(key as keyof UnifiedHealthFormData, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gejala Klinis */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Gejala Klinis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CLINICAL_SYMPTOMS.map(symptom => (
                <label key={symptom} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{SYMPTOM_LABELS[symptom as keyof typeof SYMPTOM_LABELS]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pelayanan Klinik Hewan */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Pelayanan Klinik Hewan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pelayanan</label>
                <select
                  {...register('service_type', { required: 'Jenis pelayanan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih jenis pelayanan</option>
                  <option value="pemeriksaan">Pemeriksaan</option>
                  <option value="pengobatan">Pengobatan</option>
                  <option value="vaksinasi">Vaksinasi</option>
                  <option value="operasi">Operasi</option>
                  <option value="konsultasi">Konsultasi</option>
                </select>
                {errors.service_type && <p className="text-red-500 text-sm mt-1">{errors.service_type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...register('status', { required: 'Status harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih status</option>
                  <option value="selesai">Selesai</option>
                  <option value="rawat_jalan">Rawat Jalan</option>
                  <option value="rawat_inap">Rawat Inap</option>
                  <option value="rujukan">Rujukan</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan Utama</label>
                <textarea
                  {...register('chief_complaint')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Keluhan utama dari pemilik hewan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Anamnesis</label>
                <textarea
                  {...register('anamnesis')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Riwayat penyakit dan gejala yang dialami hewan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pemeriksaan Fisik</label>
                <textarea
                  {...register('physical_examination')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Hasil pemeriksaan fisik hewan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <textarea
                  {...register('diagnosis')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Diagnosis penyakit"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Pengobatan</label>
                <textarea
                  {...register('treatment_plan')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Rencana pengobatan yang akan dilakukan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tindak Lanjut</label>
                <textarea
                  {...register('follow_up_notes')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Catatan untuk tindak lanjut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokter Hewan</label>
                <input
                  {...register('veterinarian_name', { required: 'Nama dokter hewan harus diisi' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nama dokter hewan"
                />
                {errors.veterinarian_name && <p className="text-red-500 text-sm mt-1">{errors.veterinarian_name.message}</p>}
              </div>
            </div>
          </div>

          {/* Pengobatan */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Pengobatan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pengobatan</label>
                <input
                  {...register('jenis_pengobatan', { required: 'Jenis pengobatan harus diisi' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Jenis pengobatan"
                />
                {errors.jenis_pengobatan && <p className="text-red-500 text-sm mt-1">{errors.jenis_pengobatan.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosis (ml/ekor)</label>
                <input
                  {...register('dosis_ml_ekor', { required: 'Dosis harus diisi', valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.0"
                />
                {errors.dosis_ml_ekor && <p className="text-red-500 text-sm mt-1">{errors.dosis_ml_ekor.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Petugas</label>
                <input
                  {...register('petugas', { required: 'Petugas harus diisi' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nama petugas"
                />
                {errors.petugas && <p className="text-red-500 text-sm mt-1">{errors.petugas.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Hewan</label>
                <select
                  {...register('status_hewan', { required: 'Status hewan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Pilih status</option>
                  <option value="AKTIF">Aktif</option>
                  <option value="PASIF">Pasif</option>
                  <option value="SEMI AKTIF">Semi Aktif</option>
                </select>
                {errors.status_hewan && <p className="text-red-500 text-sm mt-1">{errors.status_hewan.message}</p>}
              </div>
            </div>
          </div>

          {/* Penggunaan Obat */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Penggunaan Obat
              </h3>
              <button
                type="button"
                onClick={addMedicine}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Obat
              </button>
            </div>

            {watch('medicines')?.map((medicine, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-indigo-200 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Obat #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Obat</label>
                    <select
                      {...register(`medicines.${index}.medicine_id`, { required: 'Obat harus dipilih' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Pilih obat</option>
                      {medicines.map(med => (
                        <option key={med.id} value={med.id}>{med.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Digunakan</label>
                    <input
                      {...register(`medicines.${index}.quantity_used`, { required: 'Jumlah harus diisi', valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
                    <input
                      {...register(`medicines.${index}.dosage`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Dosis obat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cara Pemberian</label>
                    <input
                      {...register(`medicines.${index}.administration_route`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Cara pemberian obat"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      {...register(`medicines.${index}.notes`)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Catatan tambahan"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
