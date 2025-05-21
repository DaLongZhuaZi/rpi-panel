/**
 * API服务模拟层
 * 用于模拟与后端API的交互
 */

import { doorController } from '../hardware/door-control';

// API端点地址（实际开发中替换为真实API地址）
const API_BASE_URL = 'http://localhost:8000/api';

// 预约状态
export enum ReservationStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 预约信息
export interface Reservation {
  id: number;
  labId: number;
  labName: string;
  userId: number;
  username: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  purpose?: string;
  createdAt: string;
}

// 实验室信息
export interface Lab {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  isOpen: boolean;
  deviceCount: number;
  imageUrl?: string;
}

// 用户信息
export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  avatar?: string;
}

// 访问记录
export interface AccessLog {
  id: number;
  labId: number;
  labName: string;
  userId: number;
  username: string;
  accessTime: string;
  method: string;
  success: boolean;
  deviceId?: string;
}

// 模拟数据
const mockReservations: Reservation[] = [
  {
    id: 1,
    labId: 1,
    labName: '电子工程实验室',
    userId: 101,
    username: '张三',
    startTime: '2025-04-23T10:00:00',
    endTime: '2025-04-23T12:00:00',
    status: ReservationStatus.ACTIVE,
    purpose: '电路设计实验',
    createdAt: '2025-04-22T14:30:00'
  },
  {
    id: 2,
    labId: 2,
    labName: '机器人实验室',
    userId: 102,
    username: '李四',
    startTime: '2025-04-23T14:00:00',
    endTime: '2025-04-23T16:00:00',
    status: ReservationStatus.UPCOMING,
    purpose: '机器人编程',
    createdAt: '2025-04-22T15:15:00'
  },
  {
    id: 3,
    labId: 3,
    labName: '物联网实验室',
    userId: 103,
    username: '王五',
    startTime: '2025-04-24T09:00:00',
    endTime: '2025-04-24T11:00:00',
    status: ReservationStatus.UPCOMING,
    purpose: 'IoT设备测试',
    createdAt: '2025-04-22T16:20:00'
  },
  {
    id: 4,
    labId: 1,
    labName: '电子工程实验室',
    userId: 104,
    username: '赵六',
    startTime: '2025-04-22T14:00:00',
    endTime: '2025-04-22T16:00:00',
    status: ReservationStatus.COMPLETED,
    createdAt: '2025-04-21T10:30:00'
  }
];

const mockLabs: Lab[] = [
  {
    id: 1,
    name: '电子工程实验室',
    description: '用于电子电路设计与测试的实验室',
    capacity: 30,
    isOpen: true,
    deviceCount: 12,
    imageUrl: '/images/labs/electronics.jpg'
  },
  {
    id: 2,
    name: '机器人实验室',
    description: '用于机器人编程与控制的实验室',
    capacity: 20,
    isOpen: true,
    deviceCount: 8,
    imageUrl: '/images/labs/robotics.jpg'
  },
  {
    id: 3,
    name: '物联网实验室',
    description: '用于IoT设备开发与测试的实验室',
    capacity: 25,
    isOpen: true,
    deviceCount: 15,
    imageUrl: '/images/labs/iot.jpg'
  },
  {
    id: 4,
    name: '计算机网络实验室',
    description: '用于网络配置与测试的实验室',
    capacity: 40,
    isOpen: false,
    deviceCount: 20,
    imageUrl: '/images/labs/network.jpg'
  }
];

const mockUsers: User[] = [
  {
    id: 101,
    username: 'zhangsan',
    fullName: '张三',
    email: 'zhangsan@example.com',
    role: 'student',
    avatar: '/images/avatars/user1.jpg'
  },
  {
    id: 102,
    username: 'lisi',
    fullName: '李四',
    email: 'lisi@example.com',
    role: 'student',
    avatar: '/images/avatars/user2.jpg'
  },
  {
    id: 103,
    username: 'wangwu',
    fullName: '王五',
    email: 'wangwu@example.com',
    role: 'teacher',
    avatar: '/images/avatars/user3.jpg'
  },
  {
    id: 104,
    username: 'zhaoliu',
    fullName: '赵六',
    email: 'zhaoliu@example.com',
    role: 'student',
    avatar: '/images/avatars/user4.jpg'
  },
  {
    id: 1,
    username: 'admin',
    fullName: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    avatar: '/images/avatars/admin.jpg'
  }
];

const mockAccessLogs: AccessLog[] = [
  {
    id: 1,
    labId: 1,
    labName: '电子工程实验室',
    userId: 101,
    username: '张三',
    accessTime: '2025-04-23T09:58:12',
    method: '密码',
    success: true,
    deviceId: 'door-lock-001'
  },
  {
    id: 2,
    labId: 2,
    labName: '机器人实验室',
    userId: 103,
    username: '王五',
    accessTime: '2025-04-23T08:45:23',
    method: '指纹',
    success: true,
    deviceId: 'door-lock-002'
  },
  {
    id: 3,
    labId: 1,
    labName: '电子工程实验室',
    userId: 0,
    username: '未知',
    accessTime: '2025-04-23T08:30:11',
    method: '密码',
    success: false,
    deviceId: 'door-lock-001'
  },
  {
    id: 4,
    labId: 3,
    labName: '物联网实验室',
    userId: 1,
    username: '管理员',
    accessTime: '2025-04-22T17:12:05',
    method: '远程',
    success: true,
    deviceId: 'door-lock-003'
  }
];

