'use client'

import { useAuth } from '@/components/AuthProvider'
import HealthServiceForm from '@/components/HealthServiceForm'
import PageHeader from '@/components/PageHeader'
import Breadcrumb from '@/components/Breadcrumb'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PelayananKesehatanPage() {
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

  const breadcrumbItems = [
    { label: 'Pelayanan Kesehatan', href: '/pelayanan-kesehatan/daftar' },
    { label: 'Tambah Pelayanan' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Pelayanan Kesehatan Hewan"
        subtitle={`Form pelayanan kesehatan hewan untuk ${user.role === 'dinas' ? 'Dinas Peternakan' : 'UPT Puskeswan'}`}
        backUrl={user.role === 'dinas' ? '/dinas' : '/upt'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        <HealthServiceForm />
      </div>
    </div>
  )
}
