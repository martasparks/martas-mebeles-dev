'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdminAuth() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/lv/auth/login?redirect=/admin');
        return;
      }
      
      if (!isAdmin) {
        router.push('/lv');
        return;
      }
    }
  }, [user, isAdmin, loading, router]);

  return {
    user,
    isAdmin,
    loading,
    isAuthorized: user && isAdmin
  };
}