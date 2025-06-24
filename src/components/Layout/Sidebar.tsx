import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  Clock, 
  MapPin, 
  FileText, 
  CheckSquare,
  Shield,
  Eye,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeView: string;
  onViewChange: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onViewChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    ];

    if (user?.role === 'super_admin') {
      return [
        ...commonItems,
        { id: 'departments', label: 'Departments', icon: Building2, path: '/departments' },
        { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
        { id: 'orders', label: 'Orders & Directives', icon: FileText, path: '/orders' },
        { id: 'checklists', label: 'Checklists', icon: CheckSquare, path: '/checklists' },
        { id: 'security', label: 'Security', icon: Shield, path: '/security' },
      ];
    } else if (user?.role === 'department_admin') {
      return [
        ...commonItems,
        { id: 'duty-points', label: 'Duty Points', icon: MapPin, path: '/duty-points' },
        { id: 'shifts', label: 'Shifts', icon: Clock, path: '/shifts' },
        { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
        { id: 'assign-duty', label: 'Assign Duty', icon: CheckSquare, path: '/assign-duty' },
        { id: 'orders', label: 'Orders Received', icon: FileText, path: '/orders' },
      ];
    } else {
      return [
        ...commonItems,
        { id: 'departments', label: 'Departments', icon: Building2, path: '/departments' },
        { id: 'monitor', label: 'Live Monitor', icon: Eye, path: '/monitor' },
        { id: 'contacts', label: 'Emergency Contacts', icon: Users, path: '/contacts' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path: string) => {
    navigate(path);
    onViewChange(); // Close mobile sidebar
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/departments') {
      return location.pathname === '/departments' || location.pathname.startsWith('/departments/');
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-orange-100 h-full overflow-y-auto">
      <nav className="mt-4 lg:mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon className="mr-3 h-4 lg:h-5 w-4 lg:w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 lg:h-5 w-4 lg:w-5" />
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;