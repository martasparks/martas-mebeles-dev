'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { generateAndDownloadInvoice, getPaymentMethodText, type Order } from '@/lib/invoice-utils';


export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const orderNumber = searchParams.get('orderNumber');
  const fromCheckout = searchParams.get('from') === 'checkout';

  useEffect(() => {
    // Protect against refresh - only allow access from checkout
    if (!fromCheckout || !orderNumber) {
      setError('Šī lapa nav pieejama');
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          setError('Pasūtījums nav atrasts');
        }
      } catch (err) {
        setError('Neizdevās ielādēt pasūtījuma informāciju');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, fromCheckout, router]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    setDownloadingInvoice(true);
    try {
      await generateAndDownloadInvoice(order);
    } catch (error) {
      console.error('Invoice download error:', error);
      alert('Notika kļūda lejupielādējot rēķinu');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Prevent back navigation and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      router.push('/');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ielādē pasūtījuma informāciju...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lapa nav pieejama</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500 mb-6">Jūs tiksat novirzīts uz sākumlapu...</p>
          </div>
        </div>
      </div>
    );
  }

  const isBillingDifferentFromShipping = 
    order.billingAddress !== order.shippingAddress ||
    order.billingCity !== order.shippingCity ||
    order.billingPostalCode !== order.shippingPostalCode ||
    order.billingCountry !== order.shippingCountry;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pasūtījums veiksmīgi noformēts!</h1>
          <p className="text-lg text-gray-600">
            Paldies par jūsu pasūtījumu. Apstiprinājums nosūtīts uz e-pastu.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pasūtījums #{order.orderNumber}</h2>
                <p className="text-sm text-gray-600">
                  Noformēts: {new Date(order.createdAt).toLocaleString('lv-LV')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  €{Number(order.totalAmount).toFixed(2)}
                </div>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Gaida apstiprinājumu
                </span>
              </div>
            </div>
          </div>

          {/* Customer and Payment Info */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Klienta informācija
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-medium">{order.customerFirstName} {order.customerLastName}</p>
                  <p>{order.customerEmail}</p>
                  {order.customerPhone && <p>{order.customerPhone}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Maksājuma informācija
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Veids:</span> {getPaymentMethodText(order.paymentMethod)}</p>
                  <p>
                    <span className="font-medium">Statuss:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Apmaksāts' : 'Gaida apmaksu'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Billing Address */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Norēķinu adrese
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>{order.billingAddress}</p>
                  <p>{order.billingCity}, {order.billingPostalCode}</p>
                  <p>{order.billingCountry}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Piegādes adrese
                  {!isBillingDifferentFromShipping && (
                    <span className="ml-2 text-xs text-green-600 font-normal">(tāda pati kā norēķinu)</span>
                  )}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>{order.shippingAddress}</p>
                  <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                  <p>{order.shippingCountry}</p>
                </div>
                {isBillingDifferentFromShipping && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    ⚠️ Piegādes adrese atšķiras no norēķinu adreses
                  </div>
                )}
              </div>
            </div>

            {order.orderNotes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pasūtījuma piezīmes</h3>
                <p className="text-sm text-gray-700">{order.orderNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Pasūtītie produkti ({order.items.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-xl font-bold">
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Daudzums: <span className="font-medium">{item.quantity}</span></span>
                      <span>Cena: <span className="font-medium">€{Number(item.price).toFixed(2)}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      €{(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Starpsumma:</span>
                <span className="font-medium text-gray-900">€{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Piegāde:</span>
                <span className="font-medium text-green-600">
                  {Number(order.shippingCost) > 0 ? `€${Number(order.shippingCost).toFixed(2)}` : 'Bezmaksas'}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">KOPĀ:</span>
                <span className="text-blue-600">€{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {downloadingInvoice ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Lejupielādē...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lejupielādēt rēķinu
                </>
              )}
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8a2 2 0 00-2 2m0 0a2 2 0 002 2h12.32a2 2 0 002-2m-2 0V9H7v4z" />
              </svg>
              Turpināt iepirkšanos
            </Link>
            
            {user && (
              <Link
                href="/profile/orders"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Skatīt visus pasūtījumus
              </Link>
            )}
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-4">
            <p className="font-medium mb-2">📧 Svarīga informācija:</p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• Pasūtījuma apstiprinājums nosūtīts uz e-pastu</li>
              <li>• Jautājumus varat uzdot: <a href="mailto:info@martasmebeles.lv" className="text-blue-600 hover:text-blue-800">info@martasmebeles.lv</a></li>
              <li>• Piegāde 3-5 darba dienu laikā</li>
              <li>• Bezmaksas piegāde visā Latvijā</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}