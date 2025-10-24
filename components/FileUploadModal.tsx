'use client'

import { useState, useRef } from 'react'
import { X, Upload, File, Image, FileText, Download, Trash2, Eye, Tag } from 'lucide-react'
import { supabase, FileUpload } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  bucketName: string
  title: string
  description: string
}

const BUCKET_CONFIG = {
  documents: {
    title: 'Upload Dokumen',
    description: 'Upload dokumen seperti PDF, Word, Excel, dll',
    acceptedTypes: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: FileText
  },
  images: {
    title: 'Upload Gambar',
    description: 'Upload gambar seperti JPG, PNG, GIF, dll',
    acceptedTypes: '.jpg,.jpeg,.png,.gif,.webp,.svg',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: Image
  },
  reports: {
    title: 'Upload Laporan',
    description: 'Upload laporan dalam berbagai format',
    acceptedTypes: '.pdf,.doc,.docx,.xls,.xlsx',
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: FileText
  },
  templates: {
    title: 'Upload Template',
    description: 'Upload template untuk digunakan',
    acceptedTypes: '.xlsx,.xls,.docx,.doc',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: File
  },
  attachments: {
    title: 'Upload Lampiran',
    description: 'Upload lampiran dalam berbagai format',
    acceptedTypes: '*',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: File
  }
}

export default function FileUploadModal({ isOpen, onClose, onSuccess, bucketName, title, description }: FileUploadModalProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [showFiles, setShowFiles] = useState(false)
  const [fileDescription, setFileDescription] = useState('')
  const [fileTags, setFileTags] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const config = BUCKET_CONFIG[bucketName as keyof typeof BUCKET_CONFIG] || BUCKET_CONFIG.attachments
  const IconComponent = config.icon

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadStatus('idle')
    setMessage('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size
        if (file.size > config.maxSize) {
          throw new Error(`File ${file.name} terlalu besar. Maksimal ${config.maxSize / (1024 * 1024)}MB`)
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${bucketName}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        // Save file metadata to database
        const { data: fileData, error: dbError } = await supabase
          .from('file_uploads')
          .insert([{
            filename: fileName,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            bucket_name: bucketName,
            uploaded_by: user?.id,
            description: fileDescription,
            tags: fileTags ? fileTags.split(',').map(tag => tag.trim()) : [],
            is_public: true
          }])
          .select()
          .single()

        if (dbError) throw dbError

        return fileData
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setUploadedFiles(uploadedFiles)
      setShowFiles(true)
      setUploadStatus('success')
      setMessage(`Berhasil mengupload ${uploadedFiles.length} file`)
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFileDescription('')
      setFileTags('')
      
      onSuccess()
    } catch (error: any) {
      setUploadStatus('error')
      setMessage(`Error mengupload file: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
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
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const deleteFile = async (file: FileUpload) => {
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

      setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
      setMessage('File berhasil dihapus')
    } catch (error: any) {
      setMessage(`Error menghapus file: ${error.message}`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!showFiles ? (
            <div className="space-y-6">
              {/* File Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi File (Opsional)
                </label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Masukkan deskripsi file..."
                  className="input-field"
                  rows={3}
                />
              </div>

              {/* File Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Opsional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={fileTags}
                    onChange={(e) => setFileTags(e.target.value)}
                    placeholder="Masukkan tags dipisahkan koma (contoh: laporan, bulanan, 2024)"
                    className="pl-10 input-field"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pisahkan tags dengan koma untuk memudahkan pencarian
                </p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload File</h4>
                <p className="text-gray-600 mb-4">
                  Pilih file atau drag & drop ke area ini
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Format yang didukung: {config.acceptedTypes}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maksimal ukuran: {config.maxSize / (1024 * 1024)}MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={config.acceptedTypes}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Pilih File
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Uploaded Files */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">File yang Diupload ({uploadedFiles.length})</h4>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => {
                    const FileIcon = getFileIcon(file.mime_type)
                    return (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowFiles(false)
                    setUploadedFiles([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="btn-secondary"
                >
                  Upload Lagi
                </button>
                <button
                  onClick={onClose}
                  className="btn-primary"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              uploadStatus === 'success' ? 'bg-green-50 text-green-700' :
              uploadStatus === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {uploadStatus === 'success' ? (
                <Upload className="h-5 w-5" />
              ) : uploadStatus === 'error' ? (
                <X className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
