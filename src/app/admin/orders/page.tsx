'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED' | 'PARTIALLY_REFUNDED' | 'PENDING';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus?: PaymentStatus;
  totalAmount: number | string;
  createdAt: string;
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items: OrderItem[];
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Gaida apstrādi',
  PROCESSING: 'Apstrādā',
  SHIPPED: 'Nosūtīts',
  DELIVERED: 'Piegādāts',
  CANCELLED: 'Atcelts'
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve on refresh
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent('/profile/orders')}`);
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        const normalized = (data.orders || []).map((o: any) => ({
          ...o,
          // Prefer new field names, but be tolerant to legacy "status"
          orderStatus: (o.orderStatus ?? o.status) as OrderStatus,
          paymentStatus: o.paymentStatus as PaymentStatus | undefined,
          totalAmount: toNumber(o.totalAmount),
        }));
        setOrders(normalized);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-4 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="animate-pulse h-24 w-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6">Piekļuve liegta</div>;
  }

  const filteredOrders = selectedStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.orderStatus === selectedStatus);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Pasūtījumu pārvaldība</h1>
        
        {/* Filter by status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrēt pēc statusa:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'ALL')}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="ALL">Visi pasūtījumi</option>
            {Object.entries(statusLabels).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Ielādē pasūtījumus...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nav atrasti pasūtījumi
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasūtījuma Nr.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datums
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Darbības
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {order.customer.firstName && order.customer.lastName
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : order.customer.email
                        }
                      </div>
                      <div className="text-gray-500">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}>
                      {statusLabels[order.orderStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('lv-LV')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updatingOrder === order.id}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                    >
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {updatingOrder === order.id && (
                      <span className="ml-2 text-blue-600">Atjauno...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}