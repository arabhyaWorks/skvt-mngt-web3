import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import AddDutyPointModal from './AddDutyPointModal';

interface DutyPoint {
  duty_point_id: number;
  name: string;
  description: string;
  coordinate: string;
  department_id: number;
  num_people: number;
}

const DutyPointsView: React.FC = () => {
  const { user } = useAuth();
  const [dutyPoints, setDutyPoints] = useState<DutyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch duty points from API
  const fetchDutyPoints = async () => {
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
        setDutyPoints(data.duty_points || []);
      } else {
        setError('Failed to fetch duty points');
      }
    } catch (error) {
      console.error('Error fetching duty points:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  React.useEffect(() => {
    if (user?.departmentId) {
      fetchDutyPoints();
    }
  }, [user?.departmentId]);

  // Filter duty points based on search
  const filteredDutyPoints = dutyPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDutyPointCreated = () => {
    // Refresh the duty points list
    fetchDutyPoints();
  };

  const formatCoordinate = (coordinate: string) => {
    if (!coordinate) return 'No coordinates';
    // Convert "12.34,56.78" to a more readable format
    const [lat, lng] = coordinate.split(',');
    return `${lat}°, ${lng}°`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading duty points...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Points Management</h1>
          <p className="text-gray-600 mt-1">
            Manage security checkpoints and monitoring locations
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Duty Point
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
                placeholder="Search duty points..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDutyPoints.length} of {dutyPoints.length} duty points
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

      {/* Duty Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDutyPoints.map((point) => {
          return (
            <div
              key={point.duty_point_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
            >
              {/* Point Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {point.name}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                      Active
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                
                {point.description && point.description.trim() && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {point.description}
                  </p>
                )}

                {/* GPS Coordinates */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Navigation className="h-4 w-4 mr-2" />
                  <span>{formatCoordinate(point.coordinate)}</span>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Current Assignment</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Assigned Staff:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {point.num_people} {point.num_people === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  
                  {point.num_people === 0 && (
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>No staff assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
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
      {filteredDutyPoints.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No duty points found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first duty point'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Duty Point
            </button>
          )}
        </div>
      )}

      {/* Add Duty Point Modal */}
      <AddDutyPointModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleDutyPointCreated}
      />
    </div>
  );
};

export default DutyPointsView;