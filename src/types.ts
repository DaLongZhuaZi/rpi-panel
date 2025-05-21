export interface Lab {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment: string;
  status: 'active' | 'maintenance' | 'inactive';
  lockId?: number;
  lockName?: string;
}

export interface Lock {
  id: number;
  name: string;
  deviceId: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel: number;
  isLocked: boolean;
} 