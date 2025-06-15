import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Package } from 'lucide-react';
import { AppDispatch } from '../store';
import { createShipment } from '../store/slices/shipmentsSlice';
import { PBRContract } from '../types';

interface CreateShipmentModalProps {
  contracts: PBRContract[];
  onClose: () => void;
}

const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({ contracts, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    contractId: '',
    batteriesShipped: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createShipment({
        contractId: formData.contractId,
        batteriesShipped: parseInt(formData.batteriesShipped),
      }));
      onClose();
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Shipment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contract Selection */}
          <div>
            <label htmlFor="contractId" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Contract
            </label>
            <select
              id="contractId"
              name="contractId"
              value={formData.contractId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a contract</option>
              {/* ✅ Different contract options rendered here */}
              {contracts.map((contract) => (
                <option key={contract._id} value={contract.contractId}>
                  {`${contract.contractId} (${contract.batteriesShipped}/${contract.threshold})`}
                </option>
              ))}
            </select>
          </div>

          {/* Batteries to Ship Input */}
          <div>
            <label htmlFor="batteriesShipped" className="block text-sm font-medium text-gray-700 mb-2">
              Batteries to Ship
            </label>
            <input
              type="number"
              id="batteriesShipped"
              name="batteriesShipped"
              value={formData.batteriesShipped}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter number of batteries"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipmentModal;
