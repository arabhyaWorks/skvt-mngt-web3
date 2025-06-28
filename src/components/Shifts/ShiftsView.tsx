import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Users,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import AddShiftModal from './AddShiftModal';

interface Shift {
  shift_id: number;
  name: string;
  start_time: string;
  end_time: string;
  duration: number;
  department_id: number;
}

const ShiftsView: React.FC = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch shifts from API
  const fetchShifts = async () => {
    if (!user?.departmentId) {
      setError('Department ID not found');
      setLoading(false);
      return;
    }

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
        setShifts(data.shifts || []);
      } else {
        setError('Failed to fetch shifts');
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  React.useEffect(() => {
    if (user?.departmentId) {
      fetchShifts();
    }
  }, [user?.departmentId]);

  // Filter shifts based on search
  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleShiftCreated = () => {
    // Refresh the shifts list
    fetchShifts();
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts Management</h1>
          <p className="text-gray-600 mt-1">
            Manage duty shifts and schedules
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredShifts.length} of {shifts.length} shifts
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

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShifts.map((shift) => {
          return (
            <div key={shift.shift_id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden">
              {/* Shift Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {shift.name}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                      Active
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                {/* Timing */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-lg font-semibold text-blue-900">
                      {formatApiTime(shift.start_time)} - {formatApiTime(shift.end_time)}
                    </span>
                  </div>
                  {shift.duration && (
                    <div className="text-center mt-1">
                      <span className="text-sm text-blue-700">
                        Duration: {shift.duration} hours
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shift Details */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Shift Details</h4>
                  
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
                      <div className="col-span-2">
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{shift.duration} hours</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>No staff assigned to this shift yet</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredShifts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first shift'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Shift
            </button>
          )}
        </div>
      )}

      {/* Add Shift Modal */}
      <AddShiftModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleShiftCreated}
      />
    </div>
  );
};

export default ShiftsView;