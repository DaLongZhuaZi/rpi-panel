/**
 * MQTT客户端模拟服务
 * 在Windows环境下模拟与MQTT服务器的通信
 */

import { EventEmitter } from 'events';

// 定义消息类型
export interface MqttMessage {
  topic: string;
  payload: any;
  qos: number;
  retain: boolean;
  timestamp: number;
}

// 定义连接选项
export interface MqttConnectionOptions {
  clientId: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol?: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  keepalive?: number;
  reconnectPeriod?: number;
}

// 默认连接选项
const DEFAULT_OPTIONS: MqttConnectionOptions = {
  clientId: `rpi-panel-${Math.floor(Math.random() * 10000)}`,
  host: 'localhost',
  port: 1883,
  protocol: 'mqtt',
  keepalive: 60,
  reconnectPeriod: 5000
};

// 模拟MQTT客户端
export class MockMqttClient extends EventEmitter {
  private options: MqttConnectionOptions;
  private connected: boolean = false;
  private subscriptions: Map<string, (topic: string, message: any) => void> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private mockDevices: any[] = [];
  
  constructor(options: Partial<MqttConnectionOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.setupMockDevices();
  }

  // 设置模拟设备
  private setupMockDevices() {
    this.mockDevices = [
      {
        id: 'door-lock-001',
        type: 'door-lock',
        status: 'online',
        data: {
          locked: true,
          battery: 85,
          lastActivity: new Date().toISOString()
        }
      },
      {
        id: 'temp-sensor-001',
        type: 'sensor',
        status: 'online',
        data: {
          temperature: 23.5,
          humidity: 45,
          battery: 92,
          lastActivity: new Date().toISOString()
        }
      }
    ];
  }

  // 连接到MQTT服务器
  public connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log(`[MQTT] 连接到服务器: ${this.options.host}:${this.options.port}`);
      
      // 模拟连接延迟
      setTimeout(() => {
        this.connected = true;
        this.emit('connect');
        console.log('[MQTT] 连接成功');
        resolve();
        
        // 开始模拟设备数据更新
        this.startMockUpdates();
      }, 1000);
    });
  }

  // 断开连接
  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.connected) {
        resolve();
        return;
      }
      
      console.log('[MQTT] 断开连接');
      
      // 停止更新
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // 模拟断开延迟
      setTimeout(() => {
        this.connected = false;
        this.emit('disconnect');
        resolve();
      }, 500);
    });
  }

  // 订阅主题
  public subscribe(topic: string, callback: (topic: string, message: any) => void): void {
    if (!this.connected) {
      throw new Error('MQTT客户端未连接');
    }
    
    console.log(`[MQTT] 订阅主题: ${topic}`);
    this.subscriptions.set(topic, callback);
    this.emit('subscribe', { topic });
  }

  // 取消订阅
  public unsubscribe(topic: string): void {
    if (!this.connected) {
      throw new Error('MQTT客户端未连接');
    }
    
    console.log(`[MQTT] 取消订阅主题: ${topic}`);
    this.subscriptions.delete(topic);
    this.emit('unsubscribe', { topic });
  }

  // 发布消息
  public publish(topic: string, payload: any, options: { qos?: number; retain?: boolean } = {}): void {
    if (!this.connected) {
      throw new Error('MQTT客户端未连接');
    }
    
    const message: MqttMessage = {
      topic,
      payload,
      qos: options.qos || 0,
      retain: options.retain || false,
      timestamp: Date.now()
    };
    
    console.log(`[MQTT] 发布消息到主题: ${topic}`, payload);
    
    // 模拟消息处理延迟
    setTimeout(() => {
      this.emit('message', topic, payload);
      
      // 处理模拟设备的命令
      if (topic.startsWith('cmd/')) {
        this.handleDeviceCommand(topic, payload);
      }
    }, 200);
  }

  // 处理设备命令
  private handleDeviceCommand(topic: string, payload: any): void {
    const deviceId = topic.split('/')[1];
    const device = this.mockDevices.find(d => d.id === deviceId);
    
    if (!device) {
      console.log(`[MQTT] 未找到设备: ${deviceId}`);
      return;
    }
    
    console.log(`[MQTT] 处理设备命令: ${deviceId}`, payload);
    
    // 更新设备状态
    if (device.type === 'door-lock' && payload.action === 'unlock') {
      device.data.locked = false;
      device.data.lastActivity = new Date().toISOString();
      
      // 发布状态更新
      this.publishDeviceStatus(device);
      
      // 模拟门自动锁定
      setTimeout(() => {
        device.data.locked = true;
        device.data.lastActivity = new Date().toISOString();
        this.publishDeviceStatus(device);
      }, 5000);
    }
  }

  // 发布设备状态
  private publishDeviceStatus(device: any): void {
    const topic = `status/${device.id}`;
    const payload = {
      id: device.id,
      type: device.type,
      status: device.status,
      data: device.data,
      timestamp: Date.now()
    };
    
    // 通知订阅者
    for (const [subTopic, callback] of this.subscriptions.entries()) {
      if (topic === subTopic || subTopic === 'status/#') {
        callback(topic, payload);
      }
    }
    
    this.emit('publish', topic, payload);
  }

  // 开始模拟设备数据更新
  private startMockUpdates(): void {
    // 每10秒更新一次温度传感器数据
    setInterval(() => {
      const tempSensor = this.mockDevices.find(d => d.id === 'temp-sensor-001');
      if (tempSensor && tempSensor.status === 'online') {
        // 模拟温度变化 (±0.5°C)
        tempSensor.data.temperature += (Math.random() - 0.5);
        tempSensor.data.temperature = parseFloat(tempSensor.data.temperature.toFixed(1));
        
        // 模拟湿度变化 (±1%)
        tempSensor.data.humidity += Math.floor(Math.random() * 3) - 1;
        tempSensor.data.humidity = Math.max(30, Math.min(70, tempSensor.data.humidity));
        
        // 更新时间戳
        tempSensor.data.lastActivity = new Date().toISOString();
        
        // 发布更新
        this.publishDeviceStatus(tempSensor);
      }
    }, 10000);
    
    // 每小时减少电池电量
    setInterval(() => {
      this.mockDevices.forEach(device => {
        if (device.status === 'online' && device.data.battery) {
          device.data.battery -= 1;
          if (device.data.battery < 10) {
            console.log(`[MQTT] 设备电池电量低: ${device.id} (${device.data.battery}%)`);
          }
          this.publishDeviceStatus(device);
        }
      });
    }, 3600000); // 1小时
  }

  // 检查是否已连接
  public isConnected(): boolean {
    return this.connected;
  }

  // 获取连接选项
  public getOptions(): MqttConnectionOptions {
    return this.options;
  }
}

// 默认导出单例实例
const mqttClient = new MockMqttClient();
export default mqttClient;

// 实用函数: 订阅所有设备状态
export function subscribeToAllDevices(callback: (deviceId: string, status: any) => void): void {
  mqttClient.subscribe('status/#', (topic, message) => {
    const deviceId = topic.split('/')[1];
    callback(deviceId, message);
  });
}

// 实用函数: 发送开门命令
export function sendUnlockCommand(deviceId: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!mqttClient.isConnected()) {
        console.log('MQTT客户端未连接，尝试连接...');
        try {
          await mqttClient.connect();
          console.log('MQTT客户端连接成功');
        } catch (connectError) {
          console.error('MQTT客户端连接失败:', connectError);
          throw new Error('MQTT客户端未连接');
        }
      }
      
      mqttClient.publish(`cmd/${deviceId}`, {
        action: 'unlock',
        timestamp: Date.now()
      });
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
} 