import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Plus,
  ArrowLeft,
  UserCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import AddDutyPointModal from './AddDutyPointModal';
import AddShiftModal from './AddShiftModal';
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

interface EmployeesResponse {
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const DepartmentDetail: React.FC = () => {
  const { id: departmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departments } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Employee-related states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employeeShiftFilter, setEmployeeShiftFilter] = useState<string>('all');
  const [employeeDutyPointFilter, setEmployeeDutyPointFilter] = useState<string>('all');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<'all' | 'on_duty' | 'off_duty' | 'not_assigned'>('all');
  const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);
  const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
  const [employeeTotalCount, setEmployeeTotalCount] = useState(0);
  const [employeeLimit] = useState(10);

  // Modal states
  const [showAddDutyPointModal, setShowAddDutyPointModal] = useState(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  // Fetch department details from API
  useEffect(() => {
    const fetchDepartmentDetail = async () => {
      if (!departmentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDepartmentData(data);
        } else {
          setError('Failed to fetch department details');
        }
      } catch (error) {
        console.error('Error fetching department details:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentDetail();
  }, [departmentId]);

  // Fetch employees for this department
  const fetchDepartmentEmployees = async () => {
    if (!departmentId) return;
    
    try {
      setEmployeesLoading(true);
      setEmployeesError(null);

      // Build query parameters
      const params = new URLSearchParams({
        role: 'Employee',
        department_id: departmentId,
        page: employeeCurrentPage.toString(),
        limit: employeeLimit.toString(),
      });

      // Add filters
      if (employeeSearchTerm.trim()) {
        params.append('name', employeeSearchTerm.trim());
      }

      if (employeeShiftFilter !== 'all') {
        params.append('shift_id', employeeShiftFilter);
      }

      if (employeeDutyPointFilter !== 'all') {
        params.append('duty_point_id', employeeDutyPointFilter);
      }

       if (employeeStatusFilter !== 'all') {
         params.append('status', employeeStatusFilter);
       }
      const response = await fetch(`${API_BASE_URL}/api/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: EmployeesResponse = await response.json();
        
        // Filter employees by role
        let filteredEmployees = data.data.filter(emp => emp.role === 'Employee');
        

        setEmployees(filteredEmployees);
        setEmployeeTotalPages(data.pagination.totalPages);
        setEmployeeTotalCount(data.pagination.total);
      } else {
        setEmployeesError('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeesError('Network error occurred');
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch employees when tab changes to employees or filters change
  useEffect(() => {
    if (activeTab === 'employees' && departmentId) {
      fetchDepartmentEmployees();
    }
  }, [activeTab, departmentId, employeeCurrentPage, employeeSearchTerm, employeeShiftFilter, employeeDutyPointFilter, employeeStatusFilter]);

  // Refresh department data when modals succeed
  const handleDataRefresh = () => {
    // Refresh department details
    const fetchDepartmentDetail = async () => {
      if (!departmentId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDepartmentData(data);
        }
      } catch (error) {
        console.error('Error refreshing department details:', error);
      }
    };

    fetchDepartmentDetail();
    
    // Refresh employees if on employees tab
    if (activeTab === 'employees') {
      fetchDepartmentEmployees();
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setEmployeeCurrentPage(1);
  }, [employeeSearchTerm, employeeShiftFilter, employeeDutyPointFilter, employeeStatusFilter]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !departmentData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Department not found'}</p>
        <button
          onClick={() => navigate('/departments')}
          className="mt-4 text-orange-600 hover:text-orange-800"
        >
          Go Back to Departments
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'points', label: 'Duty Points', icon: MapPin },
    { id: 'shifts', label: 'Shifts', icon: Clock },
    { id: 'employees', label: 'Employees', icon: Users },
  ];

  // Helper function to format time from API format
  const formatApiTime = (timeString: string) => {
    if (!timeString) return '';
    // Handle format like "16:00:00.000000" or "24:00:00.000000"
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    
    // Handle 24:00 as midnight
    if (hour === 24) hour = 0;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Clear employee filters
  const clearEmployeeFilters = () => {
    setEmployeeSearchTerm('');
    setEmployeeShiftFilter('all');
    setEmployeeDutyPointFilter('all');
    setEmployeeStatusFilter('all');
  };

  // Employee pagination handlers
  const handleEmployeePreviousPage = () => {
    if (employeeCurrentPage > 1) {
      setEmployeeCurrentPage(employeeCurrentPage - 1);
    }
  };

  const handleEmployeeNextPage = () => {
    if (employeeCurrentPage < employeeTotalPages) {
      setEmployeeCurrentPage(employeeCurrentPage + 1);
    }
  };

  const handleEmployeePageClick = (page: number) => {
    setEmployeeCurrentPage(page);
  };

  // Generate page numbers for employee pagination
  const getEmployeePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, employeeCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(employeeTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Points</p>
              <p className="text-2xl font-bold text-orange-600">{departmentData.duty_points?.length || 0}</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-blue-600">{departmentData.shifts?.length || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Members</p>
              <p className="text-2xl font-bold text-green-600">{departmentData.num_employees || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <p className="mt-1 text-sm text-gray-900">{departmentData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{departmentData.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Admin</label>
            <p className="mt-1 text-sm text-gray-900">{departmentData.admin_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
          {departmentData.current_shift && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Shift</label>
              <div className="mt-1 bg-blue-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    {departmentData.current_shift.name}
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {formatApiTime(departmentData.current_shift.start_time)} - {formatApiTime(departmentData.current_shift.end_time)}
                  {departmentData.current_shift.duration && ` (${departmentData.current_shift.duration}h)`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPoints = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Duty Points</h3>
        {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
          <button 
            onClick={() => setShowAddDutyPointModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Point
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(departmentData.duty_points || []).map((point: any) => (
          <div key={point.duty_point_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{point.name}</h4>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    {point.num_people} people assigned
                  </span>
                </div>
              </div>
              {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{point.description}</p>
            {point.description.includes('Coordinate:') && (
              <p className="text-sm text-gray-500">
                <MapPin className="h-4 w-4 inline mr-1" />
                {point.description.match(/Coordinate: ([\d.,]+)/)?.[1] || 'Location data available'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderShifts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Shifts</h3>
        {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
          <button 
            onClick={() => setShowAddShiftModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {(departmentData.shifts || []).map((shift: any) => {
          return (
            <div key={shift.shift_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{shift.name}</h4>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      {formatApiTime(shift.start_time)} - {formatApiTime(shift.end_time)}
                    </span>
                    {shift.duration && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({shift.duration}h duration)
                      </span>
                    )}
                  </div>
                </div>
                {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {departmentData.current_shift && departmentData.current_shift.shift_id === shift.shift_id && (
                  <div className="md:col-span-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-800">Currently Active Shift</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Shift Details</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start Time:</span>
                        <span className="ml-2 font-medium">{formatApiTime(shift.start_time)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">End Time:</span>
                        <span className="ml-2 font-medium">{formatApiTime(shift.end_time)}</span>
                      </div>
                      {shift.duration && (
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{shift.duration} hours</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Employees</h3>
        {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
          <button 
            onClick={() => setShowAddEmployeeModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        )}
      </div>
      
      {/* Employee Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={employeeShiftFilter}
                onChange={(e) => setEmployeeShiftFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Shifts</option>
                {(departmentData?.shifts || []).map((shift: any) => (
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
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={employeeDutyPointFilter}
                onChange={(e) => setEmployeeDutyPointFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Duty Points</option>
                {(departmentData?.duty_points || []).map((point: any) => (
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
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={employeeStatusFilter}
                onChange={(e) => setEmployeeStatusFilter(e.target.value as 'all' | 'on_duty' | 'off_duty' | 'not_assigned')}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="on_duty">On Duty</option>
                <option value="off_duty">Off Duty</option>
                <option value="not_assigned">Not Assigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(employeeSearchTerm || employeeShiftFilter !== 'all' || employeeDutyPointFilter !== 'all' || employeeStatusFilter !== 'all') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {employeeSearchTerm && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{employeeSearchTerm}"
                <button
                  onClick={() => setEmployeeSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {employeeShiftFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Shift: {departmentData?.shifts?.find((s: any) => s.shift_id.toString() === employeeShiftFilter)?.name}
                <button
                  onClick={() => setEmployeeShiftFilter('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {employeeDutyPointFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Point: {departmentData?.duty_points?.find((p: any) => p.duty_point_id.toString() === employeeDutyPointFilter)?.name}
                <button
                  onClick={() => setEmployeeDutyPointFilter('all')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            {employeeStatusFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Status: {employeeStatusFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <button
                  onClick={() => setEmployeeStatusFilter('all')}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearEmployeeFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {employees.length} of {employeeTotalCount} employees</span>
          {employeeTotalPages > 1 && (
            <span>Page {employeeCurrentPage} of {employeeTotalPages}</span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {employeesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {employeesError}
          </div>
        </div>
      )}

      {/* Loading State */}
      {employeesLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Loading employees...</span>
        </div>
      )}

      {/* Employees Table */}
      {!employeesLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        employee.status === 'on_duty' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : employee.status === 'off_duty'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {employee.status === 'on_duty' ? 'On Duty' : 
                         employee.status === 'off_duty' ? 'Off Duty' : 
                         'Not Assigned'}
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
          {employees.length === 0 && !employeesLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {employeeSearchTerm || employeeShiftFilter !== 'all' || employeeDutyPointFilter !== 'all' || employeeStatusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No employees assigned to this department yet'
                }
              </p>
              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {employeeTotalPages > 1 && !employeesLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {employeeCurrentPage} of {employeeTotalPages} ({employeeTotalCount} total employees)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEmployeePreviousPage}
                disabled={employeeCurrentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {getEmployeePageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handleEmployeePageClick(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === employeeCurrentPage
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleEmployeeNextPage}
                disabled={employeeCurrentPage === employeeTotalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/departments')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{departmentData.name}</h1>
            <p className="text-gray-600">{departmentData.description}</p>
          </div>
        </div>
        
        {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Edit className="h-4 w-4 mr-2" />
            Edit Department
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'points' && renderPoints()}
        {activeTab === 'shifts' && renderShifts()}
        {activeTab === 'employees' && renderEmployees()}
      </div>

      {/* Add Modals */}
      {departmentId && (
        <>
          <AddDutyPointModal
            isOpen={showAddDutyPointModal}
            onClose={() => setShowAddDutyPointModal(false)}
            onSuccess={handleDataRefresh}
            departmentId={departmentId}
          />
          <AddShiftModal
            isOpen={showAddShiftModal}
            onClose={() => setShowAddShiftModal(false)}
            onSuccess={handleDataRefresh}
            departmentId={departmentId}
          />
          <AddEmployeeModal
            isOpen={showAddEmployeeModal}
            onClose={() => setShowAddEmployeeModal(false)}
            onSuccess={handleDataRefresh}
            departmentId={departmentId}
          />
        </>
      )}
    </div>
  );
};

export default DepartmentDetail;