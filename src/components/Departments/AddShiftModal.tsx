import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departmentId: string;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose, onSuccess, departmentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    
    // Handle overnight shifts
    if (start >= end) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const duration = calculateDuration(formData.startTime, formData.endTime);
        
        const response = await fetch(`${API_BASE_URL}/api/shifts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            department_id: parseInt(departmentId),
            start_time: `${formData.startTime}:00`,
            end_time: `${formData.endTime}:00`,
            duration: duration,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmitMessage({ 
            type: 'success', 
            text: data.message || 'Shift created successfully!' 
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
            text: data.error || 'Failed to create shift' 
          });
        }
      } catch (error) {
        console.error('Error creating shift:', error);
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
    setFormData({ name: '', startTime: '', endTime: '' });
    setErrors({});
    setSubmitMessage(null);
    setIsSubmitting(false);
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  ({calculateDuration(formData.startTime, formData.endTime).toFixed(1)}h)
                </span>
              </div>
            </div>
          )}

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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Shift'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShiftModal;