import React, { useState } from 'react';
import { X, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface AddDutyPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departmentId: string;
}

const AddDutyPointModal: React.FC<AddDutyPointModalProps> = ({ isOpen, onClose, onSuccess, departmentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coordinate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Duty point name is required';
    }

    if (!formData.coordinate.trim()) {
      newErrors.coordinate = 'GPS coordinates are required';
    } else {
      // Basic coordinate validation - should be in format like "12.34,56.78"
      const coordinatePattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
      if (!coordinatePattern.test(formData.coordinate.replace(/\s/g, ''))) {
        newErrors.coordinate = 'Please enter valid coordinates in format: latitude,longitude (e.g., 12.34,56.78)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/duty_points`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            coordinate: formData.coordinate.replace(/\s/g, ''), // Remove any spaces
            department_id: parseInt(departmentId),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmitMessage({ 
            type: 'success', 
            text: data.message || 'Duty point created successfully!' 
          });
          
          // Call success callback to refresh the list
          if (onSuccess) {
            onSuccess();
          }
          
          // Close modal after a short delay
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setSubmitMessage({ 
            type: 'error', 
            text: data.error || 'Failed to create duty point' 
          });
        }
      } catch (error) {
        console.error('Error creating duty point:', error);
        setSubmitMessage({ 
          type: 'error', 
          text: 'Network error occurred. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', coordinate: '' });
    setErrors({});
    setSubmitMessage(null);
    setIsSubmitting(false);
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                value={formData.coordinate}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinate: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.coordinate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="12.34,56.78"
                disabled={isSubmitting}
              />
            </div>
            {errors.coordinate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.coordinate}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter GPS coordinates in format: latitude,longitude (e.g., 12.34,56.78)
            </p>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`p-4 rounded-lg ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {submitMessage.type === 'success' ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                ) : (
                  <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                )}
                {submitMessage.text}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Duty Point'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDutyPointModal;