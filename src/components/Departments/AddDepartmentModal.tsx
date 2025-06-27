import React, { useState } from 'react';
import { X, Building2, User, Phone, Mail, Lock, AlertCircle } from 'lucide-react';
import { useData } from '../../hooks/useData';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (departmentData: any, adminData?: any) => Promise<{ success: boolean; message: string }>;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { departmentAdmins } = useData();
  const [departmentData, setDepartmentData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'on_hold' | 'inactive',
    admin_id: '',
  });

  const [adminData, setAdminData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const [creationMode, setCreationMode] = useState<'existing' | 'new'>('existing');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Department validation
    if (!departmentData.name.trim()) {
      newErrors.departmentName = 'Department name is required';
    }

    if (creationMode === 'existing') {
      // Existing admin validation
      if (!departmentData.admin_id) {
        newErrors.adminId = 'Please select an admin';
      }
    } else {
      // New admin validation
      if (!adminData.name.trim()) {
        newErrors.adminName = 'Admin name is required';
      }
      if (!adminData.phone.trim()) {
        newErrors.adminPhone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]+$/.test(adminData.phone)) {
        newErrors.adminPhone = 'Invalid phone number format';
      }
      if (!adminData.email.trim()) {
        newErrors.adminEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
        newErrors.adminEmail = 'Invalid email format';
      }
      if (!adminData.password.trim()) {
        newErrors.adminPassword = 'Password is required';
      } else if (adminData.password.length < 6) {
        newErrors.adminPassword = 'Password must be at least 6 characters';
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
        const result = creationMode === 'existing' 
          ? await onSubmit(departmentData)
          : await onSubmit(departmentData, adminData);
        
        if (result.success) {
          setSubmitMessage({ type: 'success', text: result.message });
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setSubmitMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setSubmitMessage({ type: 'error', text: 'An unexpected error occurred' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setDepartmentData({ name: '', description: '', status: 'active', admin_id: '' });
    setAdminData({ name: '', phone: '', email: '', password: '' });
    setCreationMode('existing');
    setErrors({});
    setSubmitMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Department</h2>
              <p className="text-sm text-gray-500">Create a new department and assign an admin</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Department Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Department Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={departmentData.name}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.departmentName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter department name (e.g., पुलिस आयुक्त, कमिश्नरेट, वाराणसी)"
                />
                {errors.departmentName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.departmentName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={departmentData.status}
                  onChange={(e) => setDepartmentData(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'active' | 'on_hold' | 'inactive' 
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={departmentData.description}
                  onChange={(e) => setDepartmentData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter department description and responsibilities"
                />
              </div>
            </div>
          </div>

          {/* Admin Selection Mode */}
          <div className="space-y-6 border-t pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Department Admin</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Admin Assignment Method *
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="creationMode"
                    checked={creationMode === 'existing'}
                    onChange={() => setCreationMode('existing')}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Select Existing Admin</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="creationMode"
                    checked={creationMode === 'new'}
                    onChange={() => setCreationMode('new')}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Create New Admin</span>
                </label>
              </div>
            </div>
          </div>

          {/* Existing Admin Selection */}
          {creationMode === 'existing' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Admin *
              </label>
              <select
                value={departmentData.admin_id}
                onChange={(e) => setDepartmentData(prev => ({ ...prev, admin_id: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.adminId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Choose an existing admin</option>
                {departmentAdmins.filter(admin => !admin.department_id).map((admin) => (
                  <option key={admin.user_id} value={admin.user_id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
              {errors.adminId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.adminId}
                </p>
              )}
              {departmentAdmins.filter(admin => !admin.department_id).length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No available department admins found. Consider creating a new admin.
                </p>
              )}
            </div>
          )}

          {/* New Admin Information */}
          {creationMode === 'new' && (
          <div className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.adminName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter admin full name"
                />
                {errors.adminName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={adminData.phone}
                    onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.adminPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+91-9876543210"
                  />
                </div>
                {errors.adminPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.adminEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.adminEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter secure password"
                  />
                </div>
                {errors.adminPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminPassword}
                  </p>
                )}
              </div>
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
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Department'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;