import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { servicesAPI } from '../lib/api'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'

const ServicesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery('services', () =>
    servicesAPI.getAll().then(res => res.data)
  );

  const createMutation = useMutation(servicesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => servicesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        setEditingService(null);
        setShowForm(false);
      },
    }
  );

  const deleteMutation = useMutation(servicesAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      isActive: formData.get('isActive') === 'on',
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="medical-header">Services</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Service Name"
                defaultValue={editingService?.name || ''}
                className="input-field"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                defaultValue={editingService?.description || ''}
                className="input-field"
                rows={3}
              />
              <select
                name="category"
                defaultValue={editingService?.category || ''}
                className="input-field"
                required
              >
                <option value="">Select Category</option>
                <option value="consultation">Consultation</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="treatment">Treatment</option>
                <option value="surgery">Surgery</option>
                <option value="emergency">Emergency</option>
              </select>
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Price"
                defaultValue={editingService?.price || ''}
                className="input-field"
                required
              />
              <label className="flex items-center">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingService?.is_active ?? true}
                  className="mr-2"
                />
                Active Service
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingService ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid gap-4">
        {services.map((service: any) => (
          <div key={service.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    service.category === 'consultation' ? 'bg-blue-100 text-blue-800' :
                    service.category === 'diagnostic' ? 'bg-green-100 text-green-800' :
                    service.category === 'treatment' ? 'bg-purple-100 text-purple-800' :
                    service.category === 'surgery' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {service.category}
                  </span>
                  <span className={service.is_active ? 'status-active' : 'status-pending'}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                <div className="flex items-center mt-2">
                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                  <span className="font-semibold text-green-600">${service.price}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this service?')) {
                      deleteMutation.mutate(service.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;