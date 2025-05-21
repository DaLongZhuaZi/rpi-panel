const fetch = require('node-fetch');
const winston = require('winston');

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'api-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'api.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * 服务器API客户端
 */
class ApiClient {
  /**
   * 构造函数
   * @param {string} serverUrl - 服务器URL
   */
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }
  
  /**
   * 发送HTTP请求
   * @param {string} endpoint - API端点
   * @param {string} method - HTTP方法
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} 响应数据
   */
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.serverUrl}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      logger.info(`发送${method}请求到: ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP错误 ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      logger.error(`API请求失败: ${url} - ${error.message}`);
      throw new Error(`API请求失败: ${error.message}`);
    }
  }
  
  /**
   * 注册设备
   * @param {Object} deviceInfo - 设备信息
   * @returns {Promise<Object>} 设备信息
   */
  async registerDevice(deviceInfo) {
    return this.request('/api/devices', 'POST', deviceInfo);
  }
  
  /**
   * 获取设备信息
   * @param {string} deviceId - 设备ID
   * @returns {Promise<Object>} 设备信息
   */
  async getDevice(deviceId) {
    return this.request(`/api/devices/${deviceId}`);
  }
  
  /**
   * 更新设备状态
   * @param {string} deviceId - 设备ID
   * @param {Object} statusData - 状态数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateDeviceStatus(deviceId, statusData) {
    return this.request(`/api/devices/${deviceId}/status`, 'PUT', statusData);
  }
  
  /**
   * 获取设备的GPIO引脚配置
   * @param {string} deviceId - 设备ID
   * @returns {Promise<Array>} GPIO引脚配置
   */
  async getGpioPinsByDevice(deviceId) {
    try {
      return await this.request(`/api/gpio/pins?deviceId=${deviceId}`);
    } catch (error) {
      logger.warn(`获取设备GPIO配置失败: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 获取设备的I2C设备配置
   * @param {string} deviceId - 设备ID
   * @returns {Promise<Array>} I2C设备配置
   */
  async getI2CDevicesByDevice(deviceId) {
    try {
      return await this.request(`/api/i2c/devices?deviceId=${deviceId}`);
    } catch (error) {
      logger.warn(`获取设备I2C配置失败: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 发送传感器数据
   * @param {Object} sensorData - 传感器数据
   * @returns {Promise<Object>} 响应结果
   */
  async sendSensorData(sensorData) {
    return this.request('/api/devices/sensor-data', 'POST', sensorData);
  }
  
  /**
   * 扫描I2C设备
   * @param {number} busNumber - 总线号
   * @returns {Promise<Array>} 设备列表
   */
  async scanI2CDevices(busNumber = 1) {
    return this.request(`/api/i2c/scan/${busNumber}`);
  }
  
  /**
   * 配置GPIO引脚
   * @param {Object} pinConfig - 引脚配置
   * @returns {Promise<Object>} 配置结果
   */
  async configureGpioPin(pinConfig) {
    return this.request('/api/gpio/pins', 'POST', pinConfig);
  }
  
  /**
   * 更新GPIO引脚值
   * @param {number} pin - 引脚号
   * @param {number} value - 引脚值
   * @returns {Promise<Object>} 更新结果
   */
  async updateGpioPinValue(pin, value) {
    return this.request(`/api/gpio/pins/${pin}`, 'PUT', { value });
  }
  
  /**
   * 释放GPIO引脚
   * @param {number} pin - 引脚号
   * @returns {Promise<Object>} 释放结果
   */
  async releaseGpioPin(pin) {
    return this.request(`/api/gpio/pins/${pin}`, 'DELETE');
  }
}

module.exports = ApiClient; 