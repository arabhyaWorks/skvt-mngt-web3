import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Shift name is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Creating shift:', {
        ...formData,
        departmentId: user?.departmentId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', startTime: '', endTime: '', isActive: true });
    setErrors({});
    onClose();
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Shift</h2>
              <p className="text-sm text-gray-500">Create a new duty shift schedule</p>
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
          {/* Shift Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter shift name (e.g., Morning, Evening, Night)"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.startTime}
                </p>
              )}
              {formData.startTime && (
                <p className="mt-1 text-xs text-gray-500">
                  Display: {formatTimeForDisplay(formData.startTime)}
                </p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.endTime}
                </p>
              )}
              {formData.endTime && (
                <p className="mt-1 text-xs text-gray-500">
                  Display: {formatTimeForDisplay(formData.endTime)}
                </p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {formData.startTime && formData.endTime && !errors.endTime && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-900 font-medium">
                  {formatTimeForDisplay(formData.startTime)} - {formatTimeForDisplay(formData.endTime)}
                </span>
              </div>
            </div>
          )}

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
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.isActive}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Create Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShiftModal;