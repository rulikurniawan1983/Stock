'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DinasDashboard from '@/components/DinasDashboard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DinasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'dinas')) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || user.role !== 'dinas') {
    return <LoadingSpinner />
  }

  return <DinasDashboard />
}
