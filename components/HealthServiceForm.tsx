'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, AnimalOwner, Animal, Medicine, HealthService } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface HealthServiceFormData {
  // Owner Information
  owner_name: string
  owner_phone: string
  owner_address: string
  owner_village: string
  owner_district: string
  
  // Animal Information
  animal_name: string
  animal_species: string
  animal_breed: string
  animal_age_months: number
  animal_gender: 'jantan' | 'betina'
  animal_weight_kg: number
  animal_color: string
  
  // Health Service Information
  service_date: string
  service_type: 'pemeriksaan' | 'pengobatan' | 'vaksinasi' | 'operasi' | 'konsultasi'
  chief_complaint: string
  anamnesis: string
  physical_examination: string
  diagnosis: string
  treatment_plan: string
  follow_up_notes: string
  veterinarian_name: string
  status: 'selesai' | 'rawat_jalan' | 'rawat_inap' | 'rujukan'
  
  // Medicine Usage
  medicines: Array<{
    medicine_id: string
    quantity_used: number
    dosage: string
    administration_route: string
    notes: string
  }>
}

export default function HealthServiceForm() {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<HealthServiceFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicines, setSelectedMedicines] = useState<Array<{
    medicine_id: string
    quantity_used: number
    dosage: string
    administration_route: string
    notes: string
  }>>([])
  const { user } = useAuth()

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name')

      if (error) throw error
      setMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const addMedicine = () => {
    setSelectedMedicines([...selectedMedicines, {
      medicine_id: '',
      quantity_used: 0,
      dosage: '',
      administration_route: '',
      notes: ''
    }])
  }

  const removeMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: string, value: any) => {
    const updated = [...selectedMedicines]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedMedicines(updated)
  }

  const onSubmit = async (data: HealthServiceFormData) => {
    setIsSubmitting(true)
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      // 1. Create or find animal owner
      let ownerId: string
      const { data: existingOwner } = await supabase
        .from('animal_owners')
        .select('id')
        .eq('name', data.owner_name)
        .eq('phone', data.owner_phone)
        .single()

      if (existingOwner) {
        ownerId = existingOwner.id
      } else {
        const { data: newOwner, error: ownerError } = await supabase
          .from('animal_owners')
          .insert([{
            name: data.owner_name,
            phone: data.owner_phone,
            address: data.owner_address,
            village: data.owner_village,
            district: data.owner_district
          }])
          .select('id')
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
        .select('id')
        .single()

      if (animalError) throw animalError

      // 3. Create health service record
      const { data: healthService, error: serviceError } = await supabase
        .from('health_services')
        .insert([{
          animal_id: animal.id,
          upt_id: user?.upt_id,
          service_date: data.service_date,
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
        .select('id')
        .single()

      if (serviceError) throw serviceError

      // 4. Create medicine usage records
      if (selectedMedicines.length > 0) {
        const medicineRecords = selectedMedicines.map(med => ({
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

        // Update medicine stock
        for (const med of selectedMedicines) {
          // Get current stock first
          const { data: currentMedicine } = await supabase
            .from('medicines')
            .select('stock_current')
            .eq('id', med.medicine_id)
            .single()

          if (currentMedicine) {
            const newStock = currentMedicine.stock_current - med.quantity_used
            const { error: stockError } = await supabase
              .from('medicines')
              .update({ stock_current: newStock })
              .eq('id', med.medicine_id)

            if (stockError) console.error('Error updating stock:', stockError)
          }
        }
      }

      alert('Pelayanan kesehatan berhasil disimpan!')
      reset()
      setSelectedMedicines([])
    } catch (error) {
      console.error('Error saving health service:', error)
      alert('Gagal menyimpan pelayanan kesehatan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Form Pelayanan Kesehatan Hewan
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informasi Pemilik */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Informasi Pemilik Hewan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemilik *
                </label>
                <input
                  type="text"
                  {...register('owner_name', { required: 'Nama pemilik harus diisi' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap pemilik"
                />
                {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  {...register('owner_phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desa
                </label>
                <input
                  type="text"
                  {...register('owner_village')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama desa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  {...register('owner_district')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama kecamatan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  {...register('owner_address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Alamat lengkap pemilik hewan"
                />
              </div>
            </div>
          </div>

          {/* Informasi Hewan */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Informasi Hewan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Hewan
                </label>
                <input
                  type="text"
                  {...register('animal_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama hewan (opsional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Hewan *
                </label>
                <select
                  {...register('animal_species', { required: 'Jenis hewan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih jenis hewan</option>
                  <option value="sapi">Sapi</option>
                  <option value="kerbau">Kerbau</option>
                  <option value="kambing">Kambing</option>
                  <option value="domba">Domba</option>
                  <option value="kucing">Kucing</option>
                  <option value="kelinci">Kelinci</option>
                  <option value="ayam">Ayam</option>
                  <option value="anjing">Anjing</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                {errors.animal_species && <p className="text-red-500 text-xs mt-1">{errors.animal_species.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ras/Breed
                </label>
                <input
                  type="text"
                  {...register('animal_breed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ras hewan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usia (bulan)
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('animal_age_months')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  {...register('animal_gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="jantan">Jantan</option>
                  <option value="betina">Betina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('animal_weight_kg')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warna
                </label>
                <input
                  type="text"
                  {...register('animal_color')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Warna hewan"
                />
              </div>
            </div>
          </div>

          {/* Informasi Pelayanan */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Informasi Pelayanan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pelayanan *
                </label>
                <input
                  type="date"
                  {...register('service_date', { required: 'Tanggal pelayanan harus diisi' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.service_date && <p className="text-red-500 text-xs mt-1">{errors.service_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pelayanan *
                </label>
                <select
                  {...register('service_type', { required: 'Jenis pelayanan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih jenis pelayanan</option>
                  <option value="pemeriksaan">Pemeriksaan</option>
                  <option value="pengobatan">Pengobatan</option>
                  <option value="vaksinasi">Vaksinasi</option>
                  <option value="operasi">Operasi</option>
                  <option value="konsultasi">Konsultasi</option>
                </select>
                {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Dokter Hewan *
                </label>
                <input
                  type="text"
                  {...register('veterinarian_name', { required: 'Nama dokter hewan harus diisi' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama dokter hewan"
                />
                {errors.veterinarian_name && <p className="text-red-500 text-xs mt-1">{errors.veterinarian_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Pelayanan *
                </label>
                <select
                  {...register('status', { required: 'Status pelayanan harus dipilih' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih status</option>
                  <option value="selesai">Selesai</option>
                  <option value="rawat_jalan">Rawat Jalan</option>
                  <option value="rawat_inap">Rawat Inap</option>
                  <option value="rujukan">Rujukan</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
              </div>
            </div>
          </div>

          {/* Anamnesis dan Pemeriksaan */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Anamnesis dan Pemeriksaan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keluhan Utama
                </label>
                <textarea
                  {...register('chief_complaint')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Keluhan utama dari pemilik hewan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anamnesis *
                </label>
                <textarea
                  {...register('anamnesis', { required: 'Anamnesis harus diisi' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Riwayat penyakit, gejala, dan informasi penting lainnya"
                />
                {errors.anamnesis && <p className="text-red-500 text-xs mt-1">{errors.anamnesis.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pemeriksaan Fisik
                </label>
                <textarea
                  {...register('physical_examination')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Hasil pemeriksaan fisik hewan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <textarea
                  {...register('diagnosis')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Diagnosis penyakit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rencana Pengobatan
                </label>
                <textarea
                  {...register('treatment_plan')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Rencana pengobatan yang akan diberikan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Tindak Lanjut
                </label>
                <textarea
                  {...register('follow_up_notes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Catatan untuk tindak lanjut"
                />
              </div>
            </div>
          </div>

          {/* Penggunaan Obat */}
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Penggunaan Obat
            </h3>
            
            {selectedMedicines.map((medicine, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Obat #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Hapus
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Obat
                    </label>
                    <select
                      value={medicine.medicine_id}
                      onChange={(e) => updateMedicine(index, 'medicine_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih obat...</option>
                      {medicines.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name} (Stock: {med.stock_current} {med.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={medicine.quantity_used}
                      onChange={(e) => updateMedicine(index, 'quantity_used', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosis
                    </label>
                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 2x1 hari"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cara Pemberian
                    </label>
                    <select
                      value={medicine.administration_route}
                      onChange={(e) => updateMedicine(index, 'administration_route', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih cara pemberian</option>
                      <option value="oral">Oral</option>
                      <option value="injeksi">Injeksi</option>
                      <option value="topikal">Topikal</option>
                      <option value="inhalasi">Inhalasi</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <input
                      type="text"
                      value={medicine.notes}
                      onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Catatan khusus"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMedicine}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + Tambah Obat
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pelayanan Kesehatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
