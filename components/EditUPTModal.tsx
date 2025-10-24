'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, UPT } from '@/lib/supabase'
import { X, Save, MapPin, Phone, Building } from 'lucide-react'

interface EditUPTModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  upt: UPT | null
}

interface UPTFormData {
  name: string
  address: string
  phone: string
}

export default function EditUPTModal({ isOpen, onClose, onSuccess, upt }: EditUPTModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UPTFormData>()

  // Reset form when modal opens with new UPT data
  useState(() => {
    if (upt && isOpen) {
      reset({
        name: upt.name || '',
        address: upt.address || '',
        phone: upt.phone || ''
      })
    }
  })

  const onSubmit = async (data: UPTFormData) => {
    if (!upt) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('upt')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', upt.id)

      if (error) throw error

      onSuccess()
      onClose()
      reset()
    } catch (error) {
      console.error('Error updating UPT:', error)
      alert('Gagal mengupdate UPT. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !upt) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Edit UPT Puskeswan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama UPT
            </label>
            <input
              {...register('name', { required: 'Nama UPT harus diisi' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama UPT Puskeswan"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <textarea
                {...register('address', { required: 'Alamat harus diisi' })}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat lengkap UPT"
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('phone', { required: 'Nomor telepon harus diisi' })}
                type="tel"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor telepon UPT"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
