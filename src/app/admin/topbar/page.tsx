'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/contexts/ToastContext';
import { useState, useEffect } from 'react';

interface TopBarMessage {
  id: string;
  locale: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TopBarPage() {
  const { loading, isAuthorized } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const [messages, setMessages] = useState<TopBarMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLocale, setEditingLocale] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    message: '',
    isActive: true
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/topbar');
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (message: TopBarMessage) => {
    setEditingLocale(message.locale);
    setEditForm({
      message: message.message,
      isActive: message.isActive
    });
  };

  const handleSave = async () => {
    if (!editingLocale) return;

    try {
      const response = await fetch('/api/admin/topbar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: editingLocale,
          message: editForm.message.trim(),
          isActive: editForm.isActive
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save message');
      }
      
      await fetchMessages();
      setEditingLocale(null);
      showSuccess('Ziņojums veiksmīgi saglabāts!', 'Veiksmīgi');
    } catch (error) {
      console.error('Error saving message:', error);
      showError(error instanceof Error ? error.message : 'Radās kļūda saglabājot ziņojumu', 'Kļūda');
    }
  };

  const handleCancel = () => {
    setEditingLocale(null);
    setEditForm({ message: '', isActive: true });
  };

  const getLanguageName = (locale: string) => {
    const names: Record<string, string> = {
      lv: 'Latviešu',
      en: 'English', 
      ru: 'Русский'
    };
    return names[locale] || locale;
  };

  if (loading) {
    return <div className="p-6">Ielādē...</div>;
  }

  if (!isAuthorized) {
    return <div className="p-6">Piekļuve liegta</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Augšējā josla</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Ielādē ziņojumus...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Top Bar ziņojumi ({messages.length})</h2>
          </div>
          
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nav pievienotu ziņojumu
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valoda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ziņojums
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statuss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atjaunināts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Darbības
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {message.locale.toUpperCase()}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {getLanguageName(message.locale)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingLocale === message.locale ? (
                          <input
                            type="text"
                            value={editForm.message}
                            onChange={(e) => setEditForm({...editForm, message: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm text-gray-900 max-w-md">
                            {message.message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingLocale === message.locale ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                              className="mr-2"
                            />
                            <span className="text-sm">Aktīvs</span>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.isActive ? 'Aktīvs' : 'Neaktīvs'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.updatedAt).toLocaleDateString('lv-LV', {
                          year: 'numeric',
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingLocale === message.locale ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-900"
                            >
                              Saglabāt
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Atcelt
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(message)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Rediģēt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {messages.length > 0 && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Priekšskatījums</h2>
          <div className="space-y-3">
            {messages.filter(m => m.isActive).map((message) => (
              <div key={message.locale}>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getLanguageName(message.locale)}:
                </div>
                <div className="bg-blue-600 text-white py-2 px-4 rounded">
                  <div className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    <span className="inline-block">
                      {message.message} • {message.message} • {message.message}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}