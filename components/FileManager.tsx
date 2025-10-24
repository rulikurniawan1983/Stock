'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  File,
  Image,
  FileText,
  Tag,
  Folder,
  Grid,
  List
} from 'lucide-react'
import { supabase, FileUpload } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import FileUploadModal from './FileUploadModal'

interface FileManagerProps {
  bucketName: string
  title: string
  description: string
}

const BUCKET_CONFIG = {
  documents: { title: 'Dokumen', description: 'Kelola dokumen dan file office' },
  images: { title: 'Gambar', description: 'Kelola gambar dan foto' },
  reports: { title: 'Laporan', description: 'Kelola laporan dan data' },
  templates: { title: 'Template', description: 'Kelola template dan contoh' },
  attachments: { title: 'Lampiran', description: 'Kelola lampiran dan file lainnya' }
}

export default function FileManager({ bucketName, title, description }: FileManagerProps) {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileUpload[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const config = BUCKET_CONFIG[bucketName as keyof typeof BUCKET_CONFIG] || BUCKET_CONFIG.attachments

  useEffect(() => {
    fetchFiles()
  }, [bucketName])

  useEffect(() => {
    applyFilters()
  }, [files, searchTerm, selectedTag, dateFilter, sortBy, sortOrder])

  const fetchFiles = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('bucket_name', bucketName)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...files]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(file =>
        file.original_name.toLowerCase().includes(term) ||
        file.description?.toLowerCase().includes(term) ||
        file.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(file =>
        file.tags?.includes(selectedTag)
      )
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.uploaded_at)
        return fileDate.toDateString() === filterDate.toDateString()
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.original_name.localeCompare(b.original_name)
          break
        case 'date':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
          break
        case 'size':
          comparison = a.file_size - b.file_size
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredFiles(filtered)
  }

  const downloadFile = async (file: FileUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_name)
        .download(file.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.original_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Update download count
      await supabase
        .from('file_uploads')
        .update({ 
          download_count: file.download_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('id', file.id)

      // Refresh files
      fetchFiles()
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const deleteFile = async (file: FileUpload) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket_name)
        .remove([file.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', file.id)

      if (dbError) throw dbError

      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.includes('pdf')) return FileText
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileText
    return File
  }

  const getAllTags = () => {
    const allTags = files.flatMap(file => file.tags || [])
    const uniqueTags = Array.from(new Set(allTags))
    return uniqueTags.sort()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-gray-600">{config.description}</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Tag</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field flex-1"
              >
                <option value="date">Tanggal</option>
                <option value="name">Nama</option>
                <option value="size">Ukuran</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-secondary px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* View Mode and Results */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredFiles.length} dari {files.length} file
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada file</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedTag || dateFilter 
              ? 'Tidak ada file yang sesuai dengan filter'
              : 'Belum ada file yang diupload'
            }
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary"
          >
            Upload File Pertama
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.mime_type)
            return (
              <div
                key={file.id}
                className={`bg-white rounded-lg shadow border border-gray-200 ${
                  viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center justify-between'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.original_name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                      </div>
                    </div>
                    
                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                    )}
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{file.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploaded_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => downloadFile(file)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteFile(file)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.original_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('id-ID')}
                        </p>
                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        )}
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {file.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteFile(file)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <FileUploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            fetchFiles()
          }}
          bucketName={bucketName}
          title={config.title}
          description={config.description}
        />
      )}
    </div>
  )
}
