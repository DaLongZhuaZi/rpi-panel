export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  data?: {
    [key: string]: any;
  };
} 