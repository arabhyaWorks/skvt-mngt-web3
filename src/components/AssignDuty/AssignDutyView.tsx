import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AssignDutyModal from './AssignDutyModal';

import { API_BASE_URL } from '../../config/api';

const AssignDutyView: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [dutyPoints, setDutyPoints] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch department data and employees
  const fetchData = async () => {
    if (!user?.departmentId) {
      setError('Department ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch department details (duty points and shifts)
      const deptResponse = await fetch(`${API_BASE_URL}/api/departments/${user.departmentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDutyPoints(deptData.duty_points || []);
        setShifts(deptData.shifts || []);
      }

      // Fetch employees
      const empResponse = await fetch(`${API_BASE_URL}/api/users?role=Employee&department_id=${user.departmentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (empResponse.ok) {
        const empData = await empResponse.json();
        setEmployees(empData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user?.departmentId) {
      fetchData();
    }
  }, [user?.departmentId]);

  // Get active duties (employees with assignments)
  const activeDuties = employees.filter(emp => 
    emp.active && emp.duty_point_id && emp.shift_id
  );

  // Filter active duties based on search
  const filteredActiveDuties = activeDuties.filter(duty => {
    const dutyPoint = dutyPoints.find(p => p.duty_point_id.toString() === duty.duty_point_id);
    const shift = shifts.find(s => s.shift_id.toString() === duty.shift_id);
    
    return duty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dutyPoint?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           shift?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDutyPoint = (dutyPointId?: string | number) => {
    if (!dutyPointId) return null;
    return dutyPoints.find(point => point.duty_point_id.toString() === dutyPointId.toString());
  };

  const getShift = (shiftId?: string | number) => {
    if (!shiftId) return null;
    return shifts.find(shift => shift.shift_id.toString() === shiftId.toString());
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (hour === 24) hour = 0;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAssignmentSuccess = () => {
    // Refresh the data after successful assignment
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment data...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-blue-600">{employees.filter(e => !e.active).length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duty Points</p>
              <p className="text-2xl font-bold text-orange-600">{dutyPoints.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shifts</p>
              <p className="text-2xl font-bold text-purple-600">{shifts.length}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

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
              const dutyPoint = getDutyPoint(duty.duty_point_id);
              const shift = getShift(duty.shift_id);
              
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
                        <p className="text-sm text-gray-600 mb-2">ID: {duty.user_id}</p>
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
                          <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📞</span>
                        <span>{duty.phone}</span>
                      </div>
                      
                      {duty.from_date && duty.to_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(duty.from_date).toLocaleDateString()} - {new Date(duty.to_date).toLocaleDateString()}</span>
                        </div>
                      )}
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
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default AssignDutyView;