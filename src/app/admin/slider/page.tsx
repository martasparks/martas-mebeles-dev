'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/contexts/ToastContext';
import { useState, useEffect } from 'react';

interface Slider {
  id: string;
  title?: string;
  description?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SliderPage() {
  const { loading, isAuthorized } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true
  });
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/admin/slider');
      const data = await response.json();
      setSliders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      setSliders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('linkUrl', formData.linkUrl);
    submitData.append('sortOrder', formData.sortOrder.toString());
    submitData.append('isActive', formData.isActive.toString());
    
    if (desktopImage) submitData.append('desktopImage', desktopImage);
    if (mobileImage) submitData.append('mobileImage', mobileImage);

    try {
      const url = editingSlider ? `/api/admin/slider/${editingSlider.id}` : '/api/admin/slider';
      const method = editingSlider ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: submitData
      });

      if (response.ok) {
        resetForm();
        fetchSliders();
        showSuccess(
          editingSlider ? 'Slaids veiksmīgi atjaunināts!' : 'Slaids veiksmīgi izveidots!',
          'Veiksmīgi'
        );
      } else {
        const error = await response.json();
        showError(error.error || 'Radās kļūda saglabājot slaidu', 'Kļūda');
      }
    } catch (error) {
      console.error('Error saving slider:', error);
      showError('Radās kļūda saglabājot slaidu', 'Kļūda');
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      description: slider.description || '',
      linkUrl: slider.linkUrl || '',
      sortOrder: slider.sortOrder,
      isActive: slider.isActive
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo slaidu?')) return;

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSliders();
        showSuccess('Slaids veiksmīgi dzēsts!', 'Veiksmīgi');
      } else {
        const error = await response.json();
        showError(error.error || 'Radās kļūda dzēšot slaidu', 'Kļūda');
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      showError('Radās kļūda dzēšot slaidu', 'Kļūda');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      linkUrl: '',
      sortOrder: 0,
      isActive: true
    });
    setDesktopImage(null);
    setMobileImage(null);
    setIsCreating(false);
    setEditingSlider(null);
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
        <h1 className="text-2xl font-bold">Slaideris</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Pievienot jaunu slaidu
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingSlider ? 'Rediģēt slaidu' : 'Jauns slaids'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nosaukums</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Slaida nosaukums (nav obligāts)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Saites URL</label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://... (nav obligāts)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apraksts</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Slaida apraksts (nav obligāts)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Desktop attēls {!editingSlider && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDesktopImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingSlider}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile attēls {!editingSlider && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMobileImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingSlider}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kārtība</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Aktīvs</label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSlider ? 'Saglabāt izmaiņas' : 'Izveidot slaidu'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Atcelt
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Ielādē slaides...</div>
      ) : (
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Esošās slaides ({sliders.length})</h2>
          </div>
          
          {sliders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nav pievienotu slaidu
            </div>
          ) : (
            <div className="divide-y">
              {sliders.map((slider) => (
                <div key={slider.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <img 
                          src={slider.desktopImageUrl} 
                          alt="Desktop"
                          className="w-16 h-12 object-cover rounded border"
                        />
                        <img 
                          src={slider.mobileImageUrl} 
                          alt="Mobile"
                          className="w-8 h-12 object-cover rounded border"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {slider.title || `Slaids #${slider.sortOrder}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Kārtība: {slider.sortOrder} | 
                          {slider.isActive ? ' Aktīvs' : ' Neaktīvs'}
                          {slider.linkUrl && ' | Ar saiti'}
                        </p>
                        {slider.description && (
                          <p className="text-sm text-gray-600 mt-1">{slider.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(slider)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Rediģēt
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Dzēst
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}