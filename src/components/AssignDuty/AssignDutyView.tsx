import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Users,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AssignDutyModal from './AssignDutyModal';

const AssignDutyView: React.FC = () => {
  const { user } = useAuth();
  const { employees, dutyPoints, shifts } = useData();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Get active duties (employees with assignments)
  const activeDuties = deptEmployees.filter(emp => emp.dutyPointId && emp.shiftId && emp.isActive);

  // Filter active duties based on search
  const filteredActiveDuties = activeDuties.filter(duty => {
    const dutyPoint = deptDutyPoints.find(p => p.id === duty.dutyPointId);
    const shift = deptShifts.find(s => s.id === duty.shiftId);
    
    return duty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dutyPoint?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           shift?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDutyPoint = (dutyPointId?: string) => {
    if (!dutyPointId) return null;
    return deptDutyPoints.find(point => point.id === dutyPointId);
  };

  const getShift = (shiftId?: string) => {
    if (!shiftId) return null;
    return deptShifts.find(shift => shift.id === shiftId);
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
          <h1 className="text-2xl font-bold text-gray-900">Assign Duty</h1>
          <p className="text-gray-600 mt-1">
            Manage duty assignments and active deployments
          </p>
        </div>
        
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Duty
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Duties</p>
              <p className="text-2xl font-bold text-green-600">{activeDuties.length}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Staff</p>
              <p className="text-2xl font-bold text-blue-600">
                {deptEmployees.filter(e => !e.dutyPointId && e.isActive).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duty Points</p>
              <p className="text-2xl font-bold text-orange-600">{deptDutyPoints.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shifts</p>
              <p className="text-2xl font-bold text-purple-600">
                {deptShifts.filter(s => s.isActive).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search active duties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Active Duties List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Duties</h2>
        
        {filteredActiveDuties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No duties found' : 'No active duties'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by assigning duties to your staff'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign First Duty
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveDuties.map((duty) => {
              const dutyPoint = getDutyPoint(duty.dutyPointId);
              const shift = getShift(duty.shiftId);
              
              return (
                <div
                  key={duty.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
                >
                  {/* Duty Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {duty.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{duty.designation}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                          On Duty
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                        <CheckSquare className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Assignment Details</h4>
                      
                      {dutyPoint && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="font-medium text-gray-900">{dutyPoint.name}</span>
                        </div>
                      )}
                      
                      {shift && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{duty.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 mr-1" />
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Duty Modal */}
      <AssignDutyModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
    </div>
  );
};

export default AssignDutyView;