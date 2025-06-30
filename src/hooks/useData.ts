import { useState, useEffect } from 'react';
import { Department, Employee, Shift, DutyPoint, Order, Checklist } from '../types';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './useAuth';

export const useData = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dutyPoints, setDutyPoints] = useState<DutyPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentAdmins, setDepartmentAdmins] = useState<any[]>([]);

  // Fetch departments from API for super admin
  const fetchDepartments = async () => {
    if (user?.role !== 'super_admin') {
      setLoading(false);
      return;
    }


    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const departmentsData = data;
        
        const mappedDepartments: Department[] = departmentsData.map((dept: any) => ({
          id: dept.department_id.toString(),
          name: dept.name,
          description: dept.description,
          adminId: dept.admin_id?.toString() || '',
          adminName: dept.admin_name || '',
          activePoints: dept.duty_points?.length || 0,
          totalShifts: dept.shifts?.length || 0,
          totalEmployees: dept.num_employees || 0,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        }));

        setDepartments(mappedDepartments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch department admins
  const fetchDepartmentAdmins = async () => {
    if (user?.role !== 'super_admin') return;

    // console.log("fetching departemnt admins")

    try {
      const response = await fetch(`${API_BASE_URL}/api/users?role=DepartmentAdmin`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {

        const data = await response.json();
        // console.log(data)
        setDepartmentAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching department admins:', error);
    }
  };

  // Data initialization
  useEffect(() => {
    if (user?.role === 'super_admin') {
      // Fetch real data for super admin
      fetchDepartments();
      fetchDepartmentAdmins();
      setLoading(false);
    } else {
      // Use mock data for other roles
      initializeMockData();
    }
  }, [user]);

  const initializeMockData = () => {
    const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'पुलिस आयुक्त, कमिश्नरेट, वाराणसी',
    description: 'Temple security and law enforcement coordination',
    adminId: '2',
    activePoints: 5,
    totalShifts: 4,
    totalEmployees: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-2',
    name: 'जिलाधिकारी, वाराणसी',
    description: 'District administration and coordination',
    adminId: '4',
    activePoints: 12,
    totalShifts: 2,
    totalEmployees: 36,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-3',
    name: 'नगर आयुक्त, नगर निगम, वाराणसी',
    description: 'Urban civic administration and sanitation',
    adminId: '5',
    activePoints: 8,
    totalShifts: 3,
    totalEmployees: 22,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-4',
    name: 'पुलिस उपमहानिरीक्षक, जोन, वाराणसी',
    description: 'Zonal police operations oversight',
    adminId: '6',
    activePoints: 7,
    totalShifts: 2,
    totalEmployees: 15,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-5',
    name: 'पुलिस उपमहानिरीक्षक, सुरक्षा एवं अभिसूचना, कमिश्नरेट, वाराणसी',
    description: 'Security and intelligence coordination',
    adminId: '7',
    activePoints: 9,
    totalShifts: 2,
    totalEmployees: 10,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-6',
    name: 'पुलिस उपमहानिरीक्षक, यातायात, कमिश्नरेट, वाराणसी',
    description: 'Traffic management and control',
    adminId: '8',
    activePoints: 6,
    totalShifts: 2,
    totalEmployees: 14,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-7',
    name: 'कमाण्डेन्ट, 95वीं बटालियन, सीआरपीएफ, वाराणसी',
    description: 'Central Reserve Police Force operations',
    adminId: '9',
    activePoints: 6,
    totalShifts: 3,
    totalEmployees: 18,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-8',
    name: 'कमाण्डेन्ट, 11वीं बटालियन, एनडीआरएफ, वाराणसी',
    description: 'National Disaster Response Force unit',
    adminId: '10',
    activePoints: 5,
    totalShifts: 2,
    totalEmployees: 20,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-9',
    name: 'कमाण्डेन्ट, 34वीं बटालियन, पीएसी, वाराणसी',
    description: 'Provincial Armed Constabulary operations',
    adminId: '11',
    activePoints: 7,
    totalShifts: 3,
    totalEmployees: 25,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-10',
    name: 'अपर जिलाधिकारी नगर, वाराणसी',
    description: 'Additional District Magistrate for city affairs',
    adminId: '12',
    activePoints: 6,
    totalShifts: 2,
    totalEmployees: 12,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-11',
    name: 'अपर जिलाधिकारी प्रोटोकॉल, वाराणसी',
    description: 'Protocol and VIP coordination',
    adminId: '13',
    activePoints: 4,
    totalShifts: 1,
    totalEmployees: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-12',
    name: 'मुख्य चिकित्सा अधिकारी, वाराणसी',
    description: 'Medical services and health management',
    adminId: '14',
    activePoints: 4,
    totalShifts: 2,
    totalEmployees: 12,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-13',
    name: 'अपर मुख्य कार्यपालक अधिकारी, श्री काशी विश्वनाथ मंदिर, वाराणसी',
    description: 'Temple administration and executive operations',
    adminId: '15',
    activePoints: 10,
    totalShifts: 3,
    totalEmployees: 28,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-14',
    name: 'डिप्टी कलेक्टर, श्री काशी विश्वनाथ मंदिर, वाराणसी',
    description: 'Deputy Collector for temple operations',
    adminId: '16',
    activePoints: 5,
    totalShifts: 1,
    totalEmployees: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-15',
    name: 'अधिशासी अभियन्ता, वाराणसी वृत्त, लोक निर्माण, वाराणसी',
    description: 'Executive Engineer, PWD Circle Varanasi',
    adminId: '17',
    activePoints: 8,
    totalShifts: 2,
    totalEmployees: 20,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-16',
    name: 'अधिशासी अभियन्ता, निर्माण खण्ड-1, लोक निर्माण, वाराणसी',
    description: 'Executive Engineer, Construction Division-1, PWD',
    adminId: '18',
    activePoints: 7,
    totalShifts: 2,
    totalEmployees: 15,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-17',
    name: 'अधिशासी अभियन्ता (विद्युत/यांत्रिक), निर्माण खण्ड-3, लोक निर्माण, वाराणसी',
    description: 'Executive Engineer, Electrical/Mechanical Division-3, PWD',
    adminId: '19',
    activePoints: 5,
    totalShifts: 1,
    totalEmployees: 8,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-18',
    name: 'अधिशासी अभियन्ता, पूर्वांचल विद्युत वितरण निगम लिमिटेड, वाराणसी',
    description: 'Executive Engineer, Purvanchal Vidyut Vitaran Nigam',
    adminId: '20',
    activePoints: 9,
    totalShifts: 2,
    totalEmployees: 18,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-19',
    name: 'सहायक पुलिस आयुक्त, सुरक्षा कमिश्नरेट, वाराणसी',
    description: 'Assistant Commissioner of Police, Security',
    adminId: '21',
    activePoints: 4,
    totalShifts: 1,
    totalEmployees: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept-20',
    name: 'सहायक पुलिस आयुक्त, दशाश्वमेध, कमिश्नरेट, वाराणसी',
    description: 'Assistant Commissioner of Police, Dashashwamedh area',
    adminId: '22',
    activePoints: 5,
    totalShifts: 1,
    totalEmployees: 8,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
    ];

      const mockDutyPoints: DutyPoint[] = [
        {
          id: 'YSK1',
          name: 'YSK1',
          description: 'Main security checkpoint',
          departmentId: 'dept-1',
          location: '28.5355° N, 83.0076° E',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'YSK2',
          name: 'YSK2',
          description: 'Secondary security point',
          departmentId: 'dept-1',
          location: '28.5356° N, 83.0077° E',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'YSK3',
          name: 'YSK3',
          description: 'Perimeter security',
          departmentId: 'dept-1',
          location: '28.5357° N, 83.0078° E',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'GATE4',
          name: 'Gate No. 4',
          description: 'Entry gate security',
          departmentId: 'dept-1',
          location: '28.5358° N, 83.0079° E',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'TRAYAM',
          name: 'Trayambkeswar Hall',
          description: 'Hall security monitoring',
          departmentId: 'dept-1',
          location: '28.5359° N, 83.0080° E',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock Employees
      const mockEmployees: Employee[] = [
        {
          id: 'emp-1',
          name: 'Ramesh Pathak',
          phone: '+91-9280124354',
          email: 'ramesh@skvt.org',
          departmentId: 'dept-1',
          designation: 'Security Officer',
          dutyPointId: 'YSK1',
          shiftId: 'shift-1',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'emp-2',
          name: 'Mahesh Kumar',
          phone: '+91-9280124355',
          email: 'suresh@skvt.org',
          departmentId: 'dept-1',
          designation: 'Security Guard',
          dutyPointId: 'YSK2',
          shiftId: 'shift-1',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'emp-3',
          name: 'Manoj Singh',
          phone: '+91-9280124356',
          email: 'manoj@skvt.org',
          departmentId: 'dept-1',
          designation: 'Senior Security Officer',
          dutyPointId: 'YSK3',
          shiftId: 'shift-2',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'emp-4',
          name: 'Rajesh Gupta',
          phone: '+91-9280124357',
          email: 'rajesh@skvt.org',
          departmentId: 'dept-1',
          designation: 'Security Guard',
          dutyPointId: 'GATE4',
          shiftId: 'shift-3',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'emp-5',
          name: 'Vikash Yadav',
          phone: '+91-9280124358',
          email: 'vikash@skvt.org',
          departmentId: 'dept-1',
          designation: 'Security Officer',
          dutyPointId: 'TRAYAM',
          shiftId: 'shift-4',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock Shifts
      const mockShifts: Shift[] = [
        {
          id: 'shift-1',
          name: '06:00 AM to 02:00 PM',
          startTime: '06:00',
          endTime: '14:00',
          departmentId: 'dept-1',
          dutyPointId: 'YSK1',
          inChargeId: 'emp-1',
          employeeIds: ['emp-1'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'shift-2',
          name: '02:00 PM to 10:00 PM',
          startTime: '14:00',
          endTime: '22:00',
          departmentId: 'dept-1',
          dutyPointId: 'YSK2',
          inChargeId: 'emp-3',
          employeeIds: ['emp-2', 'emp-3'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'shift-3',
          name: '10:00 PM to 06:00 AM',
          startTime: '22:00',
          endTime: '06:00',
          departmentId: 'dept-1',
          dutyPointId: 'YSK3',
          inChargeId: 'emp-4',
          employeeIds: ['emp-4'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'shift-4',
          name: '04:00 AM to 12:00 PM',
          startTime: '04:00',
          endTime: '12:00',
          departmentId: 'dept-1',
          dutyPointId: 'GATE4',
          inChargeId: 'emp-5',
          employeeIds: ['emp-5'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      setDepartments(mockDepartments);
      setDutyPoints(mockDutyPoints);
      setEmployees(mockEmployees);
      setShifts(mockShifts);
      
      // Mock Orders
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          title: 'Enhanced Security Protocol for Kartik Purnima Festival',
          description: 'Implement additional security measures including increased patrolling, bag checking at all entry points, and coordination with local police for crowd management during the festival period.',
          targetDepartments: ['dept-1', 'dept-2', 'dept-7', 'dept-9'],
          uploadedBy: '1',
          isUrgent: true,
          acknowledgments: {
            'dept-1': true,
            'dept-2': true,
            'dept-7': false,
            'dept-9': false
          },
          fileName: 'security-protocol-kartik-purnima.pdf',
          fileUrl: '#',
          createdAt: '2024-11-15T09:30:00.000Z',
        },
        {
          id: 'order-2',
          title: 'Medical Emergency Response Team Deployment',
          description: 'Deploy medical emergency response teams at strategic locations within the temple complex. Ensure ambulance access routes are clear and medical supplies are adequately stocked.',
          targetDepartments: ['dept-12', 'dept-2', 'dept-13'],
          uploadedBy: '1',
          isUrgent: false,
          acknowledgments: {
            'dept-12': true,
            'dept-2': true,
            'dept-13': true
          },
          fileName: 'medical-emergency-deployment.pdf',
          fileUrl: '#',
          createdAt: '2024-11-12T14:15:00.000Z',
        },
        {
          id: 'order-3',
          title: 'Traffic Management and Parking Arrangements',
          description: 'Implement comprehensive traffic management plan including designated parking areas, one-way traffic flow, and coordination with traffic police for smooth vehicular movement during peak hours.',
          targetDepartments: ['dept-6', 'dept-2', 'dept-3'],
          uploadedBy: '1',
          isUrgent: false,
          acknowledgments: {
            'dept-6': true,
            'dept-2': false,
            'dept-3': true
          },
          createdAt: '2024-11-10T11:45:00.000Z',
        },
        {
          id: 'order-4',
          title: 'Electrical Safety Inspection and Maintenance',
          description: 'Conduct thorough electrical safety inspection of all temple premises including lighting systems, sound equipment, and emergency power backup. Address any identified issues immediately.',
          targetDepartments: ['dept-18', 'dept-15', 'dept-13'],
          uploadedBy: '1',
          isUrgent: true,
          acknowledgments: {
            'dept-18': false,
            'dept-15': false,
            'dept-13': true
          },
          fileName: 'electrical-safety-inspection.pdf',
          fileUrl: '#',
          createdAt: '2024-11-08T16:20:00.000Z',
        },
        {
          id: 'order-5',
          title: 'Sanitation and Cleanliness Drive',
          description: 'Intensify sanitation efforts throughout the temple complex including regular cleaning of all facilities, waste management, and ensuring adequate supply of hand sanitizers and clean water.',
          targetDepartments: ['dept-3', 'dept-13', 'dept-2'],
          uploadedBy: '1',
          isUrgent: false,
          acknowledgments: {
            'dept-3': true,
            'dept-13': true,
            'dept-2': true
          },
          createdAt: '2024-11-05T08:30:00.000Z',
        },
        {
          id: 'order-6',
          title: 'VIP Protocol and Security Arrangements',
          description: 'Special security and protocol arrangements for upcoming VIP visits. Coordinate with protocol department and ensure all security clearances and arrangements are in place.',
          targetDepartments: ['dept-11', 'dept-1', 'dept-5', 'dept-19'],
          uploadedBy: '1',
          isUrgent: true,
          acknowledgments: {
            'dept-11': true,
            'dept-1': false,
            'dept-5': false,
            'dept-19': false
          },
          fileName: 'vip-protocol-arrangements.pdf',
          fileUrl: '#',
          createdAt: '2024-11-02T13:10:00.000Z',
        },
      ];
      
      setOrders(mockOrders);
      setChecklists([]);
      setLoading(false);
  };

  // Create department with existing admin
  const createDepartmentWithExistingAdmin = async (departmentData: {
    name: string;
    description: string;
    admin_id: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh departments list
        await fetchDepartments();
        await fetchDepartmentAdmins();
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Failed to create department' };
      }
    } catch (error) {
      console.error('Error creating department:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Create department with new admin
  const createDepartmentWithNewAdmin = async (departmentData: {
    name: string;
    description: string;
    admin_name: string;
    admin_email: string;
    admin_phone: string;
    admin_password: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh departments list
        await fetchDepartments();
        await fetchDepartmentAdmins();
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Failed to create department' };
      }
    } catch (error) {
      console.error('Error creating department:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const addDepartment = async (departmentData: any, adminData?: any) => {
    if (user?.role !== 'super_admin') {
      return { success: false, message: 'Unauthorized' };
    }

    if (adminData) {
      // Create department with new admin
      return await createDepartmentWithNewAdmin({
        name: departmentData.name,
        description: departmentData.description,
        admin_name: adminData.name,
        admin_email: adminData.email,
        admin_phone: adminData.phone,
        admin_password: adminData.password,
      });
    } else if (departmentData.admin_id) {
      // Create department with existing admin
      return await createDepartmentWithExistingAdmin({
        name: departmentData.name,
        description: departmentData.description,
        admin_id: parseInt(departmentData.admin_id),
      });
    }

    return { success: false, message: 'Invalid department data' };
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => 
      prev.map(dept => dept.id === id ? { ...dept, ...updates } : dept)
    );
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  return {
    departments,
    employees,
    shifts,
    dutyPoints,
    orders,
    checklists,
    loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    setEmployees,
    setShifts,
    setDutyPoints,
    setOrders,
    setChecklists,
    departmentAdmins,
    fetchDepartments,
    fetchDepartmentAdmins,
  };
};