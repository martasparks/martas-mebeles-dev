import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCustomerData {
  supabaseUserId: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  preferredLocale?: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  preferredLocale?: string;
  newsletterSubscribed?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: Date;
}

export class CustomerService {
  static async createCustomer(data: CreateCustomerData) {
    try {
      const customer = await prisma.customer.create({
        data: {
          supabaseUserId: data.supabaseUserId,
          email: data.email,
          fullName: data.fullName,
          firstName: data.firstName,
          lastName: data.lastName,
          preferredLocale: data.preferredLocale || 'lv',
          country: 'LV',
          isActive: true,
          emailVerified: true, // Email is verified when customer is created via webhook
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer profile');
    }
  }

  static async getCustomerBySupabaseId(supabaseUserId: string) {
    try {
      const customer = await prisma.customer.findUnique({
        where: {
          supabaseUserId,
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer profile');
    }
  }

  static async getCustomerByEmail(email: string) {
    try {
      const customer = await prisma.customer.findUnique({
        where: {
          email,
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error fetching customer by email:', error);
      throw new Error('Failed to fetch customer profile');
    }
  }

  static async updateCustomer(supabaseUserId: string, data: UpdateCustomerData) {
    try {
      const customer = await prisma.customer.update({
        where: {
          supabaseUserId,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer profile');
    }
  }

  static async updateLastLogin(supabaseUserId: string) {
    try {
      const customer = await prisma.customer.update({
        where: {
          supabaseUserId,
        },
        data: {
          lastLoginAt: new Date(),
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }

  static async markEmailAsVerified(supabaseUserId: string) {
    try {
      const customer = await prisma.customer.update({
        where: {
          supabaseUserId,
        },
        data: {
          emailVerified: true,
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error marking email as verified:', error);
      throw new Error('Failed to mark email as verified');
    }
  }

  static async deactivateCustomer(supabaseUserId: string) {
    try {
      const customer = await prisma.customer.update({
        where: {
          supabaseUserId,
        },
        data: {
          isActive: false,
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Error deactivating customer:', error);
      throw new Error('Failed to deactivate customer');
    }
  }
}