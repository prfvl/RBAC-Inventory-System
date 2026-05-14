import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import RoleGate from '../guards/RoleGate';

const fetchInventory = async () => {
  const { data } = await api.get('/inventory');
  return data;
};

const Inventory = () => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory });
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, price: 0 });

  const handleUpdateStock = async (id) => {
    try {
      await api.put(`/inventory/${id}`, { quantity: newStock });
      setEditingStock(null);
      refetch();
    } catch (e) {
      console.error(e);
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
      console.error(e);
      alert('Failed to create item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      refetch();
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
      alert('Failed to export');
    }
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div>
      <div className="header">
        <h2>Inventory</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <RoleGate allowedRoles={['Manager', 'Admin']}>
            <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary">
              {isCreating ? 'Cancel' : 'Create Product'}
            </button>
          </RoleGate>
          <RoleGate allowedRoles={['Manager', 'Admin']}>
            <button onClick={handleExport} className="btn btn-primary">Export CSV</button>
          </RoleGate>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateItem} style={{ marginBottom: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Name</label>
            <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>SKU</label>
            <input type="text" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} required style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Quantity</label>
            <input type="number" min="0" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} required style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Price</label>
            <input type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} required style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <button type="submit" className="btn btn-primary">Save Product</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
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
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td>
                {editingStock === item._id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={newStock} 
                      onChange={(e) => setNewStock(Number(e.target.value))} 
                      style={{ width: '60px' }}
                    />
                    <button onClick={() => handleUpdateStock(item._id)} className="btn btn-primary">Save</button>
                    <button onClick={() => setEditingStock(null)} className="btn">Cancel</button>
                  </div>
                ) : (
                  <span>{item.quantity}</span>
                )}
              </td>
              <td>${item.price}</td>
              <td>
                {item.quantity === 0 ? (
                  <span style={{ color: 'var(--danger)' }}>Out of Stock</span>
                ) : item.quantity <= item.minThreshold ? (
                  <span style={{ color: 'var(--warning)' }}>Low Stock</span>
                ) : (
                  <span style={{ color: 'var(--success)' }}>In Stock</span>
                )}
              </td>
              <td>
                <RoleGate allowedRoles={['Manager', 'Admin']}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingStock !== item._id && (
                      <button 
                        onClick={() => {
                          setEditingStock(item._id);
                          setNewStock(item.quantity);
                        }} 
                        className="btn"
                      >
                        Update Stock
                      </button>
                    )}
                    <RoleGate allowedRoles={['Manager', 'Admin']}>
                      <button onClick={() => handleDeleteItem(item._id)} className="btn btn-danger">
                        Delete
                      </button>
                    </RoleGate>
                  </div>
                </RoleGate>
              </td>
            </tr>
          ))}
          {(!data?.items || data.items.length === 0) && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
