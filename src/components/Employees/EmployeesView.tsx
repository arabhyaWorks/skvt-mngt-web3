import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeesView: React.FC = () => {
  const { user } = useAuth();
  const { employees, dutyPoints, shifts, departments } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dutyPointFilter, setDutyPointFilter] = useState<string>('all');

  // Get filtered data based on user role and filters
  const getFilteredData = () => {
    let filteredEmployees = employees;
    let availableDepartments = departments;
    let availableDutyPoints = dutyPoints;

    // Apply role-based filtering first
    if (user?.role === 'department_admin' && user.departmentId) {
      filteredEmployees = filteredEmployees.filter(e => e.departmentId === user.departmentId);
      availableDepartments = availableDepartments.filter(d => d.id === user.departmentId);
      availableDutyPoints = availableDutyPoints.filter(p => p.departmentId === user.departmentId);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.departmentId === departmentFilter);
      availableDutyPoints = availableDutyPoints.filter(p => p.departmentId === departmentFilter);
    }

    // Apply duty point filter
    if (dutyPointFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.dutyPointId === dutyPointFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(employee =>
        statusFilter === 'active' ? employee.isActive : !employee.isActive
      );
    }

    return { filteredEmployees, availableDepartments, availableDutyPoints };
  };

  const { filteredEmployees, availableDepartments, availableDutyPoints } = getFilteredData();

  const getDutyPoint = (dutyPointId?: string) => {
    if (!dutyPointId) return null;
    return dutyPoints.find(point => point.id === dutyPointId);
  };

  const getShift = (shiftId?: string) => {
    if (!shiftId) return null;
    return shifts.find(shift => shift.id === shiftId);
  };

  const getDepartment = (departmentId: string) => {
    return departments.find(dept => dept.id === departmentId);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Reset dependent filters when parent filter changes
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setDutyPointFilter('all'); // Reset duty point filter when department changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees Management</h1>
          <p className="text-gray-600 mt-1">
            Manage department staff and their assignments
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          {user?.role !== 'department_admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">All Departments</option>
                  {availableDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Duty Point Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duty Point</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={dutyPointFilter}
                onChange={(e) => setDutyPointFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Duty Points</option>
                {availableDutyPoints.map(point => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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

        {/* Filter Summary */}
        {(searchTerm || departmentFilter !== 'all' || dutyPointFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {departmentFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Dept: {departments.find(d => d.id === departmentFilter)?.name.split(',')[0]}
                <button
                  onClick={() => handleDepartmentFilterChange('all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {dutyPointFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Point: {dutyPoints.find(p => p.id === dutyPointFilter)?.name}
                <button
                  onClick={() => setDutyPointFilter('all')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setDutyPointFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                {user?.role !== 'department_admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const dutyPoint = getDutyPoint(employee.dutyPointId);
                const shift = getShift(employee.shiftId);
                const department = getDepartment(employee.departmentId);
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    {/* Employee Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.designation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department Info (only for super admin) */}
                    {user?.role !== 'department_admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {department && (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {department.name.split(',')[0]}
                              </div>
                              <div className="text-xs text-gray-500">
                                {department.name.split(',').slice(1).join(',').trim()}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Contact Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <a 
                          href={`tel:${employee.phone}`}
                          className="flex items-center text-sm text-orange-600 hover:text-orange-800 font-medium"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {employee.phone}
                        </a>
                        {employee.email && (
                          <a 
                            href={`mailto:${employee.email}`}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {employee.email}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Assignment */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dutyPoint ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <MapPin className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{dutyPoint.name}</div>
                            <div className="text-xs text-gray-500">{dutyPoint.description}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span>No assignment</span>
                        </div>
                      )}
                    </td>

                    {/* Shift */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shift ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">{shift.name}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No shift assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || departmentFilter !== 'all' || dutyPointFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first employee'
              }
            </p>
            {!searchTerm && departmentFilter === 'all' && dutyPointFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Employee
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default EmployeesView;