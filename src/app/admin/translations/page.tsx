'use client';

import { useState, useEffect } from 'react';
import { type Locale } from '@/lib/translation-system';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

interface Translation {
  id: number;
  key: string;
  locale: Locale;
  value: string;
  namespace?: string;
}

export default function TranslationsPage() {
  const { loading: authLoading, isAuthorized } = useAdminAuth();
  const toast = useToast();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('lv');
  const [searchTerm, setSearchTerm] = useState('');
  const [multiLanguageMode, setMultiLanguageMode] = useState(false);
  const [multipleTranslationsMode, setMultipleTranslationsMode] = useState(false);
  const [newValueLv, setNewValueLv] = useState('');
  const [newValueEn, setNewValueEn] = useState('');
  const [newValueRu, setNewValueRu] = useState('');
  
  // Multiple translations state
  const [translationFields, setTranslationFields] = useState([{
    id: Date.now(),
    key: '',
    valueLv: '',
    valueEn: '',
    valueRu: ''
  }]);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const response = await fetch('/api/admin/translations');
      if (!response.ok) {
        throw new Error('Failed to load translations');
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.showError('Neizdevās ielādēt tulkojumus');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditValue(translation.value);
  };

  const handleSave = async (translation: Translation) => {
    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translation.key,
          locale: translation.locale,
          value: editValue,
          namespace: translation.namespace
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save translation');
      }

      await loadTranslations();
      setEditingId(null);
      toast.showSuccess('Tulkojums veiksmīgi saglabāts');
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.showError('Neizdevās saglabāt tulkojumu');
    }
  };

  const handleAdd = async () => {
    if (multiLanguageMode) {
      // Multi-language mode
      if (!newKey || (!newValueLv && !newValueEn && !newValueRu)) {
        toast.showError('Lūdzu, ievadiet atslēgu un vismaz vienu tulkojumu');
        return;
      }

      try {
        const translations = [];
        if (newValueLv) translations.push({ key: newKey, locale: 'lv' as Locale, value: newValueLv });
        if (newValueEn) translations.push({ key: newKey, locale: 'en' as Locale, value: newValueEn });
        if (newValueRu) translations.push({ key: newKey, locale: 'ru' as Locale, value: newValueRu });

        const response = await fetch('/api/admin/translations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ translations })
        });

        if (!response.ok) {
          throw new Error('Failed to add translations');
        }

        await loadTranslations();
        setNewKey('');
        setNewValueLv('');
        setNewValueEn('');
        setNewValueRu('');
        toast.showSuccess(`Tulkojumi "${newKey}" veiksmīgi pievienoti ${translations.length} valodām`);
      } catch (error) {
        console.error('Error adding translations:', error);
        toast.showError('Neizdevās pievienot tulkojumus');
      }
    } else {
      // Single language mode
      if (!newKey || !newValue) {
        toast.showError('Lūdzu, aizpildiet visus laukus');
        return;
      }
      
      try {
        const response = await fetch('/api/admin/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: newKey,
            locale: selectedLocale,
            value: newValue
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add translation');
        }

        await loadTranslations();
        setNewKey('');
        setNewValue('');
        toast.showSuccess(`Tulkojums "${newKey}" veiksmīgi pievienots`);
      } catch (error) {
        console.error('Error adding translation:', error);
        toast.showError('Neizdevās pievienot tulkojumu');
      }
    }
  };

  const handleDelete = async (translation: Translation) => {
    if (!confirm(`Vai tiešām vēlaties dzēst tulkojumu "${translation.key}" (${translation.locale})?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/translations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translation.key,
          locale: translation.locale,
          namespace: translation.namespace
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete translation');
      }

      await loadTranslations();
      toast.showSuccess(`Tulkojums "${translation.key}" (${translation.locale}) veiksmīgi izdzēsts`);
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast.showError('Neizdevās izdzēst tulkojumu');
    }
  };

  // Multiple fields functions
  const addTranslationField = () => {
    setTranslationFields([...translationFields, {
      id: Date.now(),
      key: '',
      valueLv: '',
      valueEn: '',
      valueRu: ''
    }]);
  };

  const removeTranslationField = (id: number) => {
    if (translationFields.length > 1) {
      setTranslationFields(translationFields.filter(field => field.id !== id));
    }
  };

  const updateTranslationField = (id: number, field: string, value: string) => {
    setTranslationFields(translationFields.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveAll = async () => {
    const validFields = translationFields.filter(field => 
      field.key && (field.valueLv || field.valueEn || field.valueRu)
    );

    if (validFields.length === 0) {
      toast.showError('Lūdzu, aizpildiet vismaz vienu tulkojumu');
      return;
    }

    try {
      const allTranslations = [];
      validFields.forEach(field => {
        if (field.valueLv) allTranslations.push({ key: field.key, locale: 'lv' as Locale, value: field.valueLv });
        if (field.valueEn) allTranslations.push({ key: field.key, locale: 'en' as Locale, value: field.valueEn });
        if (field.valueRu) allTranslations.push({ key: field.key, locale: 'ru' as Locale, value: field.valueRu });
      });

      const response = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: allTranslations })
      });

      if (!response.ok) {
        throw new Error('Failed to add translations');
      }

      await loadTranslations();
      
      // Reset all fields
      setTranslationFields([{
        id: Date.now(),
        key: '',
        valueLv: '',
        valueEn: '',
        valueRu: ''
      }]);
      
      toast.showSuccess(`Veiksmīgi pievienoti ${allTranslations.length} tulkojumi ${validFields.length} atslēgām`);
    } catch (error) {
      console.error('Error adding translations:', error);
      toast.showError('Neizdevās pievienot tulkojumus');
    }
  };

  if (authLoading || loading) {
    return <div className="p-6">Ielādē...</div>;
  }

  if (!isAuthorized) {
    return <div className="p-6">Piekļuve liegta</div>;
  }

  // Filter translations based on search term
  const filteredTranslations = translations.filter(translation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      translation.key.toLowerCase().includes(searchLower) ||
      translation.value.toLowerCase().includes(searchLower)
    );
  });

  // Group by namespace (first part of key before first dot)
  const groupedByNamespace = filteredTranslations.reduce((acc, translation) => {
    const namespace = translation.key.includes('.') 
      ? translation.key.split('.')[0] 
      : 'Citi'; // For keys without dots
    
    if (!acc[namespace]) {
      acc[namespace] = {};
    }
    
    if (!acc[namespace][translation.key]) {
      acc[namespace][translation.key] = {} as Partial<Record<Locale, Translation>>;
    }
    
    acc[namespace][translation.key][translation.locale] = translation;
    return acc;
  }, {} as Record<string, Record<string, Partial<Record<Locale, Translation>>>>);

  // Sort namespaces alphabetically
  const sortedNamespaces = Object.keys(groupedByNamespace).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Admin Panel
              </Link>
              <div className="text-gray-300">/</div>
              <h1 className="text-xl font-semibold text-gray-900">Tulkojumu pārvaldība</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Translation Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pievienot jaunu tulkojumu</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Režīms:</span>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputMode"
                    checked={!multiLanguageMode && !multipleTranslationsMode}
                    onChange={() => {
                      setMultiLanguageMode(false);
                      setMultipleTranslationsMode(false);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Parastais</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputMode"
                    checked={multiLanguageMode}
                    onChange={() => {
                      setMultiLanguageMode(true);
                      setMultipleTranslationsMode(false);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Visas valodas</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputMode"
                    checked={multipleTranslationsMode}
                    onChange={() => {
                      setMultiLanguageMode(false);
                      setMultipleTranslationsMode(true);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Vairāki tulkojumi</span>
                </label>
              </div>
            </div>
          </div>
          
          {multipleTranslationsMode ? (
            // Multiple translations mode
            <div className="space-y-6">
              {translationFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">
                      Tulkojums #{index + 1}
                    </h3>
                    {translationFields.length > 1 && (
                      <button
                        onClick={() => removeTranslationField(field.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Noņemt šo tulkojumu"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atslēga</label>
                      <input
                        type="text"
                        placeholder="Piemēram: menu.home"
                        value={field.key}
                        onChange={(e) => updateTranslationField(field.id, 'key', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <span className="flex items-center">
                            🇱🇻 Latviešu (LV)
                          </span>
                        </label>
                        <textarea
                          placeholder="Ievadiet tulkojumu latviešu valodā..."
                          value={field.valueLv}
                          onChange={(e) => updateTranslationField(field.id, 'valueLv', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <span className="flex items-center">
                            🇺🇸 English (EN)
                          </span>
                        </label>
                        <textarea
                          placeholder="Enter translation in English..."
                          value={field.valueEn}
                          onChange={(e) => updateTranslationField(field.id, 'valueEn', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <span className="flex items-center">
                            🇷🇺 Русский (RU)
                          </span>
                        </label>
                        <textarea
                          placeholder="Введите перевод на русском..."
                          value={field.valueRu}
                          onChange={(e) => updateTranslationField(field.id, 'valueRu', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center">
                <button
                  onClick={addTranslationField}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Pievienot papildus lauku
                </button>
                
                <button
                  onClick={handleSaveAll}
                  disabled={translationFields.every(field => !field.key || (!field.valueLv && !field.valueEn && !field.valueRu))}
                  className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Saglabāt visu
                </button>
              </div>
            </div>
          ) : multiLanguageMode ? (
            // Multi-language input mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atslēga</label>
                <input
                  type="text"
                  placeholder="Piemēram: menu.home"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      🇱🇻 Latviešu (LV)
                    </span>
                  </label>
                  <textarea
                    placeholder="Ievadiet tulkojumu latviešu valodā..."
                    value={newValueLv}
                    onChange={(e) => setNewValueLv(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      🇺🇸 English (EN)
                    </span>
                  </label>
                  <textarea
                    placeholder="Enter translation in English..."
                    value={newValueEn}
                    onChange={(e) => setNewValueEn(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      🇷🇺 Русский (RU)
                    </span>
                  </label>
                  <textarea
                    placeholder="Введите перевод на русском..."
                    value={newValueRu}
                    onChange={(e) => setNewValueRu(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAdd}
                  disabled={!newKey || (!newValueLv && !newValueEn && !newValueRu)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Pievienot visām valodām
                </button>
              </div>
            </div>
          ) : (
            // Single language input mode
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Atslēga</label>
              <input
                type="text"
                placeholder="Piemēram: menu.home"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Valoda</label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value as Locale)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lv">LV - Latviešu</option>
                <option value="en">EN - English</option>
                <option value="ru">RU - Русский</option>
              </select>
            </div>
            
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tulkojums</label>
              <input
                type="text"
                placeholder="Ievadiet tulkojumu..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="lg:col-span-2 flex items-end">
              <button
                onClick={handleAdd}
                disabled={!newKey || !newValue}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Pievienot
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meklēt tulkojumus</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Meklēt pēc atslēgas vai tulkojuma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg 
                  className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Notīrīt
              </button>
            )}
          </div>
        </div>

        {/* Translations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchTerm ? 'Meklēšanas rezultāti' : 'Visi tulkojumi'}
              </h2>
              <div className="text-sm text-gray-500">
                {searchTerm ? (
                  <>Atrasti: {filteredTranslations.length} no {translations.length} tulkojumiem</>
                ) : (
                  <>Kopā: {translations.length} tulkojumi, {sortedNamespaces.length} sadaļas</>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6 p-6">
            {sortedNamespaces.map((namespace) => (
              <div key={namespace} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {namespace === 'Citi' ? 'Citi tulkojumi' : `${namespace.charAt(0).toUpperCase() + namespace.slice(1)} sadaļa`}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Atslēga
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          LV - Latviešu
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EN - English
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RU - Русский
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {Object.entries(groupedByNamespace[namespace]).map(([key, locales], index) => (
                        <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {key}
                            </code>
                          </td>
                          {(['lv', 'en', 'ru'] as Locale[]).map((locale) => {
                            const translation = locales[locale];
                            const isEditing = editingId === translation?.id;
                            
                            return (
                              <td key={locale} className="px-4 py-3">
                                {translation ? (
                                  isEditing ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={2}
                                      />
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleSave(translation)}
                                          className="px-3 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                        >
                                          Saglabāt
                                        </button>
                                        <button
                                          onClick={() => setEditingId(null)}
                                          className="px-3 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                                        >
                                          Atcelt
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between group">
                                      <div className="flex-1 mr-3">
                                        <p className="text-sm text-gray-900 leading-relaxed">
                                          {translation.value}
                                        </p>
                                      </div>
                                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                                        <button
                                          onClick={() => handleEdit(translation)}
                                          className="px-2 py-1 text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
                                          title="Rediģēt tulkojumu"
                                        >
                                          Rediģēt
                                        </button>
                                        <button
                                          onClick={() => handleDelete(translation)}
                                          className="px-2 py-1 text-xs font-medium rounded text-red-600 bg-red-100 hover:bg-red-200"
                                          title="Dzēst tulkojumu"
                                        >
                                          Dzēst
                                        </button>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <div className="flex items-center justify-center py-2">
                                    <span className="text-gray-400 text-sm italic">Nav tulkojuma</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          
          {sortedNamespaces.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nav rezultātu</h3>
                  <p className="text-gray-500">Meklēšanas kritērijiem neatbilst neviens tulkojums.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Notīrīt meklēšanu
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nav tulkojumu</h3>
                  <p className="text-gray-500">Sāciet ar pirmo tulkojuma pievienošanu augšpusē.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}