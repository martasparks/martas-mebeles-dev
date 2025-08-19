'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { ImageUpload } from '@/components/ui/image-upload';

interface Brand {
  id: string;
  name: string;
  code: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StockStatus {
  id: string;
  name: string;
  code: string;
  color?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  salePrice?: number;
  stock: number;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  isVisible: boolean;
  isActive: boolean;
  slug: string;
  mainImageUrl?: string;
  imageUrls: string[];
  brandId: string;
  categoryId: string;
  stockStatusId: string;
  brand: Brand;
  category: Category;
  stockStatus: StockStatus;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading, isAuthorized } = useAdminAuth();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockStatuses, setStockStatuses] = useState<StockStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    fullDescription: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    price: '',
    salePrice: '',
    stock: '',
    width: '',
    height: '',
    depth: '',
    weight: '',
    isVisible: true,
    isActive: true,
    brandId: '',
    categoryId: '',
    stockStatusId: '',
    mainImageUrl: '',
    imageUrls: [] as string[]
  });

  useEffect(() => {
    if (isAuthorized && params.id) {
      loadProduct();
      loadMasterData();
    }
  }, [isAuthorized, params.id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data.product);
      
      // Set form data
      setFormData({
        name: data.product.name || '',
        shortDescription: data.product.shortDescription || '',
        fullDescription: data.product.fullDescription || '',
        slug: data.product.slug || '',
        metaTitle: data.product.metaTitle || '',
        metaDescription: data.product.metaDescription || '',
        price: data.product.price?.toString() || '',
        salePrice: data.product.salePrice?.toString() || '',
        stock: data.product.stock?.toString() || '',
        width: data.product.width?.toString() || '',
        height: data.product.height?.toString() || '',
        depth: data.product.depth?.toString() || '',
        weight: data.product.weight?.toString() || '',
        isVisible: data.product.isVisible ?? true,
        isActive: data.product.isActive ?? true,
        brandId: data.product.brandId || '',
        categoryId: data.product.categoryId || '',
        stockStatusId: data.product.stockStatusId || '',
        mainImageUrl: data.product.mainImageUrl || '',
        imageUrls: data.product.imageUrls || []
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast.showError('Neizdevās ielādēt produktu');
      router.push('/admin/products');
    }
  };

  const loadMasterData = async () => {
    try {
      const [brandsRes, categoriesRes, stockStatusesRes] = await Promise.all([
        fetch('/api/products/brands'),
        fetch('/api/products/categories'), 
        fetch('/api/products/stock-statuses')
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (stockStatusesRes.ok) {
        const stockStatusesData = await stockStatusesRes.json();
        setStockStatuses(stockStatusesData.stockStatuses || []);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          stock: parseInt(formData.stock) || 0,
          width: formData.width ? parseFloat(formData.width) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          depth: formData.depth ? parseFloat(formData.depth) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      toast.showSuccess('Produkts veiksmīgi atjaunināts');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.showError('Neizdevās atjaunināt produktu');
    } finally {
      setSaving(false);
    }
  };

  const handleMainImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      mainImageUrl: imageUrl
    }));
  };

  const handleAdditionalImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, imageUrl]
    }));
  };

  const handleAdditionalImageDeleted = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleImageDeleted = () => {
    setFormData(prev => ({
      ...prev,
      mainImageUrl: ''
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <div className="p-6">Piekļuve liegta</div>;
  }

  if (!product) {
    return <div className="p-6">Produkts nav atrasts</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/products" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Produkti
              </Link>
              <div className="text-gray-300">/</div>
              <h1 className="text-xl font-semibold text-gray-900">Rediģēt produktu</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pamatinformācija</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nosaukums *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ražotājs *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Izvēlieties ražotāju</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorija *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Izvēlieties kategoriju</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Īss apraksts
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilns apraksts
                </label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cena un noliktava</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena (EUR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akcijas cena (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daudzums noliktavā
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noliktavas statuss *
                </label>
                <select
                  value={formData.stockStatusId}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockStatusId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Izvēlieties statusu</option>
                  {stockStatuses.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attēli</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Galvenais attēls
              </label>
              {formData.mainImageUrl && (
                <div className="mb-4">
                  <img
                    src={formData.mainImageUrl}
                    alt="Preview"
                    className="max-h-48 rounded border"
                  />
                </div>
              )}
              <ImageUpload
                currentImageUrl={formData.mainImageUrl}
                onImageUploaded={handleMainImageUploaded}
                onImageDeleted={handleImageDeleted}
                folder="products"
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Papildus attēli
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Papildus ${index+1}`} className="w-full h-32 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => handleAdditionalImageDeleted(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Dzēst
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                onImageUploaded={handleAdditionalImageUploaded}
                folder="products"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Izmēri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platums (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Augstums (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block texts-sm font-medium text-gray-700 mb-2">
                  Dziļums (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.depth}
                  onChange={(e) => setFormData(prev => ({ ...prev, depth: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Svars (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Iestatījumi</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
                  Redzams mājas lapā
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Aktīvs (var pasūtīt)
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atcelt
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saglabā...' : 'Saglabāt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}