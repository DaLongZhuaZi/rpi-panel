import type { Device } from '../types/device';

export const mockDevices: Device[] = [
  {
    id: 'door-lock-001',
    name: '主门门锁',
    type: 'door-lock',
    status: 'online',
    lastSeen: '2025-04-23 14:02:35',
    data: {
      battery: 85,
      lockStatus: 'locked',
      temperature: 24.5,
      openCount: 6
    }
  },
  {
    id: 'temp-sensor-001',
    name: '温湿度传感器',
    type: 'sensor',
    status: 'online',
    lastSeen: '2025-04-23 14:03:10',
    data: {
      temperature: 23.2,
      humidity: 45.8,
      battery: 92
    }
  },
  {
    id: 'light-001',
    name: '主灯控制器',
    type: 'light',
    status: 'online',
    lastSeen: '2025-04-23 14:01:22',
    data: {
      status: 'on',
      brightness: 80,
      autoMode: true
    }
  },
  {
    id: 'camera-001',
    name: '入口摄像头',
    type: 'camera',
    status: 'offline',
    lastSeen: '2025-04-23 11:45:18'
  }
]; 