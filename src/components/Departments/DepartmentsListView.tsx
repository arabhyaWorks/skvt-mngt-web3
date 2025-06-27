import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  Users,
  Clock,
  MapPin,
  Edit,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddDepartmentModal from './AddDepartmentModal';

const DepartmentsListView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { departments, addDepartment } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold' | 'inactive'>('all');

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    
    // Filter by user role
    if (user?.role === 'department_admin' && user.departmentId) {
      return dept.id === user.departmentId && matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleAddDepartment = (departmentData: any, adminData: any) => {
    return addDepartment(departmentData, adminData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'on_hold':
        return 'On Hold';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  
  const handleDepartmentClick = (departmentId, navigate) => {
    navigate(`/departments/${departmentId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'department_admin' ? 'My Department' : 'Departments Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'department_admin' 
              ? 'Manage your department operations and staff' 
              : 'Manage all temple departments and their operations'
            }
          </p>
        </div>
        
        {user?.role === 'super_admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        )}
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
                placeholder="Search departments..."
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
                <option value="on_hold">On Hold</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={() => handleDepartmentClick(department.id, navigate)}
          >
            {/* Department Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {department.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(department.status)}`}>
                    {getStatusText(department.status)}
                  </span>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {department.description}
              </p>
            </div>

            {/* Department Stats */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-600">{department.activePoints}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-600">{department.totalShifts}</p>
                  <p className="text-xs text-gray-500">Shifts</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-600">{department.totalEmployees}</p>
                  <p className="text-xs text-gray-500">Staff</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/departments/${department.id}`);
                  }}
                  className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
                
                {(user?.role === 'super_admin' || 
                  (user?.role === 'department_admin' && user.departmentId === department.id)) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first department'
            }
          </p>
          {user?.role === 'super_admin' && !searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Department
            </button>
          )}
        </div>
      )}

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDepartment}
      />
    </div>
  );
};


export default DepartmentsListView;