import React, { useState } from 'react';
import { X, CheckSquare, MapPin, Clock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

interface AssignDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssignDutyModal: React.FC<AssignDutyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { employees, dutyPoints, shifts } = useData();
  const [formData, setFormData] = useState({
    dutyPointId: '',
    shiftId: '',
    employeeIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter data based on user role
  const filteredData = () => {
    if (user?.role === 'department_admin' && user.departmentId) {
      return {
        employees: employees.filter(e => e.departmentId === user.departmentId),
        dutyPoints: dutyPoints.filter(p => p.departmentId === user.departmentId),
        shifts: shifts.filter(s => s.departmentId === user.departmentId),
      };
    }
    return { employees, dutyPoints, shifts };
  };

  const { employees: deptEmployees, dutyPoints: deptDutyPoints, shifts: deptShifts } = filteredData();

  // Get available employees (not currently assigned)
  const availableEmployees = deptEmployees.filter(emp => !emp.dutyPointId && emp.isActive);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dutyPointId) {
      newErrors.dutyPointId = 'Please select a duty point';
    }

    if (!formData.shiftId) {
      newErrors.shiftId = 'Please select a shift';
    }

    if (formData.employeeIds.length === 0) {
      newErrors.employeeIds = 'Please select at least one employee';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Assigning duty:', formData);
      // Here you would typically call an API to assign the duty
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ dutyPointId: '', shiftId: '', employeeIds: [] });
    setErrors({});
    onClose();
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter(id => id !== employeeId)
        : [...prev.employeeIds, employeeId]
    }));
  };

  const selectedDutyPoint = deptDutyPoints.find(p => p.id === formData.dutyPointId);
  const selectedShift = deptShifts.find(s => s.id === formData.shiftId);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Duty Point Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Duty Point *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.dutyPointId}
                onChange={(e) => setFormData(prev => ({ ...prev, dutyPointId: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.dutyPointId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a duty point</option>
                {deptDutyPoints.filter(p => p.isActive).map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name} - {point.location}
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

          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Shift *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftId: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.shiftId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a shift</option>
                {deptShifts.filter(s => s.isActive).map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
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

          {/* Assignment Summary */}
          {selectedDutyPoint && selectedShift && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="text-sm font-medium text-orange-900 mb-2">Assignment Summary</h4>
              <div className="space-y-1 text-sm text-orange-800">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{selectedDutyPoint.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{selectedShift.name} ({formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)})</span>
                </div>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employees *
            </label>
            {availableEmployees.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">No available employees found. All employees are currently assigned.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {availableEmployees.map((employee) => (
                  <label key={employee.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.employeeIds.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{employee.name}</span>
                        <span className="text-sm text-gray-500">{employee.designation}</span>
                      </div>
                      <div className="text-sm text-gray-600">{employee.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.employeeIds && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.employeeIds}
              </p>
            )}
            {formData.employeeIds.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                {formData.employeeIds.length} employee(s) selected
              </p>
            )}
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
              disabled={availableEmployees.length === 0}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Assign Duty</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDutyModal;