'use client'

import { useState } from 'react'
import { 
  Folder, 
  FileText, 
  Image, 
  Download, 
  Upload,
  BarChart3,
  HardDrive,
  File,
  Archive
} from 'lucide-react'
import FileManager from '@/components/FileManager'
import PageHeader from '@/components/PageHeader'
import Breadcrumb from '@/components/Breadcrumb'

const STORAGE_BUCKETS = [
  {
    id: 'documents',
    name: 'Dokumen',
    description: 'File dokumen seperti PDF, Word, Excel',
    icon: FileText,
    color: 'blue',
    count: 0
  },
  {
    id: 'images',
    name: 'Gambar',
    description: 'File gambar seperti JPG, PNG, GIF',
    icon: Image,
    color: 'green',
    count: 0
  },
  {
    id: 'reports',
    name: 'Laporan',
    description: 'File laporan dan data analisis',
    icon: BarChart3,
    color: 'purple',
    count: 0
  },
  {
    id: 'templates',
    name: 'Template',
    description: 'Template dan contoh file',
    icon: File,
    color: 'orange',
    count: 0
  },
  {
    id: 'attachments',
    name: 'Lampiran',
    description: 'File lampiran lainnya',
    icon: Archive,
    color: 'gray',
    count: 0
  }
]

export default function StoragePage() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    bucketCounts: {} as Record<string, number>
  })

  const getBucketConfig = (bucketId: string) => {
    return STORAGE_BUCKETS.find(bucket => bucket.id === bucketId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  if (selectedBucket) {
    const bucketConfig = getBucketConfig(selectedBucket)
    if (!bucketConfig) return null

    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title={bucketConfig.name}
          subtitle={bucketConfig.description}
          showBack
          onBack={() => setSelectedBucket(null)}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: 'Storage', href: '/storage' },
              { label: bucketConfig.name, href: '#' }
            ]}
          />
          
          <div className="mt-6">
            <FileManager
              bucketName={selectedBucket}
              title={bucketConfig.name}
              description={bucketConfig.description}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Storage Management"
        subtitle="Kelola dan simpan berbagai jenis konten digital"
        showBack
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb 
          items={[
            { label: 'Storage', href: '#' }
          ]}
        />

        {/* Storage Overview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <File className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total File</p>
                <p className="text-2xl font-bold text-gray-900">{storageStats.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ukuran</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(storageStats.totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Folder className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bucket</p>
                <p className="text-2xl font-bold text-gray-900">{STORAGE_BUCKETS.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Buckets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORAGE_BUCKETS.map((bucket) => {
            const IconComponent = bucket.icon
            const colorClasses = getColorClasses(bucket.color)
            
            return (
              <div
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket.id)}
                className="bg-white rounded-lg shadow border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {storageStats.bucketCounts[bucket.id] || 0}
                    </p>
                    <p className="text-sm text-gray-500">file</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{bucket.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{bucket.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span>Klik untuk mengelola</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedBucket('documents')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Upload Dokumen</span>
            </button>
            
            <button
              onClick={() => setSelectedBucket('images')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Upload Gambar</span>
            </button>
            
            <button
              onClick={() => setSelectedBucket('reports')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Upload Laporan</span>
            </button>
            
            <button
              onClick={() => setSelectedBucket('templates')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <File className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Upload Template</span>
            </button>
          </div>
        </div>

        {/* Storage Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips Penggunaan Storage</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Gunakan tag untuk memudahkan pencarian file</li>
            <li>• Tambahkan deskripsi untuk file penting</li>
            <li>• Organisir file berdasarkan kategori bucket</li>
            <li>• Hapus file yang tidak diperlukan untuk menghemat ruang</li>
            <li>• Gunakan format file yang optimal untuk ukuran</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
