'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { generateAndDownloadInvoice, getPaymentMethodText, type Order } from '@/lib/invoice-utils';


export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
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

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Gaida apstiprinājumu';
      case 'confirmed': return 'Apstiprināts';
      case 'processing': return 'Apstrādā';
      case 'shipped': return 'Nosūtīts';
      case 'delivered': return 'Piegādāts';
      case 'cancelled': return 'Atcelts';
      default: return status;
    }
  };


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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pasūtījums nav atrasts</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Atgriezties uz sākumlapu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pasūtījums veiksmīgi noformēts!</h1>
          <p className="text-gray-600">
            Paldies par jūsu pasūtījumu. Mēs nosūtīsim apstiprinājumu uz e-pastu.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Pasūtījums #{order.orderNumber}</h2>
                <p className="text-sm text-gray-600">
                  Noformēts: {new Date(order.createdAt).toLocaleString('lv-LV')}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                  {getStatusText(order.orderStatus)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Klienta informācija</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.customerFirstName} {order.customerLastName}</p>
                  <p>{order.customerEmail}</p>
                  {order.customerPhone && <p>{order.customerPhone}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Maksājuma informācija</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Veids: {getPaymentMethodText(order.paymentMethod)}</p>
                  <p>Statuss: 
                    <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Apmaksāts' : 'Gaida apmaksu'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Norēķinu adrese</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.billingAddress}</p>
                  <p>{order.billingCity}, {order.billingPostalCode}</p>
                  <p>{order.billingCountry}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Piegādes adrese</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress}</p>
                  <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                  <p>{order.shippingCountry}</p>
                </div>
              </div>
            </div>

            {order.orderNotes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Pasūtījuma piezīmes</h3>
                <p className="text-sm text-gray-600">{order.orderNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pasūtītie produkti</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 text-lg font-bold">
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Daudzums: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Cena: €{Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    €{(Number(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Starpsumma:</span>
                <span className="font-medium">€{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Piegāde:</span>
                <span className="font-medium text-green-600">
                  {Number(order.shippingCost) > 0 ? `€${Number(order.shippingCost).toFixed(2)}` : 'Bezmaksas'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
                <span>Kopā:</span>
                <span>€{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
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
              Turpināt iepirkšanos
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Apskatīt profilu
            </Link>
          </div>
          
          <p className="text-sm text-gray-600">
            Jautājumi par pasūtījumu? Sazinieties ar mums: 
            <a href="mailto:info@martasmebeles.lv" className="text-blue-600 hover:text-blue-800 ml-1">
              info@martasmebeles.lv
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}