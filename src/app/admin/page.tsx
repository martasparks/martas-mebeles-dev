'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

export default function AdminPage() {
  const { loading, isAuthorized } = useAdminAuth();

  if (loading) {
    return <div className="p-6">Ielādē...</div>;
  }

  if (!isAuthorized) {
    return <div className="p-6">Piekļuve liegta</div>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-4">Pieejamās sadaļas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/orders" 
            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📦
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pasūtījumi</h3>
                <p className="text-sm text-gray-500">Pārvaldīt pasūtījumus un statusus</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/admin/products" 
            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                🛋️
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Produkti</h3>
                <p className="text-sm text-gray-500">Pārvaldīt produktus un katalāgu</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/admin/translations" 
            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                🌍
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tulkojumi</h3>
                <p className="text-sm text-gray-500">Pārvaldīt vietnes tulkojumus</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/admin/slider" 
            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                🎞️
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Slaideris</h3>
                <p className="text-sm text-gray-500">Pārvaldīt mājas lapas slaiderus</p>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/admin/topbar" 
            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                📢
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Augšējā josla</h3>
                <p className="text-sm text-gray-500">Pārvaldīt augšējās joslas tekstu</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}