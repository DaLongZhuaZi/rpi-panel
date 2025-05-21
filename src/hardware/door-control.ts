/**
 * 门锁控制模拟服务
 * 用于模拟与门锁硬件的交互
 */

import { EventEmitter } from 'events';
import mqttClient, { sendUnlockCommand } from './mqtt-client';
import mqttService from '../services/mqtt-service';

// 门锁状态
export enum DoorStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  OPEN = 'open',
  ERROR = 'error'
}

// 认证方式
export enum AuthMethod {
  PASSWORD = 'password',
  FINGERPRINT = 'fingerprint',
  BLUETOOTH = 'bluetooth',
  REMOTE = 'remote'
}

// 认证结果
export interface AuthResult {
  success: boolean;
  method: AuthMethod;
  timestamp: number;
  userId?: string;
  message?: string;
}

// 门锁信息
export interface DoorInfo {
  deviceId: string;
  status: DoorStatus;
  battery: number;
  lastActivity: Date;
  openCount: number;
}

// 密码验证设置
interface PasswordSettings {
  enabled: boolean;
  attempts: number;
  maxAttempts: number;
  lockoutTime: number; // 毫秒
}

// 指纹设置
interface FingerprintSettings {
  enabled: boolean;
  enrolledFingerprints: number;
  maxFingerprints: number;
}

// 解锁结果
export interface UnlockResult {
  success: boolean;
  message: string;
  error?: string;
}

// 门锁控制器
export class DoorController extends EventEmitter {
  private deviceId: string;
  private currentStatus: DoorStatus = DoorStatus.LOCKED;
  private battery: number = 100;
  private openCount: number = 0;
  private lastActivity: Date = new Date();
  private autoLockTimeout: NodeJS.Timeout | null = null;
  private autoLockDelay: number = 5000; // 毫秒
  private passwordSettings: PasswordSettings = {
    enabled: true,
    attempts: 0,
    maxAttempts: 5,
    lockoutTime: 300000 // 5分钟
  };
  private lockoutUntil: Date | null = null;
  private passwords: Map<string, string> = new Map();
  
  constructor(deviceId: string = 'door-lock-001') {
    super();
    this.deviceId = deviceId;
    
    // 初始化示例密码
    this.passwords.set('admin', '123456');
    this.passwords.set('user1', '111111');
    
    // 监听MQTT状态更新
    this.setupMqttListeners();
  }
  
  // 设置MQTT监听
  private setupMqttListeners(): void {
    // 确保MQTT客户端已连接
    if (!mqttService.isConnected()) {
      // 等待MQTT服务初始化完成
      console.log('等待MQTT服务初始化...');
      return;
    }
    
    try {
      // 监听设备状态更新
      mqttClient.subscribe(`status/${this.deviceId}`, (topic, message) => {
        if (message && message.data) {
          if ('locked' in message.data) {
            this.currentStatus = message.data.locked ? DoorStatus.LOCKED : DoorStatus.UNLOCKED;
          }
          if ('battery' in message.data) {
            this.battery = message.data.battery;
          }
          if ('lastActivity' in message.data) {
            this.lastActivity = new Date(message.data.lastActivity);
          }
          
          this.emit('status-update', this.getDoorInfo());
        }
      });
      
      console.log(`[门锁] 已订阅MQTT主题: status/${this.deviceId}`);
    } catch (error) {
      console.error('[门锁] 设置MQTT监听失败:', error);
    }
  }
  
  // 获取门锁信息
  public getDoorInfo(): DoorInfo {
    return {
      deviceId: this.deviceId,
      status: this.currentStatus,
      battery: this.battery,
      lastActivity: this.lastActivity,
      openCount: this.openCount
    };
  }
  
