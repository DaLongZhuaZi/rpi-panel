/**
 * 初始化服务
 * 用于统一初始化所有需要的服务
 */

import mqttService from './mqtt-service';

/**
 * 初始化所有服务
 */
export async function initializeServices(): Promise<void> {
  console.log('开始初始化服务...');
  
  try {
    // 初始化MQTT服务
    console.log('正在初始化MQTT服务...');
    await mqttService.initialize();
    console.log('MQTT服务初始化成功');
    
    // 这里可以添加其他服务的初始化
    
    console.log('所有服务初始化完成');
  } catch (error) {
    console.error('服务初始化失败:', error);
    throw error;
  }
}

export default {
  initializeServices
}; 