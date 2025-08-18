'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

type Customer = {
  id: string;
  supabaseUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  preferredLocale?: string;
  newsletterSubscribed: boolean;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

type AuthContextType = {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const isAdmin = user?.user_metadata?.is_super_admin === true;

  const fetchCustomerProfile = async (userId: string, updateLogin = true) => {
    try {
      const response = await fetch('/api/customer/profile');
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
        // Update last login after successful profile fetch (but avoid infinite loop)
        if (updateLogin) {
          await updateLastLogin();
        }
      } else if (response.status === 404) {
        // Customer profile doesn't exist, create it
        await createCustomerProfile();
      }
    } catch (error) {
      // Try to create profile if fetch fails
      await createCustomerProfile();
    }
  };

  const createCustomerProfile = async () => {
    try {
      const response = await fetch('/api/customer/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const updateLastLogin = async () => {
    try {
      const response = await fetch('/api/customer/update-login', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh customer data to get updated lastLoginAt (without triggering another login update)
        const profileResponse = await fetch('/api/customer/profile');
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setCustomer(data.customer);
        }
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const refreshCustomer = async () => {
    if (user) {
      await fetchCustomerProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser && currentUser.email_confirmed_at) {
        await fetchCustomerProfile(currentUser.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Check if email is verified before fetching customer profile
          if (currentUser.email_confirmed_at) {
            await fetchCustomerProfile(currentUser.id);
          } else {
            // User exists but email not verified - don't fetch customer profile
            setCustomer(null);
          }
        } else {
          setCustomer(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  const value = {
    user,
    customer,
    loading,
    isAdmin,
    signOut,
    refreshCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}