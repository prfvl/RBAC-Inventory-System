import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import RoleGate from '../guards/RoleGate';

const fetchInventory = async (search) => {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const { data } = await api.get(`/inventory${params}`);
  return data;
};

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, price: 0 });
  const [uploadingId, setUploadingId] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => fetchInventory(search),
  });

  // Search triggers on Enter or button click
  const handleSearch = () => setSearch(searchInput);
  const handleSearchKey = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleClear = () => { setSearch(''); setSearchInput(''); };

  const handleUpdateStock = async (id) => {
    try {
      await api.put(`/inventory/${id}`, { quantity: newStock });
      setEditingStock(null);
      refetch();
    } catch (e) {
      alert('Failed to update stock');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', newItem);
      setIsCreating(false);
      setNewItem({ name: '', sku: '', quantity: 0, price: 0 });
      refetch();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      refetch();
    } catch (e) {
      alert('Failed to delete item');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/inventory/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export');
    }
  };

  const handleImageUpload = async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploadingId(id);
    try {
      await api.post(`/inventory/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      refetch();
    } catch (e) {
      alert('Failed to upload image');
    } finally {
      setUploadingId(null);
    }
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div>
      <div className="header">
        <h2>Inventory {data?.total !== undefined && <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 400 }}>({data.total} items)</span>}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <RoleGate allowedRoles={['Manager', 'Admin']}>
            <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary">
              {isCreating ? 'Cancel' : '+ Add Product'}
            </button>
          </RoleGate>
          <RoleGate allowedRoles={['Manager', 'Admin']}>
            <button onClick={handleExport} className="btn btn-primary">Export CSV</button>
          </RoleGate>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name, SKU, or tag..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            width: '320px',
            fontSize: '0.9rem',
          }}
        />
        <button onClick={handleSearch} className="btn btn-primary">Search</button>
        {search && (
          <button onClick={handleClear} className="btn" style={{ background: '#f3f4f6' }}>
            ✕ Clear
          </button>
        )}
        {search && (
          <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
            Results for: <strong>"{search}"</strong>
          </span>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateItem}
          style={{
            marginBottom: '2rem', padding: '1rem', background: 'white',
            borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-end',
            boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
          }}
        >
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'SKU', key: 'sku', type: 'text' },
            { label: 'Quantity', key: 'quantity', type: 'number' },
            { label: 'Price ($)', key: 'price', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#374151' }}>{label}</label>
              <input
                type={type}
                value={newItem[key]}
                onChange={(e) => setNewItem({ ...newItem, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                required
                min={type === 'number' ? 0 : undefined}
                step={key === 'price' ? '0.01' : undefined}
                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', width: key === 'name' ? '180px' : '100px' }}
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Image</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map(item => (
            <tr key={item._id}>
              {/* Image cell */}
              <td>
                <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  {item.imageUrl ? (
                    <img
                      src={`http://localhost:5000${item.imageUrl}`}
                      alt={item.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    />
                  ) : (
                    <div style={{
                      width: '48px', height: '48px', background: '#f3f4f6',
                      borderRadius: '6px', border: '1px dashed #d1d5db',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', color: '#9ca3af',
                    }}>📦</div>
                  )}
                  <RoleGate allowedRoles={['Manager', 'Admin']}>
                    <label style={{
                      position: 'absolute', bottom: '-4px', right: '-4px',
                      background: '#3b82f6', color: 'white', borderRadius: '50%',
                      width: '18px', height: '18px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '10px',
                    }}>
                      {uploadingId === item._id ? '…' : '↑'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files[0] && handleImageUpload(item._id, e.target.files[0])}
                      />
                    </label>
                  </RoleGate>
                </div>
              </td>

              <td style={{ fontWeight: 500 }}>{item.name}</td>
              <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.sku}</td>

              {/* Stock editing */}
              <td>
                {editingStock === item._id ? (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <button onClick={() => handleUpdateStock(item._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>✓</button>
                    <button onClick={() => setEditingStock(null)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>✕</button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                )}
              </td>

              <td>${item.price.toFixed(2)}</td>

              <td>
                {item.quantity === 0 ? (
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Out of Stock</span>
                ) : item.quantity <= item.minThreshold ? (
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Low Stock</span>
                ) : (
                  <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>In Stock</span>
                )}
              </td>

              <td>
                <RoleGate allowedRoles={['Manager', 'Admin']}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingStock !== item._id && (
                      <button
                        onClick={() => { setEditingStock(item._id); setNewStock(item.quantity); }}
                        className="btn"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      >
                        Update Stock
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </RoleGate>
              </td>
            </tr>
          ))}
          {(!data?.items || data.items.length === 0) && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                {search ? `No items found for "${search}"` : 'No items yet. Add your first product.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
