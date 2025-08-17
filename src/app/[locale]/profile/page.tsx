'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, customer, loading, refreshCustomer } = useAuth();
  const [creating, setCreating] = useState(false);
  const t = useTranslations('Profile');
  const router = useRouter();

  const handleCreateProfile = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/customer/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        await refreshCustomer();
      }
    } catch (error) {
      // Silently handle error
    }
    setCreating(false);
  };


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              {!customer && (
                <button
                  onClick={handleCreateProfile}
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Profile'}
                </button>
              )}
            </div>
          </div>
          <div className="px-6 py-4">
            {!customer ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Profile Not Found</h3>
                  <p className="text-gray-500 mb-4">Your customer profile hasn't been created yet. Click the button above to create it.</p>
                  <p className="text-sm text-gray-400">Your Supabase account: <span className="font-mono">{user.email}</span></p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900">
                  {customer?.fullName || user.user_metadata?.full_name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{customer?.email || user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <p className="text-gray-900">
                  {customer?.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <p className="text-gray-900">
                  {customer?.country || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <p className="text-gray-900">
                  {customer?.city || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <p className="text-gray-900">
                  {customer?.preferredLocale || 'lv'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <p className="text-gray-900">
                  {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Verified
                </label>
                <p className="text-gray-900">
                  {customer?.emailVerified || user.email_confirmed_at ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <p className="text-gray-900">
                  {customer?.lastLoginAt 
                    ? new Date(customer.lastLoginAt).toLocaleString() 
                    : 'Never'
                  }
                </p>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}