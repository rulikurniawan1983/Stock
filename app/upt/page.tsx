'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UPTDashboard from '@/components/UPTDashboard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function UPTPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'upt')) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || user.role !== 'upt') {
    return <LoadingSpinner />
  }

  return <UPTDashboard />
}
