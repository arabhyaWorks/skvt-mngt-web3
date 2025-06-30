import React, { useState, useEffect } from 'react';
import { X, CheckSquare, MapPin, Clock, Users, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';

interface AssignDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DutyPoint {
  duty_point_id: number;
  name: string;
  description: string;
}

interface Shift {
  shift_id: number;
  name: string;
  start_time: string;
  end_time: string;
  duration: number;
}

interface Employee {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department_id: number;
  status: 'on_duty' | 'off_duty' | 'not_assigned';
  shift_id: string;
  duty_point_id: string;
}

const AssignDutyModal: React.FC<AssignDutyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [dutyPoints, setDutyPoints] = useState<DutyPoint[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    dutyPointId: '',
    shiftId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch department data (duty points and shifts)
  const fetchDepartmentData = async () => {
    if (!user?.departmentId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/departments/${user.departmentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDutyPoints(data.duty_points || []);
        setShifts(data.shifts || []);
      } else {
        setError('Failed to fetch department data');
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees for the department (with pagination)
  const fetchEmployees = async () => {
    if (!user?.departmentId) return;

    try {
      setEmployeesLoading(true);
      let allEmployees: Employee[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const limit = 50; // Fetch 50 employees per page

      // Fetch all pages of employees
      do {
        const response = await fetch(`${API_BASE_URL}/api/users?role=Employee&department_id=${user.departmentId}&status=not_assigned&page=${currentPage}&limit=${limit}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          allEmployees = [...allEmployees, ...(data.data || [])];
          totalPages = data.pagination?.totalPages || 1;
          currentPage++;
        } else {
          setError('Failed to fetch employees');
          break;
        }
      } while (currentPage <= totalPages);

      setEmployees(allEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Network error occurred');
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && user?.departmentId) {
      fetchDepartmentData();
      fetchEmployees();
    }
  }, [isOpen, user?.departmentId]);

  // Get available (inactive) employees
  const availableEmployees = employees.filter(emp => emp.status === 'not_assigned');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dutyPointId) {
      newErrors.dutyPointId = 'Please select a duty point';
    }

    if (!formData.shiftId) {
      newErrors.shiftId = 'Please select a shift';
    }

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select start date';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select end date';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }

      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
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
        const response = await fetch(`${API_BASE_URL}/api/shift_assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duty_point_id: parseInt(formData.dutyPointId),
            shift_id: parseInt(formData.shiftId),
            employee_id: parseInt(formData.employeeId),
            department_id: parseInt(user?.departmentId || '0'),
            start_date: formData.startDate,
            end_date: formData.endDate,
          }),
        });

        if (response.ok) {
          setSubmitMessage({ 
            type: 'success', 
            text: 'Duty assignment created successfully!' 
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
          const errorData = await response.json();
          setSubmitMessage({ 
            type: 'error', 
            text: errorData.error || 'Failed to create assignment' 
          });
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
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
    setFormData({ dutyPointId: '', shiftId: '', employeeId: '', startDate: '', endDate: '' });
    setErrors({});
    setSubmitMessage(null);
    setIsSubmitting(false);
    setError(null);
    onClose();
  };

  const selectedDutyPoint = dutyPoints.find(p => p.duty_point_id.toString() === formData.dutyPointId);
  const selectedShift = shifts.find(s => s.shift_id.toString() === formData.shiftId);
  const selectedEmployee = employees.find(e => e.user_id.toString() === formData.employeeId);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (hour === 24) hour = 0;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Duty</h2>
              <p className="text-sm text-gray-500">Assign employees to duty points and shifts</p>
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

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading department data...</p>
          </div>
        )}

        {/* Employees Loading State */}
        {employeesLoading && !loading && (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading employees...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && !error && !employeesLoading && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Step 1: Duty Point Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 1: Select Duty Point *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.dutyPointId}
                  onChange={(e) => setFormData(prev => ({ ...prev, dutyPointId: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.dutyPointId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Choose a duty point</option>
                  {dutyPoints.map((point) => (
                    <option key={point.duty_point_id} value={point.duty_point_id.toString()}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.dutyPointId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.dutyPointId}
                </p>
              )}
            </div>

            {/* Step 2: Shift Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 2: Select Shift *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData(prev => ({ ...prev, shiftId: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.shiftId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || !formData.dutyPointId}
                >
                  <option value="">Choose a shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.shift_id} value={shift.shift_id.toString()}>
                      {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                    </option>
                  ))}
                </select>
              </div>
              {errors.shiftId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.shiftId}
                </p>
              )}
            </div>

            {/* Step 3: Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 3: Select Available Employee * ({availableEmployees.length} available)
              </label>
              {availableEmployees.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      No available employees found. All {employees.length} employees are either on duty or off duty.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.employeeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || !formData.shiftId}
                  >
                    <option value="">Choose an employee</option>
                    {availableEmployees.map((employee) => (
                      <option key={employee.user_id} value={employee.user_id.toString()}>
                        {employee.name} - {employee.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.employeeId}
                </p>
              )}
            </div>

            {/* Step 4: Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || !formData.employeeId}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || !formData.startDate}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Summary */}
            {selectedDutyPoint && selectedShift && selectedEmployee && formData.startDate && formData.endDate && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-medium text-orange-900 mb-3">Assignment Summary</h4>
                <div className="space-y-2 text-sm text-orange-800">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span><strong>Employee:</strong> {selectedEmployee.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span><strong>Duty Point:</strong> {selectedDutyPoint.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span><strong>Shift:</strong> {selectedShift.name} ({formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)})</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span><strong>Duration:</strong> {formatDate(formData.startDate)} to {formatDate(formData.endDate)}</span>
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
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || availableEmployees.length === 0}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="h-4 w-4" />
                <span>{isSubmitting ? 'Assigning...' : 'Create Assignment'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignDutyModal;