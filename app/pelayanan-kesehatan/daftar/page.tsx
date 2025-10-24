'use client'

import { useAuth } from '@/components/AuthProvider'
import { supabase, HealthService } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import Breadcrumb from '@/components/Breadcrumb'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

export default function DaftarPelayananKesehatanPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<HealthService[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchServices()
    }
  }, [user])

  const fetchServices = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      let query = supabase
        .from('health_services')
        .select(`
          *,
          animals(
            name,
            species,
            breed,
            age_months,
            gender,
            weight_kg,
            color,
            animal_owners(
              name,
              phone,
              village,
              district
            )
          ),
          upt(name)
        `)
        .order('created_at', { ascending: false })

      // Filter berdasarkan role
      if (user?.role === 'upt') {
        query = query.eq('upt_id', user.upt_id)
      }

      const { data, error } = await query

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

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
    { label: 'Pelayanan Kesehatan' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Daftar Pelayanan Kesehatan Hewan"
        subtitle="Semua pelayanan kesehatan hewan yang telah dicatat"
        backUrl={user.role === 'dinas' ? '/dinas' : '/upt'}
        actions={
          <button
            onClick={() => router.push('/pelayanan-kesehatan')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Pelayanan
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        {loadingServices ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemilik & Hewan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Pelayanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dokter Hewan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UPT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(service.service_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{service.animals?.animal_owners?.name}</div>
                          <div className="text-gray-500">
                            {service.animals?.name && `${service.animals.name} - `}
                            {service.animals?.species} 
                            {service.animals?.breed && ` (${service.animals.breed})`}
                          </div>
                          <div className="text-xs text-gray-400">
                            {service.animals?.animal_owners?.village}, {service.animals?.animal_owners?.district}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {service.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {service.diagnosis || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.veterinarian_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          service.status === 'selesai' 
                            ? 'bg-green-100 text-green-800'
                            : service.status === 'rawat_jalan'
                            ? 'bg-yellow-100 text-yellow-800'
                            : service.status === 'rawat_inap'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {service.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.upt?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {services.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  Belum ada pelayanan kesehatan yang dicatat
                </div>
                <button
                  onClick={() => router.push('/pelayanan-kesehatan')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tambah Pelayanan Pertama
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
