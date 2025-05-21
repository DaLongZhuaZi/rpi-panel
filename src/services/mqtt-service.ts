/**
 * MQTT服务
 * 用于管理MQTT客户端的连接和状态
 */

import mqttClient from '../hardware/mqtt-client';

export class MqttService {
  private static instance: MqttService;
  private initialized: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService();
    }
    return MqttService.instance;
  }
  
  /**
   * 初始化MQTT客户端
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      console.log('正在初始化MQTT客户端...');
      await mqttClient.connect();
      this.initialized = true;
      console.log('MQTT客户端初始化成功');
    } catch (error) {
      console.error('MQTT客户端初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 检查MQTT客户端是否已连接
   */
  public isConnected(): boolean {
    return mqttClient.isConnected();
  }
  
  /**
   * 重新连接MQTT客户端
   */
  public async reconnect(): Promise<void> {
    try {
      if (mqttClient.isConnected()) {
        await mqttClient.disconnect();
      }
      await mqttClient.connect();
      this.initialized = true;
    } catch (error) {
      console.error('MQTT客户端重连失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const mqttService = MqttService.getInstance();
export default mqttService; 