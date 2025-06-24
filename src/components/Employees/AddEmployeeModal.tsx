import React, { useState } from 'react';
import { X, Users, Phone, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    designation: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Creating employee:', {
        ...formData,
        departmentId: user?.departmentId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '', password: '', designation: '', isActive: true });
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
              <p className="text-sm text-gray-500">Add a new staff member to the department</p>
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
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter employee full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+91-9876543210"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="employee@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation *
            </label>
            <select
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.designation ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select designation</option>
              <option value="Security Officer">Security Officer</option>
              <option value="Senior Security Officer">Senior Security Officer</option>
              <option value="Security Guard">Security Guard</option>
              <option value="Head Constable">Head Constable</option>
              <option value="Constable">Constable</option>
              <option value="Sub Inspector">Sub Inspector</option>
              <option value="Inspector">Inspector</option>
            </select>
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.designation}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter password for system access"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}

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
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.isActive}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                  className="mr-2 text-green-600 focus:ring-green-500"
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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;