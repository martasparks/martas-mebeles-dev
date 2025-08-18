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
        <div className="space-y-2">
          <Link 
            href="/admin/translations" 
            className="block p-3 border rounded hover:bg-gray-50"
          >
            Tulkojumi
          </Link>
        </div>
      </div>
    </div>
  );
}