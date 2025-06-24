import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import DepartmentDetail from './components/Departments/DepartmentDetail';
import OrdersView from './components/Orders/OrdersView';
import DepartmentsListView from './components/Departments/DepartmentsListView';
import DutyPointsView from './components/DutyPoints/DutyPointsView';
import ShiftsView from './components/Shifts/ShiftsView';
import EmployeesView from './components/Employees/EmployeesView';
import AssignDutyView from './components/AssignDuty/AssignDutyView';

function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const { loading: dataLoading } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get current view from URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/departments/')) return 'departments';
    if (path === '/departments') return 'departments';
    if (path === '/orders') return 'orders';
    if (path === '/duty-points') return 'duty-points';
    if (path === '/shifts') return 'shifts';
    if (path === '/employees') return 'employees';
    if (path === '/assign-duty') return 'assign-duty';
    if (path === '/checklists') return 'checklists';
    if (path === '/security') return 'security';
    if (path === '/monitor') return 'monitor';
    if (path === '/contacts') return 'contacts';
    return 'dashboard';
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">ॐ</span>
          </div>
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SKVT Management System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            activeView={getCurrentView()} 
            onViewChange={() => setSidebarOpen(false)} 
          />
        </div>

        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 lg:p-6">
            <Routes>
              {/* Dashboard Routes */}
              <Route 
                path="/" 
                element={
                    <DashboardView />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                    <DashboardView />
                } 
              />

              {/* Department Routes */}
              <Route path="/departments" element={<DepartmentsListView />} />
              <Route path="/departments/:id" element={<DepartmentDetail />} />

              {/* Orders Route */}
              <Route path="/orders" element={<OrdersView />} />

              {/* Department Admin Routes */}
              {user?.role === 'department_admin' && (
                <>
                  <Route path="/duty-points" element={<DutyPointsView />} />
                  <Route path="/shifts" element={<ShiftsView />} />
                  <Route path="/employees" element={<EmployeesView />} />
                  <Route path="/assign-duty" element={<AssignDutyView />} />
                </>
              )}

              {/* Super Admin Routes */}
              {user?.role === 'super_admin' && (
                <>
                  <Route path="/employees" element={<EmployeesView />} />
                  <Route path="/checklists" element={<ComingSoonView title="Checklists Management" />} />
                  <Route path="/security" element={<ComingSoonView title="Security Settings" />} />
                </>
              )}

              {/* Control Room Routes */}
              {user?.role === 'control_room' && (
                <>
                  <Route path="/monitor" element={<ComingSoonView title="Live Monitoring" />} />
                  <Route path="/contacts" element={<ComingSoonView title="Emergency Contacts" />} />
                </>
              )}

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// Coming Soon Component
const ComingSoonView: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-orange-600 font-bold text-2xl">🚧</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500">This feature is coming soon. Stay tuned for updates!</p>
  </div>
);

export default App;