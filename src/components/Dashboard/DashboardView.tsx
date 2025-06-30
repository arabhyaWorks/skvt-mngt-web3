import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Users, 
  User,
  Building2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Shield,
  Plus,
  Phone,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddDepartmentModal from '../Departments/AddDepartmentModal';
import { API_BASE_URL } from '../../config/api';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
}

interface DepartmentDetail {
  department_id: number;
  name: string;
  description: string;
  admin_id: number;
  admin_name: string;
  num_employees: number;
  shifts: Array<{
    name: string;
    duration: number;
    end_time: string;
    shift_id: number;
    start_time: string;
  }>;
  duty_points: Array<{
    name: string;
    num_people: number;
    description: string;
    duty_point_id: number;
  }>;
  current_employees: Array<{
    name: string;
    email: string;
    phone: string;
    user_id: number;
    duty_point_id: number;
  }>;
  current_shift: {
    name: string;
    duration: number;
    end_time: string;
    shift_id: number;
    start_time: string;
  } | null;
}
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

interface DepartmentCardProps {
  department: any;
  onClick: () => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/departments/${department.id}`);
    onClick();
  };

  return (
  <div 
    onClick={handleClick}
    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors line-clamp-2">
        {department.name}
      </h3>
      <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
        <Building2 className="h-5 w-5 text-orange-600 group-hover:text-orange-700" />
      </div>
    </div>
    
    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{department.description}</p>
    
    <div className="mb-4">
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        department.status === 'active' ? 'bg-green-100 text-green-800' :
        department.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {department.status === 'active' ? 'Active' :
         department.status === 'on_hold' ? 'On Hold' : 'Inactive'}
      </span>
    </div>
    
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-lg font-bold text-orange-600">{department.activePoints}</p>
        <p className="text-xs text-gray-500">Active Points</p>
      </div>
      <div>
        <p className="text-lg font-bold text-blue-600">{department.totalShifts}</p>
        <p className="text-xs text-gray-500">Shifts</p>
      </div>
      <div>
        <p className="text-lg font-bold text-green-600">{department.totalEmployees}</p>
        <p className="text-xs text-gray-500">Staff</p>
      </div>
    </div>
  </div>
  );
};

interface DashboardViewProps {
  onViewChange?: (view: string, departmentId?: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onViewChange = () => {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { departments, employees, shifts, dutyPoints, addDepartment } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDutyPoint, setSelectedDutyPoint] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Department admin specific state
  const [departmentDetail, setDepartmentDetail] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Super Admin Department Overview state
  const [departmentDetails, setDepartmentDetails] = useState<any[]>([]);
  const [overviewEmployees, setOverviewEmployees] = useState<any[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewCurrentPage, setOverviewCurrentPage] = useState(1);
  const [overviewTotalPages, setOverviewTotalPages] = useState(1);
  const [overviewTotalEmployees, setOverviewTotalEmployees] = useState(0);
  const [overviewLimit] = useState(12);

  // Stats API state
  const [statsData, setStatsData] = useState({
    total_departments: 0,
    active_employees: 0,
    total_employees: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch department details for department admin
  const fetchDepartmentDetail = async () => {
    if (!user?.departmentId || user.role !== 'department_admin') return;
    
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
        setDepartmentDetail(data);
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

  // Fetch department details for filters (Super Admin)
  const fetchDepartmentDetails = async () => {
    if (user?.role !== 'super_admin') return;

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
        setOverviewError('Failed to fetch department details');
      }
    } catch (error) {
      console.error('Error fetching department details:', error);
      setOverviewError('Network error occurred');
    }
  };

  // Fetch stats for super admin
  const fetchStats = async () => {
    if (user?.role !== 'super_admin') return;

    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      } else {
        setStatsError('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Network error occurred');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch employees for overview (Super Admin)
  const fetchOverviewEmployees = async () => {
    if (user?.role !== 'super_admin') return;

    try {
      setOverviewLoading(true);
      setOverviewError(null);

      // Build query parameters
      const params = new URLSearchParams({
        role: 'Employee',
        page: overviewCurrentPage.toString(),
        limit: overviewLimit.toString(),
      });

      // Add filters
      if (searchTerm.trim()) {
        params.append('name', searchTerm.trim());
      }

      if (selectedDepartment !== 'all') {
        params.append('department_id', selectedDepartment);
      }

      if (selectedShift !== 'all') {
        params.append('shift_id', selectedShift);
      }

      if (selectedDutyPoint !== 'all') {
        params.append('duty_point_id', selectedDutyPoint);
      }

      const response = await fetch(`${API_BASE_URL}/api/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const filteredEmployees = data.data.filter((emp: any) => emp.role === 'Employee');
        
