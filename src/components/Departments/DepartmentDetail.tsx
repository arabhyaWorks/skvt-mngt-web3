import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';

const DepartmentDetail: React.FC = () => {
  const { id: departmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departments, employees, shifts, dutyPoints } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const department = departments.find(d => d.id === departmentId);
  const departmentEmployees = employees.filter(e => e.departmentId === departmentId);
  const departmentShifts = shifts.filter(s => s.departmentId === departmentId);
  const departmentPoints = dutyPoints.filter(p => p.departmentId === departmentId);

  if (!department) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Department not found</p>
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Points</p>
              <p className="text-2xl font-bold text-orange-600">{departmentPoints.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-blue-600">{departmentShifts.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Members</p>
              <p className="text-2xl font-bold text-green-600">{departmentEmployees.length}</p>
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
            <p className="mt-1 text-sm text-gray-900">{department.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{department.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              department.status === 'active' ? 'bg-green-100 text-green-800' :
              department.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {department.status === 'active' ? 'Active' :
               department.status === 'on_hold' ? 'On Hold' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPoints = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Duty Points</h3>
        {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Point
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departmentPoints.map((point) => (
          <div key={point.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-900">{point.name}</h4>
              {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{point.description}</p>
            <p className="text-sm text-gray-500">
              <MapPin className="h-4 w-4 inline mr-1" />
              {point.location}
            </p>
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
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {departmentShifts.map((shift) => {
          const point = dutyPoints.find(p => p.id === shift.dutyPointId);
          const inCharge = employees.find(e => e.id === shift.inChargeId);
          const shiftEmployees = employees.filter(e => shift.employeeIds.includes(e.id));
          
          return (
            <div key={shift.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{shift.name}</h4>
                  <p className="text-sm text-gray-600">{point?.name}</p>
                </div>
                {(user?.role === 'super_admin' || user?.role === 'department_admin') && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Timing</p>
                  <p className="text-sm text-gray-900">{shift.startTime} - {shift.endTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">In-charge</p>
                  <p className="text-sm text-gray-900">{inCharge?.name || 'Not assigned'}</p>
                  {inCharge?.phone && (
                    <p className="text-xs text-gray-500">
                      <Phone className="h-3 w-3 inline mr-1" />
                      {inCharge.phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Staff Count</p>
                  <p className="text-sm text-gray-900">{shiftEmployees.length} employees</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Assigned Staff</p>
                <div className="flex flex-wrap gap-2">
                  {shiftEmployees.map((emp) => (
                    <span key={emp.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      <UserCheck className="h-3 w-3 mr-1" />
                      {emp.name}
                    </span>
                  ))}
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
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departmentEmployees.map((employee) => {
              const point = dutyPoints.find(p => p.id === employee.dutyPointId);
              const shift = shifts.find(s => s.id === employee.shiftId);
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      {employee.email && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {employee.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{point?.name || 'Not assigned'}</div>
                      <div className="text-xs text-gray-500">{shift?.name || 'No shift'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
            <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-600">{department.description}</p>
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
    </div>
  );
};

export default DepartmentDetail;