  // 使用密码解锁
  public async unlockWithPassword(username: string, password: string): Promise<UnlockResult> {
    // 检查是否被锁定
    if (this.isLockedOut()) {
      const remainingTime = this.getRemainingLockoutTime();
      return {
        success: false,
        message: `账户已锁定，请在${Math.ceil(remainingTime / 60000)}分钟后重试`,
        error: 'ACCOUNT_LOCKED'
      };
    }
    
    // 验证密码
    if (!this.passwords.has(username) || this.passwords.get(username) !== password) {
      this.passwordSettings.attempts++;
      
      // 检查是否达到最大尝试次数
      if (this.passwordSettings.attempts >= this.passwordSettings.maxAttempts) {
        this.lockoutUntil = new Date(Date.now() + this.passwordSettings.lockoutTime);
        this.passwordSettings.attempts = 0;
        
        return {
          success: false,
          message: `密码错误，账户已锁定${this.passwordSettings.lockoutTime / 60000}分钟`,
          error: 'MAX_ATTEMPTS_REACHED'
        };
      }
      
      return {
        success: false,
        message: `密码错误，还剩${this.passwordSettings.maxAttempts - this.passwordSettings.attempts}次尝试机会`,
        error: 'INVALID_PASSWORD'
      };
    }
    
    // 密码正确，重置尝试次数
    this.passwordSettings.attempts = 0;
    
    try {
      // 解锁门
      await this.unlock();
      
      return {
        success: true,
        message: '门已解锁'
      };
    } catch (error) {
      return {
        success: false,
        message: '解锁失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // 使用指纹解锁
  public async unlockWithFingerprint(fingerprintId: number): Promise<UnlockResult> {
    // 模拟指纹验证
    const validFingerprints = [1, 2, 3]; // 假设这些是有效的指纹ID
    
    if (!validFingerprints.includes(fingerprintId)) {
      return {
        success: false,
        message: '指纹不匹配',
        error: 'INVALID_FINGERPRINT'
      };
    }
    
    try {
      // 解锁门
      await this.unlock();
      
      return {
        success: true,
        message: '门已解锁'
      };
    } catch (error) {
      return {
        success: false,
        message: '解锁失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // 使用蓝牙解锁
  public async unlockWithBluetooth(deviceId: string): Promise<UnlockResult> {
    // 模拟蓝牙验证
    const validDevices = ['bt-device-001', 'bt-device-002']; // 假设这些是有效的蓝牙设备ID
    
    if (!validDevices.includes(deviceId)) {
      return {
        success: false,
        message: '未授权的蓝牙设备',
        error: 'UNAUTHORIZED_DEVICE'
      };
    }
    
    try {
      // 解锁门
      await this.unlock();
      
      return {
        success: true,
        message: '门已解锁'
      };
    } catch (error) {
      return {
        success: false,
        message: '解锁失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // 远程解锁
  public async remoteUnlock(userId: string): Promise<UnlockResult> {
    try {
      console.log(`[门锁] 用户 ${userId} 请求远程解锁`);
      
      // 解锁门
      await this.unlock();
      
      return {
        success: true,
        message: '门已远程解锁'
      };
    } catch (error) {
      return {
        success: false,
        message: '远程解锁失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // 检查是否被锁定
  private isLockedOut(): boolean {
    if (!this.lockoutUntil) {
      return false;
    }
    return this.lockoutUntil.getTime() > Date.now();
  }
  
  // 获取剩余锁定时间(毫秒)
  private getRemainingLockoutTime(): number {
    if (!this.lockoutUntil) {
      return 0;
    }
    const remaining = this.lockoutUntil.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }
  
  // 解锁门
  private async unlock(): Promise<void> {
    try {
      if (this.currentStatus === DoorStatus.UNLOCKED) {
        return;
      }
      
      // 确保MQTT客户端已连接
      if (!mqttService.isConnected()) {
        await mqttService.initialize();
      }
      
      // 通过MQTT发送开门命令
      await sendUnlockCommand(this.deviceId);
      
      // 更新状态
      this.currentStatus = DoorStatus.UNLOCKED;
      this.lastActivity = new Date();
      this.openCount++;
      
      // 发出事件
      this.emit('door-unlocked', {
        deviceId: this.deviceId,
        timestamp: this.lastActivity
      });
      
      // 设置自动上锁计时器
      this.setupAutoLock();
      
      console.log(`[门锁] 门已解锁: ${this.deviceId}`);
    } catch (error) {
      console.error('[门锁] 解锁门时出错:', error);
      this.currentStatus = DoorStatus.ERROR;
      this.emit('error', {
        deviceId: this.deviceId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  // 锁门
  public async lock(): Promise<void> {
    try {
      if (this.currentStatus === DoorStatus.LOCKED) {
        return;
      }
      
      // 取消自动锁定计时器
      if (this.autoLockTimeout) {
        clearTimeout(this.autoLockTimeout);
        this.autoLockTimeout = null;
      }
      
      // 更新状态
      this.currentStatus = DoorStatus.LOCKED;
      this.lastActivity = new Date();
      
      // 发出事件
      this.emit('door-locked', {
        deviceId: this.deviceId,
        timestamp: this.lastActivity
      });
      
      console.log(`[门锁] 门已锁定: ${this.deviceId}`);
    } catch (error) {
      console.error('[门锁] 锁门时出错:', error);
      this.currentStatus = DoorStatus.ERROR;
      this.emit('error', {
        deviceId: this.deviceId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  // 设置自动上锁
  private setupAutoLock(): void {
    if (this.autoLockTimeout) {
      clearTimeout(this.autoLockTimeout);
    }
    
    this.autoLockTimeout = setTimeout(() => {
      console.log(`[门锁] 自动锁定: ${this.deviceId}`);
      this.lock().catch(err => {
        console.error('[门锁] 自动锁定时出错:', err);
      });
    }, this.autoLockDelay);
  }
  
  // 设置自动锁定延迟
  public setAutoLockDelay(delayMs: number): void {
    this.autoLockDelay = delayMs;
    console.log(`[门锁] 自动锁定延迟已设置为 ${delayMs}ms`);
  }
  
  // 添加密码
  public addPassword(username: string, password: string): void {
    this.passwords.set(username, password);
    console.log(`[门锁] 已添加密码: ${username}`);
  }
  
  // 删除密码
  public removePassword(username: string): boolean {
    const result = this.passwords.delete(username);
    if (result) {
      console.log(`[门锁] 已删除密码: ${username}`);
    }
    return result;
  }
}

// 导出单例实例
export const doorController = new DoorController();

export default doorController; 