'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter()

  const handleClick = (href?: string) => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <button
              onClick={() => handleClick(item.href)}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
