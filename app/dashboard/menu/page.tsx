'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useMenuCategories,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/lib/hooks';

interface MenuCategory {
  id?: string;
  _id?: string;
  name: string;
  sortOrder?: number;
}

interface MenuItem {
  id?: string;
  _id?: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

const itemKey = (x: MenuCategory | MenuItem) => (x.id || x._id) as string;

const emptyItemForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  isAvailable: true,
};

export default function MenuPage() {
  const { data: categoriesData, isLoading: categoriesLoading } = useMenuCategories();
  const { data: itemsData, isLoading: itemsLoading } = useMenuItems();
  const createCategory = useCreateMenuCategory();
  const updateCategory = useUpdateMenuCategory();
  const deleteCategory = useDeleteMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const categories: MenuCategory[] = categoriesData || [];
  const items: MenuItem[] = itemsData || [];

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [itemFormError, setItemFormError] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await createCategory.mutateAsync({ name: newCategoryName.trim() });
    setNewCategoryName('');
  };

  const startEditCategory = (category: MenuCategory) => {
    setEditingCategoryId(itemKey(category));
    setEditingCategoryName(category.name);
  };

  const saveEditCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) return;
    await updateCategory.mutateAsync({ categoryId, data: { name: editingCategoryName.trim() } });
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const hasItems = items.some((i) => i.categoryId === categoryId);
    if (hasItems && !confirm('This category still has menu items in it. Delete it anyway?')) return;
    if (!hasItems && !confirm('Delete this category?')) return;
    await deleteCategory.mutateAsync(categoryId);
  };

  const openNewItemForm = (categoryId?: string) => {
    setEditingItemId(null);
    setItemFormError('');
    setItemForm({ ...emptyItemForm, categoryId: categoryId || (categories[0] ? itemKey(categories[0]) : '') });
    setShowItemForm(true);
  };

  const openEditItemForm = (item: MenuItem) => {
    setEditingItemId(itemKey(item));
    setItemFormError('');
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: String(item.price ?? ''),
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable !== false,
    });
    setShowItemForm(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError('');
    if (!itemForm.categoryId) {
      setItemFormError('Choose a category first.');
      return;
    }
    if (!itemForm.name.trim()) {
      setItemFormError('Item name is required.');
      return;
    }
    const price = Number(itemForm.price);
    if (Number.isNaN(price) || price < 0) {
      setItemFormError('Enter a valid price.');
      return;
    }
    const payload = {
      categoryId: itemForm.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description.trim() || undefined,
      price,
      imageUrl: itemForm.imageUrl.trim() || undefined,
      isAvailable: itemForm.isAvailable,
    };
    try {
      if (editingItemId) {
        await updateItem.mutateAsync({ itemId: editingItemId, data: payload });
      } else {
        await createItem.mutateAsync(payload);
      }
      setShowItemForm(false);
      setItemForm(emptyItemForm);
      setEditingItemId(null);
    } catch (err: any) {
      setItemFormError(err?.message || 'Could not save this item.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this menu item?')) return;
    await deleteItem.mutateAsync(itemId);
  };

  const toggleAvailability = async (item: MenuItem) => {
    await updateItem.mutateAsync({ itemId: itemKey(item), data: { isAvailable: !item.isAvailable } });
  };

  const categoryName = (categoryId: string) => categories.find((c) => itemKey(c) === categoryId)?.name || 'Uncategorized';

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
              <p className="text-sm text-gray-600">Manage what customers see when they browse your restaurant</p>
            </div>
            <button
              onClick={() => openNewItemForm()}
              disabled={categories.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add Menu Item
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Categories */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Starters, Drinks, Desserts"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={createCategory.isPending}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Add Category
              </button>
            </form>

            {categories.length === 0 && !categoriesLoading ? (
              <p className="text-sm text-gray-500">
                No categories yet — add one above before you can add menu items.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const cId = itemKey(category);
                  return editingCategoryId === cId ? (
                    <div key={cId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                        autoFocus
                      />
                      <button onClick={() => saveEditCategory(cId)} className="text-green-600 text-sm px-1">✓</button>
                      <button onClick={() => setEditingCategoryId(null)} className="text-gray-400 text-sm px-1">✕</button>
                    </div>
                  ) : (
                    <div key={cId} className="flex items-center gap-1 bg-gray-100 rounded-full pl-3 pr-1 py-1">
                      <span className="text-sm text-gray-800">{category.name}</span>
                      <button
                        onClick={() => startEditCategory(category)}
                        className="text-gray-400 hover:text-gray-700 text-xs px-1"
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cId)}
                        className="text-gray-400 hover:text-red-600 text-xs px-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Item form */}
          {showItemForm && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItemId ? 'Edit Menu Item' : 'New Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowItemForm(false);
                    setEditingItemId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      value={itemForm.categoryId}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Choose a category</option>
                      {categories.map((c) => (
                        <option key={itemKey(c)} value={itemKey(c)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₦) *</label>
                    <input
                      type="number"
                      min={0}
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  />
                  Available to order
                </label>

                {itemFormError && <div className="text-red-600 text-sm">{itemFormError}</div>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createItem.isPending || updateItem.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {editingItemId ? 'Save Changes' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      setEditingItemId(null);
                    }}
                    className="text-gray-600 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Items list */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Items</h3>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading menu...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500">No menu items yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={itemKey(item)} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{categoryName(item.categoryId)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{item.price?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleAvailability(item)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.isAvailable !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right text-sm space-x-3">
                          <button onClick={() => openEditItemForm(item)} className="text-green-600 hover:text-green-800">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem(itemKey(item))} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
