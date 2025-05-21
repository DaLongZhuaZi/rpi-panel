import { Lab, Lock } from './types';

export const mockLabs: Lab[] = [
  { id: 1, name: '物理实验室 A', location: '教学楼A区 201', capacity: 30, equipment: '光学器材、测量仪', status: 'active', lockId: 1, lockName: '门锁-A201' },
  { id: 2, name: '化学实验室 B', location: '教学楼B区 102', capacity: 25, equipment: '化学试剂、燃烧器、通风柜', status: 'active', lockId: 2, lockName: '门锁-B102' },
  { id: 3, name: '生物实验室 C', location: '教学楼A区 305', capacity: 35, equipment: '显微镜、培养皿', status: 'maintenance' },
  { id: 4, name: '物理实验室 B', location: '教学楼C区 203', capacity: 40, equipment: '电子设备、测量工具', status: 'active', lockId: 3, lockName: '门锁-C203' },
  { id: 5, name: '计算机实验室', location: '教学楼D区 401', capacity: 50, equipment: '计算机40台、投影仪', status: 'active' },
  { id: 6, name: '电子实验室', location: '教学楼B区 305', capacity: 30, equipment: '电子元器件、焊接设备', status: 'inactive' },
];

export const mockLocks: Lock[] = [
  { id: 1, name: '门锁-A201', deviceId: 'LOCK-001', status: 'online', batteryLevel: 85, isLocked: true },
  { id: 2, name: '门锁-B102', deviceId: 'LOCK-002', status: 'online', batteryLevel: 90, isLocked: true },
  { id: 3, name: '门锁-C203', deviceId: 'LOCK-003', status: 'online', batteryLevel: 75, isLocked: false },
  { id: 4, name: '门锁-D101', deviceId: 'LOCK-004', status: 'offline', batteryLevel: 60, isLocked: true },
  { id: 5, name: '门锁-E205', deviceId: 'LOCK-005', status: 'online', batteryLevel: 95, isLocked: true },
]; 