        setOverviewEmployees(filteredEmployees);
        setOverviewTotalPages(data.pagination.totalPages);
        setOverviewTotalEmployees(data.pagination.total);
      } else {
        setOverviewError('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching overview employees:', error);
      setOverviewError('Network error occurred');
    } finally {
      setOverviewLoading(false);
    }
  };

  // Fetch department details on component mount for department admin
  useEffect(() => {
    if (user?.role === 'department_admin' && user.departmentId) {
      fetchDepartmentDetail();
    }
  }, [user?.role, user?.departmentId]);

  // Fetch department details for super admin
  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchDepartmentDetails();
      fetchStats();
    }
  }, [user?.role]);

  // Fetch overview employees when filters change (Super Admin)
  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchOverviewEmployees();
    }
  }, [user?.role, overviewCurrentPage, searchTerm, selectedDepartment, selectedShift, selectedDutyPoint]);

  // Reset page when filters change
  useEffect(() => {
    setOverviewCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedShift, selectedDutyPoint]);

  const getFilteredData = () => {
    if (user?.role === 'department_admin' && user.departmentId) {
      return {
        departments: departments.filter(d => d.id === user.departmentId),
        employees: employees.filter(e => e.departmentId === user.departmentId),
        shifts: shifts.filter(s => s.departmentId === user.departmentId),
        dutyPoints: dutyPoints.filter(p => p.departmentId === user.departmentId),
      };
    }
    return { departments, employees, shifts, dutyPoints };
  };

  // Get available shifts based on selected department
  const getAvailableShifts = () => {
    if (selectedDepartment === 'all') {
      return departmentDetails.flatMap(dept => dept.shifts);
    }
    const selectedDept = departmentDetails.find(dept => dept.department_id.toString() === selectedDepartment);
    return selectedDept?.shifts || [];
  };

  // Get available duty points based on selected department
  const getAvailableDutyPoints = () => {
    if (selectedDepartment === 'all') {
      return departmentDetails.flatMap(dept => dept.duty_points);
    }
    const selectedDept = departmentDetails.find(dept => dept.department_id.toString() === selectedDepartment);
    return selectedDept?.duty_points || [];
  };

  // Reset dependent filters when department changes
  const handleDepartmentFilterChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedShift('all');
    setSelectedDutyPoint('all');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedShift('all');
    setSelectedDutyPoint('all');
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

  // Pagination handlers
  const handleOverviewPreviousPage = () => {
    if (overviewCurrentPage > 1) {
      setOverviewCurrentPage(overviewCurrentPage - 1);
    }
  };

  const handleOverviewNextPage = () => {
    if (overviewCurrentPage < overviewTotalPages) {
      setOverviewCurrentPage(overviewCurrentPage + 1);
    }
  };

  const handleOverviewPageClick = (page: number) => {
    setOverviewCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getOverviewPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, overviewCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(overviewTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const { departments: filteredDepartments, employees: filteredEmployees, shifts: filteredShifts, dutyPoints: filteredDutyPoints } = getFilteredData();

  // Generate pie chart data for department employees (Super Admin only)
  const departmentEmployeeData = departments.map((dept, index) => {
    const orangeColors = [
      '#ea580c', '#fb923c', '#fed7aa', '#fdba74', '#f97316', '#c2410c', '#9a3412', '#7c2d12',
    ];
    
    return {
      name: dept.name.split(',')[0],
      value: dept.totalEmployees,
      color: orangeColors[index % orangeColors.length]
    };
  });

  // Simple pie chart component
  const PieChart: React.FC<{ data: any[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto">
        <svg width="100%" height="100%" viewBox="0 0 256 256" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const x1 = 128 + 100 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 128 + 100 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 128 + 100 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 128 + 100 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 128 128 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg lg:text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs lg:text-sm text-gray-600">Total Staff</div>
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAddDepartment = (departmentData: any, adminData: any) => {
    return addDepartment(departmentData, adminData);
  };

  // Get stats for department admin from API data
  const getDepartmentAdminStats = () => {
    if (!departmentDetail) {
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        activeShifts: 0,
        dutyPoints: 0
      };
    }

    return {
      totalEmployees: departmentDetail.num_employees,
      activeEmployees: departmentDetail.current_employees.length,
      activeShifts: departmentDetail.shifts.length,
      dutyPoints: departmentDetail.duty_points.length
    };
  };

  const departmentAdminStats = getDepartmentAdminStats();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ml-12 lg:ml-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          {user?.role === 'super_admin' ? 'SKVT Management Dashboard' : 
           user?.role === 'department_admin' ? 'Department Dashboard' : 
           'Control Room Dashboard'}
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          {user?.role === 'super_admin' ? 'Executive overview of all temple operations and departments' :
           user?.role === 'department_admin' ? 'Manage your department operations' :
           'Monitor live temple operations'}
        </p>
      </div>

      {/* Loading State for Department Admin */}
      {user?.role === 'department_admin' && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading department data...</p>
          </div>
        </div>
      )}

      {/* Error State for Department Admin */}
      {user?.role === 'department_admin' && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}
      {/* Stats Cards */}
      {!loading && (
        <div >
        {user?.role === 'department_admin' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <StatsCard
              title="Total Employees"
              value={departmentAdminStats.totalEmployees}
              icon={Users}
              color="bg-blue-500"
              trend="+2 this month"
            />
            <StatsCard
              title="Active Employees"
              value={departmentAdminStats.activeEmployees}
              icon={Users}
              color="bg-green-500"
              trend="+8 this week"
            />
            <StatsCard
              title="Active Shifts"
              value={departmentAdminStats.activeShifts}
              icon={Clock}
              color="bg-purple-500"
            />
            <StatsCard
              title="Duty Points"
              value={departmentAdminStats.dutyPoints}
              icon={MapPin}
              color="bg-orange-500"
            />
          </div>
        ) : (
          < div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
            <StatsCard
              title="Total Departments"
              value={statsData.total_departments}
              icon={Building2}
              color="bg-blue-500"
              trend="+2 this month"
            />
            <StatsCard
              title="Active Employees"
              value={statsData.active_employees}
              icon={Users}
              color="bg-green-500"
              trend="+8 this week"
            />
            <StatsCard
              title="Total Employees"
              value={statsData.total_employees}
              icon={Users}
              color="bg-purple-500"
              trend="+15 this month"
            />
            {/* <StatsCard
              title="Duty Points"
              value={filteredDutyPoints.length}
              icon={MapPin}
              color="bg-orange-500"
            /> */}
          </div>
        )}
        </div>
      )}

      {/* Super Admin Enhanced Features */}
      {user?.role === 'super_admin' && (
        <>
          {/* Department Overview with Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Department Overview</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                  className="w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Departments</option>
                  {departmentDetails.map(dept => (
                    <option key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.name.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Duty Point</label>
                <select
                  value={selectedDutyPoint}
                  onChange={(e) => setSelectedDutyPoint(e.target.value)}
                  className="w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Duty Points</option>
                  {getAvailableDutyPoints().map(point => (
                    <option key={point.duty_point_id} value={point.duty_point_id.toString()}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Shift Timing</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Shifts</option>
                  {getAvailableShifts().map(shift => (
                    <option key={shift.shift_id} value={shift.shift_id.toString()}>
                      {shift.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 lg:h-4 w-3 lg:w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 lg:pl-10 pr-2 lg:pr-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || selectedDepartment !== 'all' || selectedShift !== 'all' || selectedDutyPoint !== 'all') && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
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
                {selectedDepartment !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Dept: {departmentDetails.find(d => d.department_id.toString() === selectedDepartment)?.name.split(',')[0]}
                    <button
                      onClick={() => handleDepartmentFilterChange('all')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedShift !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Shift: {getAvailableShifts().find(s => s.shift_id.toString() === selectedShift)?.name}
                    <button
                      onClick={() => setSelectedShift('all')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDutyPoint !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Point: {getAvailableDutyPoints().find(p => p.duty_point_id.toString() === selectedDutyPoint)?.name}
                    <button
                      onClick={() => setSelectedDutyPoint('all')}
                      className="ml-1 text-orange-600 hover:text-orange-800"
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
            <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {overviewEmployees.length} of {overviewTotalEmployees} employees</span>
              {overviewTotalPages > 1 && (
                <span>Page {overviewCurrentPage} of {overviewTotalPages}</span>
              )}
            </div>

            {/* Error Message */}
            {overviewError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {overviewError}
                </div>
              </div>
            )}

            {/* Loading State */}
            {overviewLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Loading employees...</span>
              </div>
            )}

            {/* Employee Cards */}
            {!overviewLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {overviewEmployees.map((employee) => {
                  return (
                    <div key={employee.user_id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 lg:p-4 border border-orange-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">{employee.name}</h3>
                          <p className="text-xs text-gray-600 mb-1">ID: {employee.user_id}</p>
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full border ${
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
                        </div>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-orange-700" />
                        </div>
                      </div>
                      
                      {/* Duty Point - Highlighted */}
                      {employee.duty_point_name && (
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-2 mb-2 text-white">
                          <div className="flex items-center justify-center">
                            <MapPin className="h-3 lg:h-4 w-3 lg:w-4 mr-1 lg:mr-2" />
                            <span className="font-bold text-xs lg:text-sm">{employee.duty_point_name}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Phone Number - Prominent Display */}
                      <a 
                        href={`tel:${employee.phone}`}
                        className="block bg-white rounded-lg p-2 mb-2 border-2 border-orange-300 hover:bg-orange-50 transition-colors active:bg-orange-100"
                      >
                        <div className="flex items-center justify-center">
                          <Phone className="h-3 lg:h-4 w-3 lg:w-4 text-orange-600 mr-1 lg:mr-2" />
                          <span className="text-xs lg:text-sm font-bold text-orange-900">{employee.phone}</span>
                        </div>
                      </a>
                      
                      <div className="space-y-1 text-xs">
                        {employee.department_name && (
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 text-gray-600 mr-1 lg:mr-2" />
                            <span className="text-gray-700">{employee.department_name.split(',')[0]}</span>
                          </div>
                        )}
                        
                        {employee.shift_name && employee.start_time && employee.end_time && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-gray-600 mr-1 lg:mr-2" />
                            <span className="text-gray-700">
                              {formatApiTime(employee.start_time)} - {formatApiTime(employee.end_time)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!overviewLoading && overviewEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            )}

            {/* Pagination */}
            {overviewTotalPages > 1 && !overviewLoading && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {overviewCurrentPage} of {overviewTotalPages} ({overviewTotalEmployees} total employees)
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOverviewPreviousPage}
                    disabled={overviewCurrentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {getOverviewPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => handleOverviewPageClick(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          page === overviewCurrentPage
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleOverviewNextPage}
                    disabled={overviewCurrentPage === overviewTotalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Department Employee Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Department Employee Distribution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <PieChart data={departmentEmployeeData} />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm lg:text-md font-medium text-gray-700">Department Breakdown</h3>
                {departmentEmployeeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs lg:text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-xs lg:text-sm font-bold text-gray-700">{item.value} staff</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </>
      )}

      {/* Quick Actions */}
      {user?.role === 'super_admin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
              <span className="font-medium text-orange-800">Send Urgent Order</span>
            </button>
            <button
              onClick={() => navigate('/checklists')}
              className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-800">Create Checklist</span>
            </button>
            <button
              onClick={() => navigate('/security')}
              className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              <span className="font-medium text-red-800">Security Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Room Quick View */}
      {user?.role === 'control_room' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/monitor')}
              className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <Eye className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-green-800">Live Deployment View</span>
            </button>
            <button
              onClick={() => navigate('/contacts')}
              className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-800">Emergency Contacts</span>
            </button>
          </div>
        </div>
      )}

      {user?.role === 'department_admin' && departmentDetail && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Duty Points Overview</h2>
            {departmentDetail.current_shift && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    Current Shift: {departmentDetail.current_shift.name}
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {formatApiTime(departmentDetail.current_shift.start_time)} - {formatApiTime(departmentDetail.current_shift.end_time)}
                  ({departmentDetail.current_shift.duration}h)
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentDetail.duty_points.map((point) => {
              const assignedEmployees = departmentDetail.current_employees.filter(
                emp => emp.duty_point_id === point.duty_point_id
              );
              
              return (
                <div key={point.duty_point_id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-orange-900">{point.name}</h3>
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-700" />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Users className="h-3 w-3 mr-2" />
                      <span>{point.num_people} people assigned</span>
                    </div>
                  </div>
                  
                  {assignedEmployees.length > 0 ? (
                    <div className="space-y-2">
                      {assignedEmployees.slice(0, 2).map((employee) => (
                        <div key={employee.user_id} className="bg-white rounded-lg p-2 border border-orange-300">
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 text-gray-600 mr-2" />
                            <span className="font-medium text-gray-900">{employee.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📞</span>
                            <a href={`tel:${employee.phone}`} className="text-orange-600 hover:text-orange-800">
                              {employee.phone}
                            </a>
                          </div>
                        </div>
                      ))}
                      {assignedEmployees.length > 2 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="text-xs">+{assignedEmployees.length - 2} more employees</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No employee assigned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'department_admin' ? 'My Department' : 'Departments Overview'}
          </h2>
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
        
        {user?.role === 'department_admin' && departmentDetail ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{departmentDetail.name}</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{departmentDetail.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-orange-600">{departmentDetail.duty_points.length}</p>
                  <p className="text-xs text-gray-500">Duty Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{departmentDetail.shifts.length}</p>
                  <p className="text-xs text-gray-500">Shifts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{departmentDetail.num_employees}</p>
                  <p className="text-xs text-gray-500">Staff</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDepartment}
      />
    </div>
  );
};

export default DashboardView;