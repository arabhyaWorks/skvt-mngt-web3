export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'department_admin' | 'control_room';
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  adminId: string;
  adminName?: string;
  activePoints: number;
  totalShifts: number;
  totalEmployees: number;
  status: 'active' | 'on_hold' | 'inactive';
  createdAt: string;
}

export interface DutyPoint {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  departmentId: string;
  dutyPointId: string;
  inChargeId: string;
  employeeIds: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  departmentId: string;
  designation: string;
  dutyPointId?: string;
  shiftId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  targetDepartments: string[];
  uploadedBy: string;
  isUrgent: boolean;
  acknowledgments: Record<string, boolean>;
  createdAt: string;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  targetDepartments: string[];
  dueDate: string;
  createdBy: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedBy: Record<string, boolean>;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isRequired: boolean;
  completed: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AppState {
  auth: AuthState;
  departments: Department[];
  employees: Employee[];
  shifts: Shift[];
  dutyPoints: DutyPoint[];
  orders: Order[];
  checklists: Checklist[];
  selectedDepartment: string | null;
}