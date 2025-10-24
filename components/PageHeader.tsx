'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, LogOut } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  showBack?: boolean
  backUrl?: string
  onBack?: () => void
  showLogout?: boolean
  actions?: React.ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = true,
  showBack = false,
  backUrl,
  onBack,
  showLogout = true,
  actions
}: PageHeaderProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            {(showBackButton || showBack) && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Kembali</span>
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
            
            {showLogout && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  Logged in as: {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
