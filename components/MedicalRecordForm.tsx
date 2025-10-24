'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'

interface MedicalRecordFormData {
  // Informasi Umum
  bulan: string
  tanggal: string
  pemilik: string
  alamat_desa: string
  alamat_kecamatan: string
  
  // Jenis Ternak
  sapi: number
  kerbau: number
  kambing: number
  domba: number
  kucing: number
  kelinci: number
  ayam: number
  anjing: number
  lainnya: number
  
  // Gejala Klinis
  scabies: boolean
  helmintiasis: boolean
  orf: boolean
  bloat: boolean
  crd_snot: boolean
  miasis: boolean
  post_partus: boolean
  anorexia: boolean
  endoparasit: boolean
  demam: boolean
  infeksi_luar: boolean
  paralysis: boolean
  luka_bakar: boolean
  pink_eye: boolean
  retebsio_plasent: boolean
  otitis: boolean
  enteritis_diare: boolean
  kurus_kahexia: boolean
  conjuctives: boolean
  flu: boolean
  luka: boolean
  jamur: boolean
  fanting: boolean
  maldigesti: boolean
  mastitis: boolean
  abses: boolean
  prolapsusuteri: boolean
  oh_kastrasi: boolean
  vaksinasi_rabie: boolean
  infeksi_sal_urin: boolean
  clicivirus: boolean
  proplapsus_ani: boolean
  
  // Pengobatan
  jenis_pengobatan: string
  dosis_ml_ekor: number
  
  // Petugas dan Keterangan
  petugas: string
  keterangan_aktif: boolean
  keterangan_pasif: boolean
  keterangan_semi_aktif: boolean
}

