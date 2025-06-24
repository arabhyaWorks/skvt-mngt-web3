import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddDutyPointModal from './AddDutyPointModal';

const DutyPointsView: React.FC = () => {
  const { user } = useAuth();
  const { dutyPoints, employees, shifts } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter duty points based on user role
  const filteredDutyPoints = dutyPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? point.isActive : !point.isActive);
    
    if (user?.role === 'department_admin' && user.departmentId) {
      return point.departmentId === user.departmentId && matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getAssignedEmployee = (pointId: string) => {
    return employees.find(emp => emp.dutyPointId === pointId);
  };

  const getAssignedShift = (pointId: string) => {
    return shifts.find(shift => shift.dutyPointId === pointId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Points Management</h1>
          <p className="text-gray-600 mt-1">
            Manage security checkpoints and monitoring locations
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Duty Point
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
                placeholder="Search duty points..."
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

      {/* Duty Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDutyPoints.map((point) => {
          const assignedEmployee = getAssignedEmployee(point.id);
          const assignedShift = getAssignedShift(point.id);
          
          return (
            <div
              key={point.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
            >
              {/* Point Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {point.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                      point.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {point.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                
                {point.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {point.description}
                  </p>
                )}

                {/* GPS Coordinates */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Navigation className="h-4 w-4 mr-2" />
                  <span>{point.location}</span>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Current Assignment</h4>
                  
                  {assignedEmployee ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Employee:</span>
                        <span className="text-sm font-medium text-gray-900">{assignedEmployee.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm text-gray-900">{assignedEmployee.phone}</span>
                      </div>
                      {assignedShift && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Shift:</span>
                          <span className="text-sm text-gray-900">
                            {assignedShift.startTime} - {assignedShift.endTime}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>No employee assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
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
      {filteredDutyPoints.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No duty points found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first duty point'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Duty Point
            </button>
          )}
        </div>
      )}

      {/* Add Duty Point Modal */}
      <AddDutyPointModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default DutyPointsView;