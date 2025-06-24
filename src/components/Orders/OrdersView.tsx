import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Send, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';

const OrdersView: React.FC = () => {
  const { orders, departments, setOrders } = useData();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDepartments: [] as string[],
    isUrgent: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder = {
      id: `order-${Date.now()}`,
      ...formData,
      fileName: selectedFile?.name,
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      uploadedBy: user?.id || '',
      acknowledgments: {},
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    setShowCreateForm(false);
    setFormData({
      title: '',
      description: '',
      targetDepartments: [],
      isUrgent: false,
    });
    setSelectedFile(null);
  };

  const getAckStatus = (order: any) => {
    const totalDepts = order.targetDepartments.length;
    const ackedDepts = Object.values(order.acknowledgments).filter(Boolean).length;
    return { ackedDepts, totalDepts };
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter order title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    checked={!formData.isUrgent}
                    onChange={() => setFormData(prev => ({ ...prev, isUrgent: false }))}
                    className="mr-2"
                  />
                  Normal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    checked={formData.isUrgent}
                    onChange={() => setFormData(prev => ({ ...prev, isUrgent: true }))}
                    className="mr-2"
                  />
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                  Urgent
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter detailed description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Departments *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <label key={dept.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.targetDepartments.includes(dept.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          targetDepartments: [...prev.targetDepartments, dept.id] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          targetDepartments: prev.targetDepartments.filter(id => id !== dept.id) 
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  {dept.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Document (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Order
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Directives</h1>
          <p className="text-gray-600">
            {user?.role === 'super_admin' 
              ? 'Create and manage orders for departments' 
              : 'View and acknowledge received orders'
            }
          </p>
        </div>
        
        {user?.role === 'super_admin' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Departments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const { ackedDepts, totalDepts } = getAckStatus(order);
                  const targetDeptNames = departments
                    .filter(d => order.targetDepartments.includes(d.id))
                    .map(d => d.name.split(',')[0]);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      {/* Order Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            order.isUrgent ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {order.isUrgent ? (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {order.title}
                              </h3>
                              {order.isUrgent && (
                                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {order.description}
                            </p>
                            {order.fileName && (
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <FileText className="h-3 w-3 mr-1" />
                                {order.fileName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target Departments */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {targetDeptNames.slice(0, 2).map((deptName, index) => (
                            <div key={index} className="text-sm text-gray-900">
                              {deptName}
                            </div>
                          ))}
                          {targetDeptNames.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{targetDeptNames.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Date Published */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {order.fileName && (
                            <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {user?.role !== 'super_admin' && !order.acknowledgments[user?.departmentId || ''] && (
                            <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersView;