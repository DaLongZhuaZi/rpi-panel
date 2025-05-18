/**
 * 门锁控制模拟服务
 * 用于模拟与门锁硬件的交互
 */

import { EventEmitter } from 'events';
import mqttClient, { sendUnlockCommand } from './mqtt-client';

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
    if (!mqttClient.isConnected()) {
      mqttClient.connect().catch(err => {
        console.error('MQTT连接失败:', err);
      });
    }
    
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
  
  // 使用密码验证并开门
  public async unlockWithPassword(password: string): Promise<AuthResult> {
    // 检查是否被锁定
    if (this.isLockedOut()) {
      const remainingTime = this.getRemainingLockoutTime();
      return {
        success: false,
        method: AuthMethod.PASSWORD,
        timestamp: Date.now(),
        message: `密码输入错误次数过多，请在${Math.ceil(remainingTime / 60000)}分钟后重试`
      };
    }
    
    // 验证密码
    let validPassword = false;
    for (const [userId, validPwd] of this.passwords.entries()) {
      if (password === validPwd) {
        validPassword = true;
        
        // 重置错误尝试次数
        this.passwordSettings.attempts = 0;
        
        // 解锁门
        await this.unlock();
        
        return {
          success: true,
          method: AuthMethod.PASSWORD,
          timestamp: Date.now(),
          userId,
          message: '验证成功，门已开启'
        };
      }
    }
    
    // 密码错误，增加错误尝试次数
    this.passwordSettings.attempts++;
    
    // 检查是否需要锁定
    if (this.passwordSettings.attempts >= this.passwordSettings.maxAttempts) {
      this.lockoutUntil = new Date(Date.now() + this.passwordSettings.lockoutTime);
      console.log(`[门锁] 密码错误次数过多，锁定至 ${this.lockoutUntil.toLocaleString()}`);
    }
    
    return {
      success: false,
      method: AuthMethod.PASSWORD,
      timestamp: Date.now(),
      message: `密码错误，还有${this.passwordSettings.maxAttempts - this.passwordSettings.attempts}次尝试机会`
    };
  }
  
  // 使用指纹验证并开门
  public async unlockWithFingerprint(): Promise<AuthResult> {
    // 模拟指纹验证延迟和成功率
    return new Promise(resolve => {
      setTimeout(() => {
        // 80%的成功率
        const success = Math.random() < 0.8;
        
        if (success) {
          this.unlock().then(() => {
            resolve({
              success: true,
              method: AuthMethod.FINGERPRINT,
              timestamp: Date.now(),
              userId: 'fingerprint-user',
              message: '指纹验证成功，门已开启'
            });
          });
        } else {
          resolve({
            success: false,
            method: AuthMethod.FINGERPRINT,
            timestamp: Date.now(),
            message: '指纹验证失败，请重试'
          });
        }
      }, 1500);
    });
  }
  
  // 使用蓝牙验证并开门
  public async unlockWithBluetooth(): Promise<AuthResult> {
    // 模拟蓝牙验证延迟和成功率
    return new Promise(resolve => {
      setTimeout(() => {
        // 90%的成功率
        const success = Math.random() < 0.9;
        
        if (success) {
          this.unlock().then(() => {
            resolve({
              success: true,
              method: AuthMethod.BLUETOOTH,
              timestamp: Date.now(),
              userId: 'bluetooth-user',
              message: '蓝牙验证成功，门已开启'
            });
          });
        } else {
          resolve({
            success: false,
            method: AuthMethod.BLUETOOTH,
            timestamp: Date.now(),
            message: '蓝牙验证失败，请重试'
          });
        }
      }, 1000);
    });
  }
  
  // 远程开门
  public async unlockRemotely(adminUserId: string = 'admin'): Promise<AuthResult> {
    try {
      await this.unlock();
      
      return {
        success: true,
        method: AuthMethod.REMOTE,
        timestamp: Date.now(),
        userId: adminUserId,
        message: '远程开门成功'
      };
    } catch (error) {
      return {
        success: false,
        method: AuthMethod.REMOTE,
        timestamp: Date.now(),
        message: '远程开门失败: ' + (error instanceof Error ? error.message : String(error))
      };
    }
  }
  
  // 解锁门
  private async unlock(): Promise<void> {
    try {
      if (this.currentStatus === DoorStatus.UNLOCKED) {
        return;
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
    if (delayMs < 1000) {
      throw new Error('自动锁定延迟不能小于1秒');
    }
    
    this.autoLockDelay = delayMs;
    console.log(`[门锁] 设置自动锁定延迟: ${delayMs}ms`);
  }
  
  // 添加密码
  public addPassword(userId: string, password: string): void {
    if (password.length < 6) {
      throw new Error('密码长度不能小于6位');
    }
    
    this.passwords.set(userId, password);
    console.log(`[门锁] 已添加/更新密码: ${userId}`);
  }
  
  // 删除密码
  public removePassword(userId: string): boolean {
    const result = this.passwords.delete(userId);
    if (result) {
      console.log(`[门锁] 已删除密码: ${userId}`);
    }
    return result;
  }
  
  // 检查是否被锁定
  private isLockedOut(): boolean {
    if (!this.lockoutUntil) {
      return false;
    }
    
    return new Date() < this.lockoutUntil;
  }
  
  // 获取锁定剩余时间（毫秒）
  private getRemainingLockoutTime(): number {
    if (!this.lockoutUntil || new Date() > this.lockoutUntil) {
      return 0;
    }
    
    return this.lockoutUntil.getTime() - Date.now();
  }
}

// 导出单例实例
export const doorController = new DoorController();

export default doorController; 