import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { patientsAPI } from '../lib/api'
import { Plus, Edit, Trash2, Phone, Mail } from 'lucide-react'

const PatientsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery('patients', () =>
    patientsAPI.getAll().then(res => res.data)
  );

  const createMutation = useMutation(patientsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('patients');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => patientsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients');
        setEditingPatient(null);
        setShowForm(false);
      },
    }
  );

  const deleteMutation = useMutation(patientsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('patients');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      dateOfBirth: formData.get('dateOfBirth'),
      status: formData.get('status') || 'active',
    };

    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading patients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="medical-header">Patients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                defaultValue={editingPatient?.name || ''}
                className="input-field"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={editingPatient?.email || ''}
                className="input-field"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                defaultValue={editingPatient?.phone || ''}
                className="input-field"
              />
              <input
                name="address"
                type="text"
                placeholder="Address"
                defaultValue={editingPatient?.address || ''}
                className="input-field"
              />
              <input
                name="dateOfBirth"
                type="date"
                placeholder="Date of Birth"
                defaultValue={editingPatient?.date_of_birth || ''}
                className="input-field"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingPatient ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPatient(null);
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

      {/* Patients List */}
      <div className="grid gap-4">
        {patients.map((patient: any) => (
          <div key={patient.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {patient.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{patient.address}</p>
                <div className="mt-2">
                  <span className="status-active">{patient.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPatient(patient);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this patient?')) {
                      deleteMutation.mutate(patient.id);
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

export default PatientsPage;