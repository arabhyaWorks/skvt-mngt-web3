import React, { useState, useEffect } from 'react';
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
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import AddEmployeeModal from './AddEmployeeModal';

interface Employee {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department_id: number | null;
  department_name: string;
  shift_id: string;
  shift_name: string;
  duty_point_id: string;
  duty_point_name: string;
  start_time: string;
  end_time: string;
  from_date: string;
  to_date: string;
  active: boolean;
}

interface DepartmentDetail {
  department_id: number;
  name: string;
  shifts: Array<{
    name: string;
    shift_id: number;
  }>;
  duty_points: Array<{
    name: string;
    duty_point_id: number;
  }>;
}

interface EmployeesResponse {
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const EmployeesView: React.FC = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentDetails, setDepartmentDetails] = useState<DepartmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [dutyPointFilter, setDutyPointFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [limit] = useState(10);

  // Fetch department details for filters
  const fetchDepartmentDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/department-details`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartmentDetails(data);
      } else {
        console.error('Failed to fetch department details');
      }
    } catch (error) {
      console.error('Error fetching department details:', error);
    }
  };

  // Fetch employees with filters
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        role: 'Employee',
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filters
      if (searchTerm.trim()) {
        params.append('name', searchTerm.trim());
      }

      if (departmentFilter !== 'all') {
        params.append('department_id', departmentFilter);
      } else if (user?.role === 'department_admin' && user.departmentId) {
        // For department admin, filter by their department
        params.append('department_id', user.departmentId);
      }

      if (shiftFilter !== 'all') {
        params.append('shift_id', shiftFilter);
      }

      if (dutyPointFilter !== 'all') {
        params.append('duty_point_id', dutyPointFilter);
      }

      const response = await fetch(`${API_BASE_URL}/api/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: EmployeesResponse = await response.json();
        
        // Filter employees by role and status
        let filteredEmployees = data.data.filter(emp => emp.role === 'Employee');
        
        if (statusFilter !== 'all') {
          filteredEmployees = filteredEmployees.filter(emp => 
            statusFilter === 'active' ? emp.active : !emp.active
          );
        }

        setEmployees(filteredEmployees);
        setTotalPages(data.pagination.totalPages);
        setTotalEmployees(data.pagination.total);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDepartmentDetails();
  }, []);

  // Fetch employees when filters or page changes
  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, departmentFilter, shiftFilter, dutyPointFilter, statusFilter, user]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, shiftFilter, dutyPointFilter, statusFilter]);

  // Get available shifts based on selected department
  const getAvailableShifts = () => {
    if (departmentFilter === 'all') {
      return departmentDetails.flatMap(dept => dept.shifts);
    }
    const selectedDept = departmentDetails.find(dept => dept.department_id.toString() === departmentFilter);
    return selectedDept?.shifts || [];
  };

  // Get available duty points based on selected department
  const getAvailableDutyPoints = () => {
    if (departmentFilter === 'all') {
      return departmentDetails.flatMap(dept => dept.duty_points);
    }
    const selectedDept = departmentDetails.find(dept => dept.department_id.toString() === departmentFilter);
    return selectedDept?.duty_points || [];
  };

  // Reset dependent filters when department changes
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setShiftFilter('all');
    setDutyPointFilter('all');
  };

  // Format time from API format
  const formatApiTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    
    if (hour === 24) hour = 0;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setShiftFilter('all');
    setDutyPointFilter('all');
    setStatusFilter('all');
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

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
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          {user?.role === 'super_admin' && (
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
                  {departmentDetails.map(dept => (
                    <option key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Shift Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Shifts</option>
                {getAvailableShifts().map(shift => (
                  <option key={shift.shift_id} value={shift.shift_id.toString()}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                {getAvailableDutyPoints().map(point => (
                  <option key={point.duty_point_id} value={point.duty_point_id.toString()}>
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
        {(searchTerm || departmentFilter !== 'all' || shiftFilter !== 'all' || dutyPointFilter !== 'all' || statusFilter !== 'all') && (
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
                Dept: {departmentDetails.find(d => d.department_id.toString() === departmentFilter)?.name}
                <button
                  onClick={() => handleDepartmentFilterChange('all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {shiftFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Shift: {getAvailableShifts().find(s => s.shift_id.toString() === shiftFilter)?.name}
                <button
                  onClick={() => setShiftFilter('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {dutyPointFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Point: {getAvailableDutyPoints().find(p => p.duty_point_id.toString() === dutyPointFilter)?.name}
                <button
                  onClick={() => setDutyPointFilter('all')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {employees.length} of {totalEmployees} employees</span>
          <span>Page {currentPage} of {totalPages}</span>
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

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                {user?.role === 'super_admin' && (
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
              {employees.map((employee) => (
                <tr key={employee.user_id} className="hover:bg-gray-50 transition-colors">
                  {/* Employee Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">ID: {employee.user_id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Department Info (only for super admin) */}
                  {user?.role === 'super_admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.department_name && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.department_name}
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
                    {employee.duty_point_name ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.duty_point_name}</div>
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
                    {employee.shift_name ? (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.shift_name}
                          </div>
                          {employee.start_time && employee.end_time && (
                            <div className="text-xs text-gray-500">
                              {formatApiTime(employee.start_time)} - {formatApiTime(employee.end_time)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No shift assigned</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {employee.active ? 'Active' : 'Inactive'}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {employees.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || departmentFilter !== 'all' || shiftFilter !== 'all' || dutyPointFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first employee'
              }
            </p>
            {!searchTerm && departmentFilter === 'all' && shiftFilter === 'all' && dutyPointFilter === 'all' && statusFilter === 'all' && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({totalEmployees} total employees)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default EmployeesView;