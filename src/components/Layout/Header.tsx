import React from 'react';
import { LogOut, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="https://www.shrikashivishwanath.org/frontend/images/logo.png" 
                alt="Sri Kashi Vishwanath Temple Logo"
                className="w-20 h-[35px] lg:w-30 lg:h-[150px] object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">SKVT Operations Dashboard</h1>
              <p className="text-xs lg:text-sm text-gray-500">Sri Kashi Vishwanath Temple</p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center space-x-1 lg:space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-xs lg:text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === 'super_admin' ? 'Super Admin' : 
                     user?.role === 'department_admin' ? 'Department Admin' : 
                     'Control Room'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;