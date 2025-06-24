import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import AddDepartmentModal from '../Departments/AddDepartmentModal';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
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

  // Filter data based on selections (Super Admin only)
  const getAdvancedFilteredData = () => {
    let filteredEmployees = employees;
    let filteredDutyPoints = dutyPoints;
    let filteredShifts = shifts;

    if (selectedDepartment !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.departmentId === selectedDepartment);
      filteredDutyPoints = filteredDutyPoints.filter(p => p.departmentId === selectedDepartment);
      filteredShifts = filteredShifts.filter(s => s.departmentId === selectedDepartment);
    }

    if (selectedDutyPoint !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.dutyPointId === selectedDutyPoint);
    }

    if (selectedShift !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.shiftId === selectedShift);
    }

    if (searchTerm) {
      filteredEmployees = filteredEmployees.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm)
      );
    }

    return { filteredEmployees, filteredDutyPoints, filteredShifts };
  };

  const { filteredEmployees: advancedFilteredEmployees, filteredDutyPoints: advancedFilteredDutyPoints, filteredShifts: advancedFilteredShifts } = getAdvancedFilteredData();

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
    const newDepartment = {
      ...departmentData,
      adminId: `admin-${Date.now()}`,
      activePoints: 0,
      totalShifts: 0,
      totalEmployees: 0,
    };
    
    addDepartment(newDepartment);
    console.log('New admin to be created:', adminData);
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {user?.role === 'department_admin' ? (
          <StatsCard
            title="Total Employees"
            value={filteredEmployees.length}
            icon={Users}
            color="bg-blue-500"
            trend="+2 this month"
          />
        ) : (
          <StatsCard
            title="Total Departments"
            value={filteredDepartments.length}
            icon={Building2}
            color="bg-blue-500"
            trend="+2 this month"
          />
        )}
        <StatsCard
          title="Active Employees"
          value={filteredEmployees.filter(e => e.isActive).length}
          icon={Users}
          color="bg-green-500"
          trend="+8 this week"
        />
        <StatsCard
          title="Active Shifts"
          value={filteredShifts.filter(s => s.isActive).length}
          icon={Clock}
          color="bg-purple-500"
        />
        <StatsCard
          title="Duty Points"
          value={filteredDutyPoints.length}
          icon={MapPin}
          color="bg-orange-500"
        />
      </div>

      {/* Super Admin Enhanced Features */}
      {user?.role === 'super_admin' && (
        <>
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

          {/* Department Overview with Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Department Overview</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name.split(',')[0]}</option>
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
                  {advancedFilteredDutyPoints.map(point => (
                    <option key={point.id} value={point.id}>{point.name}</option>
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
                  {advancedFilteredShifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
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

            {/* Employee Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {advancedFilteredEmployees.map((employee) => {
                const dutyPoint = dutyPoints.find(p => p.id === employee.dutyPointId);
                const shift = shifts.find(s => s.id === employee.shiftId);
                const department = departments.find(d => d.id === employee.departmentId);
                
                return (
                  <div key={employee.id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 lg:p-4 border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">{employee.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{employee.designation}</p>
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                          employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-orange-700" />
                      </div>
                    </div>
                    
                    {/* Duty Point - Highlighted */}
                    {dutyPoint && (
                      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-2 mb-2 text-white">
                        <div className="flex items-center justify-center">
                          <MapPin className="h-3 lg:h-4 w-3 lg:w-4 mr-1 lg:mr-2" />
                          <span className="font-bold text-xs lg:text-sm">{dutyPoint.name}</span>
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
                      {department && (
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 text-gray-600 mr-1 lg:mr-2" />
                          <span className="text-gray-700">{department.name.split(',')[0]}</span>
                        </div>
                      )}
                      
                      {shift && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-600 mr-1 lg:mr-2" />
                          <span className="text-gray-700">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {advancedFilteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            )}
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

      {user?.role === 'department_admin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Duty Points Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDutyPoints.slice(0, 5).map((point) => {
              const pointEmployee = filteredEmployees.find(e => e.dutyPointId === point.id);
              const pointShift = filteredShifts.find(s => s.dutyPointId === point.id);
              
              return (
                <div key={point.id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-orange-900">{point.name}</h3>
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-700" />
                    </div>
                  </div>
                  
                  {pointEmployee && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-3 w-3 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">{pointEmployee.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📞</span>
                        <span>{pointEmployee.phone}</span>
                      </div>
                      {pointShift && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-2" />
                          <span>{pointShift.startTime} - {pointShift.endTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!pointEmployee && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={() => {}}
            />
          ))}
        </div>
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