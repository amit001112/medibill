import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { invoicesAPI, patientsAPI, servicesAPI } from '../lib/api'
import { Plus, Eye, FileText } from 'lucide-react'

const BillingPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery('invoices', () =>
    invoicesAPI.getAll().then(res => res.data)
  );

  const { data: patients = [] } = useQuery('patients', () =>
    patientsAPI.getAll().then(res => res.data)
  );

  const { data: services = [] } = useQuery('services', () =>
    servicesAPI.getAll().then(res => res.data)
  );

  const createMutation = useMutation(invoicesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
      setShowForm(false);
    },
  });

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) => 
      invoicesAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedServices = services.filter((service: any) => 
      formData.get(`service_${service.id}`) === 'on'
    );

    const items = selectedServices.map((service: any) => ({
      serviceId: service.id,
      serviceName: service.name,
      quantity: 1,
      unitPrice: service.price,
      total: service.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const taxRate = 8.5;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const invoiceData = {
      patientId: formData.get('patientId'),
      invoiceDate: formData.get('invoiceDate'),
      dueDate: formData.get('dueDate'),
      items,
      subtotal: subtotal.toFixed(2),
      taxRate: taxRate.toString(),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };

    createMutation.mutate(invoiceData);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="medical-header">Billing & Invoices</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Create New Invoice</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient</label>
                  <select name="patientId" className="input-field" required>
                    <option value="">Select Patient</option>
                    {patients.map((patient: any) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Date</label>
                  <input
                    name="invoiceDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Services</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {services.map((service: any) => (
                    <label key={service.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        name={`service_${service.id}`}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">${service.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="grid gap-4">
        {invoices.map((invoice: any) => (
          <div key={invoice.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                  <div>
                    <strong>Patient:</strong> {invoice.patient_name}
                  </div>
                  <div>
                    <strong>Total:</strong> ${invoice.total}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Due:</strong> {new Date(invoice.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {invoice.status === 'pending' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'paid' })}
                    className="btn-primary text-sm"
                  >
                    Mark Paid
                  </button>
                )}
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;