export default function MedicalRecordForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MedicalRecordFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: MedicalRecordFormData) => {
    setIsSubmitting(true)
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      // Calculate total animals
      const totalAnimals = data.sapi + data.kerbau + data.kambing + data.domba + 
                          data.kucing + data.kelinci + data.ayam + data.anjing + data.lainnya

      // Prepare clinical symptoms array
      const gejalaKlinis = []
      if (data.scabies) gejalaKlinis.push('Scabies')
      if (data.helmintiasis) gejalaKlinis.push('Helmintiasis')
      if (data.orf) gejalaKlinis.push('ORF')
      if (data.bloat) gejalaKlinis.push('Bloat')
      if (data.crd_snot) gejalaKlinis.push('CRD/SNOT')
      if (data.miasis) gejalaKlinis.push('Miasis')
      if (data.post_partus) gejalaKlinis.push('Post Partus')
      if (data.anorexia) gejalaKlinis.push('Anorexia')
      if (data.endoparasit) gejalaKlinis.push('Endoparasit')
      if (data.demam) gejalaKlinis.push('Demam')
      if (data.infeksi_luar) gejalaKlinis.push('Infeksi Luar')
      if (data.paralysis) gejalaKlinis.push('Paralysis')
      if (data.luka_bakar) gejalaKlinis.push('Luka Bakar')
      if (data.pink_eye) gejalaKlinis.push('Pink Eye')
      if (data.retebsio_plasent) gejalaKlinis.push('Retebsio Plasent')
      if (data.otitis) gejalaKlinis.push('Otitis')
      if (data.enteritis_diare) gejalaKlinis.push('Enteritis/Diare')
      if (data.kurus_kahexia) gejalaKlinis.push('Kurus/Kahexia')
      if (data.conjuctives) gejalaKlinis.push('Conjuctives')
      if (data.flu) gejalaKlinis.push('Flu')
      if (data.luka) gejalaKlinis.push('Luka')
      if (data.jamur) gejalaKlinis.push('Jamur')
      if (data.fanting) gejalaKlinis.push('Fanting')
      if (data.maldigesti) gejalaKlinis.push('Maldigesti')
      if (data.mastitis) gejalaKlinis.push('Mastitis')
      if (data.abses) gejalaKlinis.push('Abses')
      if (data.prolapsusuteri) gejalaKlinis.push('Prolapsusuteri')
      if (data.oh_kastrasi) gejalaKlinis.push('OH/Kastrasi')
      if (data.vaksinasi_rabie) gejalaKlinis.push('Vaksinasi rabie')
      if (data.infeksi_sal_urin) gejalaKlinis.push('Infeksi sal. Urin')
      if (data.clicivirus) gejalaKlinis.push('Clicivirus')
      if (data.proplapsus_ani) gejalaKlinis.push('Proplapsus ani')

      // Determine status
      let status = 'PASIF'
      if (data.keterangan_aktif) status = 'AKTIF'
      else if (data.keterangan_semi_aktif) status = 'SEMI AKTIF'

      const recordData = {
        bulan: data.bulan,
        tanggal: data.tanggal,
        pemilik: data.pemilik,
        alamat_desa: data.alamat_desa,
        alamat_kecamatan: data.alamat_kecamatan,
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
        total_hewan: totalAnimals,
        gejala_klinis: gejalaKlinis,
        jenis_pengobatan: data.jenis_pengobatan,
        dosis_ml_ekor: data.dosis_ml_ekor,
        petugas: data.petugas,
        status: status,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('medical_records')
        .insert([recordData])

      if (error) throw error

      alert('Rekam medis berhasil disimpan!')
      reset()
    } catch (error) {
      console.error('Error saving medical record:', error)
      alert('Gagal menyimpan rekam medis. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Form Rekam Medis Hewan
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informasi Umum */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="col-span-full font-semibold text-lg text-gray-700 mb-3">
              Informasi Umum
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <input
                type="text"
                {...register('bulan', { required: 'Bulan harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Januari 2024"
              />
              {errors.bulan && <p className="text-red-500 text-xs mt-1">{errors.bulan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                {...register('tanggal', { required: 'Tanggal harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pemilik
              </label>
              <input
                type="text"
                {...register('pemilik', { required: 'Nama pemilik harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama pemilik hewan"
              />
              {errors.pemilik && <p className="text-red-500 text-xs mt-1">{errors.pemilik.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desa
              </label>
              <input
                type="text"
                {...register('alamat_desa', { required: 'Desa harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama desa"
              />
              {errors.alamat_desa && <p className="text-red-500 text-xs mt-1">{errors.alamat_desa.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                {...register('alamat_kecamatan', { required: 'Kecamatan harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama kecamatan"
              />
              {errors.alamat_kecamatan && <p className="text-red-500 text-xs mt-1">{errors.alamat_kecamatan.message}</p>}
            </div>
          </div>

          {/* Jenis Ternak */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 mb-4">
              Jenis Ternak (Ekor)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register(key as keyof MedicalRecordFormData)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gejala Klinis */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 mb-4">
              Gejala Klinis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { key: 'scabies', label: 'Scabies' },
                { key: 'helmintiasis', label: 'Helmintiasis' },
                { key: 'orf', label: 'ORF' },
                { key: 'bloat', label: 'Bloat' },
                { key: 'crd_snot', label: 'CRD/SNOT' },
                { key: 'miasis', label: 'Miasis' },
                { key: 'post_partus', label: 'Post Partus' },
                { key: 'anorexia', label: 'Anorexia' },
                { key: 'endoparasit', label: 'Endoparasit' },
                { key: 'demam', label: 'Demam' },
                { key: 'infeksi_luar', label: 'Infeksi Luar' },
                { key: 'paralysis', label: 'Paralysis' },
                { key: 'luka_bakar', label: 'Luka Bakar' },
                { key: 'pink_eye', label: 'Pink Eye' },
                { key: 'retebsio_plasent', label: 'Retebsio Plasent' },
                { key: 'otitis', label: 'Otitis' },
                { key: 'enteritis_diare', label: 'Enteritis/Diare' },
                { key: 'kurus_kahexia', label: 'Kurus/Kahexia' },
                { key: 'conjuctives', label: 'Conjuctives' },
                { key: 'flu', label: 'Flu' },
                { key: 'luka', label: 'Luka' },
                { key: 'jamur', label: 'Jamur' },
                { key: 'fanting', label: 'Fanting' },
                { key: 'maldigesti', label: 'Maldigesti' },
                { key: 'mastitis', label: 'Mastitis' },
                { key: 'abses', label: 'Abses' },
                { key: 'prolapsusuteri', label: 'Prolapsusuteri' },
                { key: 'oh_kastrasi', label: 'OH/Kastrasi' },
                { key: 'vaksinasi_rabie', label: 'Vaksinasi rabie' },
                { key: 'infeksi_sal_urin', label: 'Infeksi sal. Urin' },
                { key: 'clicivirus', label: 'Clicivirus' },
                { key: 'proplapsus_ani', label: 'Proplapsus ani' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register(key as keyof MedicalRecordFormData)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pengobatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
            <h3 className="col-span-full font-semibold text-lg text-gray-700 mb-3">
              Pengobatan
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pengobatan
              </label>
              <input
                type="text"
                {...register('jenis_pengobatan', { required: 'Jenis pengobatan harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jenis obat yang diberikan"
              />
              {errors.jenis_pengobatan && <p className="text-red-500 text-xs mt-1">{errors.jenis_pengobatan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosis (ml/ekor)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...register('dosis_ml_ekor', { required: 'Dosis harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
              {errors.dosis_ml_ekor && <p className="text-red-500 text-xs mt-1">{errors.dosis_ml_ekor.message}</p>}
            </div>
          </div>

          {/* Petugas dan Keterangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Petugas
              </label>
              <input
                type="text"
                {...register('petugas', { required: 'Nama petugas harus diisi' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama petugas"
              />
              {errors.petugas && <p className="text-red-500 text-xs mt-1">{errors.petugas.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Keterangan
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="aktif"
                    {...register('keterangan_aktif')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="pasif"
                    {...register('keterangan_pasif')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pasif</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="semi_aktif"
                    {...register('keterangan_semi_aktif')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Semi Aktif</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Rekam Medis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
