import React, { useState } from 'react';
import { X, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AddDutyPointModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDutyPointModal: React.FC<AddDutyPointModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Duty point name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'GPS coordinates are required';
    } else if (!/^-?\d+\.?\d*°?\s*[NS],?\s*-?\d+\.?\d*°?\s*[EW]$/.test(formData.location.replace(/\s/g, ' '))) {
      // Basic GPS coordinate validation
      if (!formData.location.includes('°') || (!formData.location.includes('N') && !formData.location.includes('S'))) {
        newErrors.location = 'Please enter valid GPS coordinates (e.g., 28.5355° N, 83.0076° E)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically call an API to create the duty point
      console.log('Creating duty point:', {
        ...formData,
        departmentId: user?.departmentId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', location: '', isActive: true });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Duty Point</h2>
              <p className="text-sm text-gray-500">Create a new security checkpoint</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Duty Point Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duty Point Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter duty point name (e.g., YSK1, Gate No. 4)"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter description of the duty point and its responsibilities"
            />
          </div>

          {/* GPS Coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Coordinates *
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="28.5355° N, 83.0076° E"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.location}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter GPS coordinates in format: Latitude° N/S, Longitude° E/W
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={formData.isActive}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.isActive}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Create Duty Point</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDutyPointModal;