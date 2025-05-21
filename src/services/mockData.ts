// 统一管理所有模拟数据

export interface MockReservation {
  id: number;
  labName: string;
  status: 'available' | 'booked' | 'in-use' | 'maintenance';
  startTime?: string;
  endTime?: string;
  user?: string;
}

export interface MockLock {
  id: number;
  name: string;
  status: 'online' | 'offline';
  isLocked: boolean;
  batteryLevel: number;
  labName?: string;
}

export const mockReservations: MockReservation[] = [
  { id: 1, labName: '物理实验室 A', status: 'available' },
  { id: 2, labName: '化学实验室 B', status: 'booked', startTime: '14:00', endTime: '16:00', user: '李老师' },
  { id: 3, labName: '生物实验室 C', status: 'in-use', startTime: '13:00', endTime: '15:30', user: '王老师' },
  { id: 4, labName: '物理实验室 B', status: 'maintenance' },
  { id: 5, labName: '计算机实验室', status: 'available' },
  { id: 6, labName: '电子实验室', status: 'booked', startTime: '16:00', endTime: '18:00', user: '张老师' },
];

export const mockLocks: MockLock[] = [
  { id: 1, name: '门锁-A201', status: 'online', isLocked: true, batteryLevel: 85, labName: '物理实验室 A' },
  { id: 2, name: '门锁-B102', status: 'online', isLocked: true, batteryLevel: 90, labName: '化学实验室 B' },
  { id: 3, name: '门锁-C203', status: 'online', isLocked: false, batteryLevel: 75, labName: '物理实验室 B' },
  { id: 4, name: '门锁-D101', status: 'offline', isLocked: true, batteryLevel: 60 },
  { id: 5, name: '门锁-E205', status: 'online', isLocked: true, batteryLevel: 95 },
]; 