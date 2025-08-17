'use client';

import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string;
  orderNotes: string;
  sameAsBilling: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const cart = useCart();
  const toast = useToast();
  const { user, customer } = useAuth();
  const t = useTranslations('Checkout');
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'LV',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: 'LV',
    paymentMethod: 'bank_transfer',
    orderNotes: '',
    sameAsBilling: true,
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart.isLoading && cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart.isLoading, cart.items.length, router]);

  // Pre-fill form with customer data
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerEmail: customer.email || user?.email || '',
        customerFirstName: customer.firstName || '',
        customerLastName: customer.lastName || '',
        customerPhone: customer.phone || '',
        billingAddress: customer.address || '',
        billingCity: customer.city || '',
        billingCountry: customer.country || 'LV',
      }));
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        customerEmail: user.email || '',
        customerFirstName: user.user_metadata?.first_name || '',
        customerLastName: user.user_metadata?.last_name || '',
      }));
    }
  }, [customer, user]);

  // Update shipping address when "same as billing" changes
  useEffect(() => {
    if (formData.sameAsBilling) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: prev.billingAddress,
        shippingCity: prev.billingCity,
        shippingPostalCode: prev.billingPostalCode,
        shippingCountry: prev.billingCountry,
      }));
    }
  }, [formData.sameAsBilling, formData.billingAddress, formData.billingCity, formData.billingPostalCode, formData.billingCountry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.customerEmail.trim()) newErrors.customerEmail = t('required');
    if (!formData.customerFirstName.trim()) newErrors.customerFirstName = t('required');
    if (!formData.customerLastName.trim()) newErrors.customerLastName = t('required');
    if (!formData.billingAddress.trim()) newErrors.billingAddress = t('required');
    if (!formData.billingCity.trim()) newErrors.billingCity = t('required');
    if (!formData.billingPostalCode.trim()) newErrors.billingPostalCode = t('required');
    
    if (!formData.sameAsBilling) {
      if (!formData.shippingAddress.trim()) newErrors.shippingAddress = t('required');
      if (!formData.shippingCity.trim()) newErrors.shippingCity = t('required');
      if (!formData.shippingPostalCode.trim()) newErrors.shippingPostalCode = t('required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = t('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.showError('Lūdzu, aizpildiet visus obligātos laukus');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerEmail: formData.customerEmail,
        customerFirstName: formData.customerFirstName,
        customerLastName: formData.customerLastName,
        customerPhone: formData.customerPhone,
        billingAddress: formData.billingAddress,
        billingCity: formData.billingCity,
        billingPostalCode: formData.billingPostalCode,
        billingCountry: formData.billingCountry,
        shippingAddress: formData.sameAsBilling ? formData.billingAddress : formData.shippingAddress,
        shippingCity: formData.sameAsBilling ? formData.billingCity : formData.shippingCity,
        shippingPostalCode: formData.sameAsBilling ? formData.billingPostalCode : formData.shippingPostalCode,
        shippingCountry: formData.sameAsBilling ? formData.billingCountry : formData.shippingCountry,
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes,
        items: cart.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Clear cart
        cart.clearCart();
        
        // Show success message
        toast.showSuccess(t('orderSuccess'));
        
        // Redirect to success page with protection
        router.push(`/checkout/success?orderNumber=${result.order.orderNumber}&from=checkout`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.showError(t('orderError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingCost = 0;
  const grandTotal = cart.totalPrice + shippingCost;

  if (cart.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <nav className="text-sm text-gray-600">
            <Link href="/cart" className="hover:text-blue-600">{t('backToCart')}</Link>
            <span className="mx-2">→</span>
            <span className="text-gray-900">{t('title')}</span>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-7">
              <div className="space-y-8">
                {/* Billing Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">{t('billingInfo')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('firstName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerFirstName"
                        name="customerFirstName"
                        value={formData.customerFirstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.customerFirstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customerFirstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerFirstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="customerLastName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('lastName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerLastName"
                        name="customerLastName"
                        value={formData.customerLastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.customerLastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customerLastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerLastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('address')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingAddress && (
                        <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('city')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingCity"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.billingCity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingCity && (
                        <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('postalCode')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingPostalCode"
                        name="billingPostalCode"
                        value={formData.billingPostalCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingPostalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">{t('shippingInfo')}</h2>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sameAsBilling"
                        checked={formData.sameAsBilling}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('sameAsBilling')}</span>
                    </label>
                  </div>

                  {!formData.sameAsBilling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('address')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="shippingAddress"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.shippingAddress && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('city')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="shippingCity"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingCity ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.shippingCity && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingCity}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('postalCode')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="shippingPostalCode"
                          name="shippingPostalCode"
                          value={formData.shippingPostalCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingPostalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingPostalCode}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">{t('paymentMethod')}</h2>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('bankTransfer')}</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('cashOnDelivery')}</span>
                    </label>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">{t('orderNotes')}</h2>
                  <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder={t('orderNotesPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('orderSummary')}</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm font-bold">
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-medium text-gray-900">€{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span className="font-medium text-green-600">{t('freeShipping')}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-medium">
                      <span className="text-gray-900">{t('total')}</span>
                      <span className="text-gray-900">€{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('processingOrder')}</span>
                    </div>
                  ) : (
                    t('placeOrder')
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <span className="text-xs text-gray-500">
                    🚚 Bezmaksas piegāde visā Latvijā
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}