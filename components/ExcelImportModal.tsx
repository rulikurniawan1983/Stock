'use client'

import { useState, useRef } from 'react'
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface MedicineData {
  name: string
  description: string
  unit: string
  stock_initial: number
  stock_current: number
  price_per_unit: number
  expiry_date: string
  supplier: string
  category: string
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [previewData, setPreviewData] = useState<MedicineData[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const workbook = new ExcelJS.Workbook()
      const buffer = await file.arrayBuffer()
      await workbook.xlsx.load(buffer)
      
      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error('Tidak ada worksheet yang ditemukan')
      }

      // Get headers from first row
      const headerRow = worksheet.getRow(1)
      const headers: string[] = []
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || ''
      })

      // Convert worksheet to JSON
      const jsonData: any[] = []
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // Skip header row
        
        const rowData: any = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            rowData[header] = cell.value
          }
        })
        jsonData.push(rowData)
      })

      // Validate and format data
      const medicines: MedicineData[] = jsonData.map((row: any, index: number) => ({
        name: row['Nama Obat'] || row['name'] || '',
        description: row['Deskripsi'] || row['description'] || '',
        unit: row['Satuan'] || row['unit'] || 'ml',
        stock_initial: Number(row['Stock Awal'] || row['stock_initial'] || 0),
        stock_current: Number(row['Stock Saat Ini'] || row['stock_current'] || 0),
        price_per_unit: Number(row['Harga per Satuan'] || row['price_per_unit'] || 0),
        expiry_date: row['Tanggal Kadaluarsa'] || row['expiry_date'] || '',
        supplier: row['Supplier'] || row['supplier'] || '',
        category: row['Kategori'] || row['category'] || 'Obat'
      }))

      setPreviewData(medicines)
      setShowPreview(true)
      setUploadStatus('idle')
      setMessage('')
    } catch (error) {
      setUploadStatus('error')
      setMessage('Error membaca file Excel. Pastikan format file benar.')
    }
  }

  const handleImport = async () => {
    if (!supabase) {
      setUploadStatus('error')
      setMessage('Supabase client tidak tersedia')
      return
    }

    setIsUploading(true)
    setUploadStatus('idle')

    try {
      // Insert medicines in batches
      const batchSize = 10
      for (let i = 0; i < previewData.length; i += batchSize) {
        const batch = previewData.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from('medicines')
          .insert(batch)

        if (error) {
          throw error
        }
      }

      setUploadStatus('success')
      setMessage(`Berhasil mengimport ${previewData.length} data obat`)
      setShowPreview(false)
      setPreviewData([])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onSuccess()
    } catch (error: any) {
      setUploadStatus('error')
      setMessage(`Error mengimport data: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Template Obat')

      // Define columns
      worksheet.columns = [
        { header: 'Nama Obat', key: 'name', width: 20 },
        { header: 'Deskripsi', key: 'description', width: 30 },
        { header: 'Satuan', key: 'unit', width: 10 },
        { header: 'Stock Awal', key: 'stock_initial', width: 12 },
        { header: 'Stock Saat Ini', key: 'stock_current', width: 12 },
        { header: 'Harga per Satuan', key: 'price_per_unit', width: 15 },
        { header: 'Tanggal Kadaluarsa', key: 'expiry_date', width: 15 },
        { header: 'Supplier', key: 'supplier', width: 20 },
        { header: 'Kategori', key: 'category', width: 15 }
      ]

      // Style header row
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add sample data
      worksheet.addRow({
        name: 'Amoxicillin 250mg',
        description: 'Antibiotik untuk infeksi bakteri',
        unit: 'ml',
        stock_initial: 100,
        stock_current: 100,
        price_per_unit: 5000,
        expiry_date: '2025-12-31',
        supplier: 'PT. Farmasi Sejahtera',
        category: 'Antibiotik'
      })

      worksheet.addRow({
        name: 'Vitamin B Complex',
        description: 'Vitamin untuk kesehatan hewan',
        unit: 'ml',
        stock_initial: 50,
        stock_current: 50,
        price_per_unit: 3000,
        expiry_date: '2025-06-30',
        supplier: 'CV. Suplemen Hewan',
        category: 'Vitamin'
      })

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 10, 15)
      })

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const data = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      saveAs(data, 'template_obat.xlsx')
    } catch (error) {
      setUploadStatus('error')
      setMessage('Error membuat template Excel')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Data Obat dari Excel</h3>
              <p className="text-sm text-gray-600">Upload file Excel untuk mengimport data obat secara massal</p>
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
          {!showPreview ? (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Download Template Excel</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Download template Excel untuk memastikan format data yang benar
                </p>
                <button
                  onClick={downloadTemplate}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>

              {/* Upload File */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload File Excel</h4>
                <p className="text-gray-600 mb-4">
                  Pilih file Excel (.xlsx) yang berisi data obat
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-file"
                />
                <label
                  htmlFor="excel-file"
                  className="btn-primary cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Pilih File Excel
                </label>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Format Data yang Diperlukan:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Nama Obat:</strong> Nama lengkap obat</li>
                  <li>• <strong>Deskripsi:</strong> Deskripsi obat</li>
                  <li>• <strong>Satuan:</strong> Satuan obat (ml, tablet, dll)</li>
                  <li>• <strong>Stock Awal:</strong> Jumlah stock awal</li>
                  <li>• <strong>Stock Saat Ini:</strong> Jumlah stock saat ini</li>
                  <li>• <strong>Harga per Satuan:</strong> Harga per satuan</li>
                  <li>• <strong>Tanggal Kadaluarsa:</strong> Format YYYY-MM-DD</li>
                  <li>• <strong>Supplier:</strong> Nama supplier</li>
                  <li>• <strong>Kategori:</strong> Kategori obat</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Data */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Preview Data ({previewData.length} obat)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Obat</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 10).map((medicine, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{medicine.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{medicine.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{medicine.stock_current}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">Rp {medicine.price_per_unit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                        ... dan {previewData.length - 10} data lainnya
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewData([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={isUploading}
                  className="btn-primary flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengimport...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import Data
                    </>
                  )}
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
                <CheckCircle className="h-5 w-5" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <FileSpreadsheet className="h-5 w-5" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