// API类
class Api {
  // 获取所有预约
  public async getReservations(): Promise<Reservation[]> {
    // 模拟API请求延迟
    await this.delay(800);
    return [...mockReservations];
  }
  
  // 获取今天的预约
  public async getTodayReservations(): Promise<Reservation[]> {
    await this.delay(600);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return mockReservations.filter(res => {
      const startTime = new Date(res.startTime);
      return startTime >= today && startTime < tomorrow;
    });
  }
  
  // 获取特定实验室的预约
  public async getLabReservations(labId: number): Promise<Reservation[]> {
    await this.delay(500);
    return mockReservations.filter(res => res.labId === labId);
  }
  
  // 获取所有实验室
  public async getLabs(): Promise<Lab[]> {
    await this.delay(700);
    return [...mockLabs];
  }
  
  // 获取特定实验室
  public async getLab(labId: number): Promise<Lab | null> {
    await this.delay(400);
    const lab = mockLabs.find(lab => lab.id === labId);
    return lab || null;
  }
  
  // 获取访问记录
  public async getAccessLogs(limit: number = 10): Promise<AccessLog[]> {
    await this.delay(600);
    // 按时间倒序排序并限制数量
    return [...mockAccessLogs]
      .sort((a, b) => new Date(b.accessTime).getTime() - new Date(a.accessTime).getTime())
      .slice(0, limit);
  }
  
  // 添加访问记录
  public async addAccessLog(log: Omit<AccessLog, 'id'>): Promise<AccessLog> {
    await this.delay(300);
    
    const newLog: AccessLog = {
      id: mockAccessLogs.length + 1,
      ...log
    };
    
    mockAccessLogs.push(newLog);
    return newLog;
  }
  
  // 验证用户密码
  public async verifyPassword(username: string, password: string): Promise<User | null> {
    await this.delay(1000);
    
    // 模拟密码验证
    if (username === 'admin' && password === '123456') {
      return mockUsers.find(user => user.username === 'admin') || null;
    }
    
    if (username === 'zhangsan' && password === '111111') {
      return mockUsers.find(user => user.username === 'zhangsan') || null;
    }
    
    // 使用门锁控制模块验证密码
    try {
      const authResult = await doorController.unlockWithPassword(password, username);
      if (authResult.success) {
        // 查找匹配的用户
        const user = mockUsers.find(u => u.username === username);
        return user || null;
      }
    } catch (error) {
      console.error('门锁验证失败:', error);
    }
    
    return null;
  }
  
  // 获取实验室统计信息
  public async getLabsStatistics(): Promise<{
    total: number;
    open: number;
    closed: number;
    maintenance: number;
    utilizationRate: number;
  }> {
    await this.delay(500);
    
    const total = mockLabs.length;
    const open = mockLabs.filter(lab => lab.isOpen).length;
    const closed = total - open;
    const maintenance = 0; // 假设没有维护中的实验室
    
    // 计算使用率：当前有预约的实验室数量 / 开放的实验室数量
    const now = new Date();
    const activeReservationsLabIds = new Set(
      mockReservations
        .filter(res => {
          const startTime = new Date(res.startTime);
          const endTime = new Date(res.endTime);
          return now >= startTime && now <= endTime;
        })
        .map(res => res.labId)
    );
    
    const utilizationRate = open > 0 ? activeReservationsLabIds.size / open : 0;
    
    return {
      total,
      open,
      closed,
      maintenance,
      utilizationRate
    };
  }
  
  // 获取周统计信息
  public async getWeekStatistics(): Promise<{
    totalReservations: number;
    totalHours: number;
    mostActiveLabId: number;
    mostActiveUser: number;
  }> {
    await this.delay(600);
    
    // 获取本周开始日期
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 过滤本周的预约
    const weekReservations = mockReservations.filter(res => {
      const startTime = new Date(res.startTime);
      return startTime >= startOfWeek;
    });
    
    // 计算总预约时长（小时）
    let totalHours = 0;
    weekReservations.forEach(res => {
      const startTime = new Date(res.startTime);
      const endTime = new Date(res.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    });
    
    // 找出最活跃的实验室
    const labCounts: Record<number, number> = {};
    weekReservations.forEach(res => {
      labCounts[res.labId] = (labCounts[res.labId] || 0) + 1;
    });
    
    let mostActiveLabId = 0;
    let maxLabCount = 0;
    Object.entries(labCounts).forEach(([labId, count]) => {
      if (count > maxLabCount) {
        maxLabCount = count;
        mostActiveLabId = parseInt(labId);
      }
    });
    
    // 找出最活跃的用户
    const userCounts: Record<number, number> = {};
    weekReservations.forEach(res => {
      userCounts[res.userId] = (userCounts[res.userId] || 0) + 1;
    });
    
    let mostActiveUser = 0;
    let maxUserCount = 0;
    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > maxUserCount) {
        maxUserCount = count;
        mostActiveUser = parseInt(userId);
      }
    });
    
    return {
      totalReservations: weekReservations.length,
      totalHours: Math.round(totalHours),
      mostActiveLabId,
      mostActiveUser
    };
  }
  
  // 模拟延迟
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const api = new Api();

export default api; 