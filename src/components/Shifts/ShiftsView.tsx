import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Users,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddShiftModal from './AddShiftModal';

const ShiftsView: React.FC = () => {
  const { user } = useAuth();
  const { shifts, employees, dutyPoints } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter shifts based on user role
  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? shift.isActive : !shift.isActive);
    
    if (user?.role === 'department_admin' && user.departmentId) {
      return shift.departmentId === user.departmentId && matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getDutyPoint = (dutyPointId: string) => {
    return dutyPoints.find(point => point.id === dutyPointId);
  };

  const getInCharge = (inChargeId: string) => {
    return employees.find(emp => emp.id === inChargeId);
  };

  const getShiftEmployees = (employeeIds: string[]) => {
    return employees.filter(emp => employeeIds.includes(emp.id));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts Management</h1>
          <p className="text-gray-600 mt-1">
            Manage duty shifts and schedules
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShifts.map((shift) => {
          const dutyPoint = getDutyPoint(shift.dutyPointId);
          const inCharge = getInCharge(shift.inChargeId);
          const shiftEmployees = getShiftEmployees(shift.employeeIds);
          
          return (
            <div
              key={shift.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
            >
              {/* Shift Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {shift.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                      shift.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {shift.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                {/* Timing */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-lg font-semibold text-blue-900">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </span>
                  </div>
                </div>

                {/* Duty Point */}
                {dutyPoint && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{dutyPoint.name}</span>
                  </div>
                )}
              </div>

              {/* Staff Information */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Staff Assignment</h4>
                  
                  {/* In-charge */}
                  {inCharge && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">In-charge</span>
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{inCharge.name}</p>
                        <p className="text-sm text-gray-600">{inCharge.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Team Members */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Team Members:</span>
                      <span className="text-sm font-medium text-gray-900">{shiftEmployees.length} employees</span>
                    </div>
                    
                    {shiftEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {shiftEmployees.map((emp) => (
                          <span key={emp.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {emp.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>No employees assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredShifts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first shift'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Shift
            </button>
          )}
        </div>
      )}

      {/* Add Shift Modal */}
      <AddShiftModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default ShiftsView;