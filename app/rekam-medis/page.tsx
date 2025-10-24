'use client'

import { useAuth } from '@/components/AuthProvider'
import MedicalRecordForm from '@/components/MedicalRecordForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RekamMedisPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Rekam Medis Hewan
              </h1>
              <p className="mt-2 text-gray-600">
                Form pencatatan rekam medis hewan untuk {user.role === 'dinas' ? 'Dinas Peternakan' : 'UPT Puskeswan'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Logged in as: {user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        <MedicalRecordForm />
      </div>
    </div>
  )
}
