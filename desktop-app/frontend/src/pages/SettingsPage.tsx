import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { settingsAPI } from '../lib/api'
import { Building2, Save } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery('settings', () =>
    settingsAPI.get().then(res => res.data)
  );

  const updateMutation = useMutation(settingsAPI.update, {
    onSuccess: () => {
      queryClient.invalidateQueries('settings');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      currency: formData.get('currency'),
      taxRate: formData.get('taxRate'),
    };

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="medical-header">Hospital Settings</h1>
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-center mb-6">
          <Building2 className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold">Hospital Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={settings?.name || ''}
              className="input-field"
              placeholder="Enter hospital name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              defaultValue={settings?.address || ''}
              className="input-field"
              rows={3}
              placeholder="Enter hospital address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={settings?.phone || ''}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                defaultValue={settings?.email || ''}
                className="input-field"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                defaultValue={settings?.currency || 'USD'}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                name="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={settings?.tax_rate || ''}
                className="input-field"
                placeholder="Enter tax rate"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {updateMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              Settings saved successfully!
            </div>
          )}

          {updateMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              Failed to save settings. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;