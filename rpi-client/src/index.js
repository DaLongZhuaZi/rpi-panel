/**
 * 树莓派硬件控制客户端
 * 负责连接服务器并管理设备状态
 */

const path = require('path');
const cwd = process.cwd();
const expectedDir = path.resolve(__dirname, '..');
if (cwd !== expectedDir) {
  // eslint-disable-next-line no-console
  console.error(`请在 rpi-client 目录下运行本程序！当前目录: ${cwd}`);
  process.exit(1);
}

require('dotenv').config();
const os = require('os');
const winston = require('winston');
const { io } = require('socket.io-client');
const ApiClient = require('./api-client');
const GpioManager = require('./gpio-manager');
const I2cManager = require('./i2c-manager');

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'client-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'client.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 配置
const config = {
  serverUrl: process.env.SERVER_URL || 'http://192.168.5.201:3000',
  deviceId: process.env.DEVICE_ID || `rpi-${Math.floor(Math.random() * 10000)}`,
  deviceName: process.env.DEVICE_NAME || os.hostname(),
  deviceType: process.env.DEVICE_TYPE || 'raspberry-pi',
  statusInterval: parseInt(process.env.STATUS_INTERVAL || '60000', 10), // 默认60秒
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000', 10), // 默认5秒
};

// 设备信息
const deviceInfo = {
  deviceId: config.deviceId,
  name: config.deviceName,
  type: config.deviceType,
  description: process.env.DEVICE_DESCRIPTION || '树莓派客户端',
  ipAddress: getLocalIpAddress(),
  hardware: getHardwareInfo()
};

// 初始化管理器
const apiClient = new ApiClient(config.serverUrl);
const gpioManager = new GpioManager(logger);
const i2cManager = new I2cManager(logger);

// 状态变量
let socket;
let isConnected = false;
let statusInterval;

/**
 * 获取本地IP地址
 * @returns {string} IP地址
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

/**
 * 获取硬件信息
 * @returns {Object} 硬件信息
 */
function getHardwareInfo() {
  return {
    platform: os.platform(),
    architecture: os.arch(),
    hostname: os.hostname(),
    model: 'Raspberry Pi', // 实际项目中可以从/proc/cpuinfo获取
    cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
    cpuCores: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
    freeMemory: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
    memoryUsage: Math.round((1 - os.freemem() / os.totalmem()) * 100) + '%',
    uptime: Math.round(os.uptime() / 3600) + ' 小时',
    cpuTemp: getCpuTemperature()
  };
}

/**
 * 获取CPU温度
 * @returns {string|null} CPU温度
 */
function getCpuTemperature() {
  try {
    // 在树莓派上，可以通过读取系统文件获取CPU温度
    // 在其他系统上，这个操作可能会失败
    const fs = require('fs');
    const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    return (parseInt(temp, 10) / 1000).toFixed(1) + '°C';
  } catch (error) {
    return null;
  }
}

/**
 * 连接到服务器
 */
function connectToServer() {
  logger.info(`正在连接到服务器: ${config.serverUrl}`);
  
  // 创建Socket.IO连接
  socket = io(config.serverUrl, {
    reconnection: true,
    reconnectionDelay: config.reconnectDelay,
    reconnectionAttempts: Infinity
  });
  
  // 连接事件
  socket.on('connect', () => {
    logger.info('已连接到服务器');
    isConnected = true;
    
    // 注册设备
    socket.emit('register', deviceInfo);
    logger.info(`设备已注册: ${deviceInfo.deviceId}`);
    
    // 开始定期发送状态更新
    startStatusUpdates();
  });
  
  // 断开连接事件
  socket.on('disconnect', (reason) => {
    logger.warn(`与服务器断开连接: ${reason}`);
    isConnected = false;
    
    // 停止状态更新
    stopStatusUpdates();
  });
  
  // 重新连接事件
  socket.on('reconnect', (attemptNumber) => {
    logger.info(`重新连接成功，尝试次数: ${attemptNumber}`);
    isConnected = true;
    
    // 重新注册设备
    socket.emit('register', deviceInfo);
    logger.info(`设备已重新注册: ${deviceInfo.deviceId}`);
    
    // 重新开始状态更新
    startStatusUpdates();
  });
  
  // 重新连接错误
  socket.on('reconnect_error', (error) => {
    logger.error(`重新连接错误: ${error.message}`);
  });
  
  // 处理服务器命令
  socket.on('system-control', handleSystemControl);
  socket.on('gpio-control', handleGpioControl);
  socket.on('i2c-control', handleI2cControl);
}

/**
 * 开始定期发送状态更新
 */
function startStatusUpdates() {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
  
  // 立即发送一次状态更新
  sendStatusUpdate();
  
  // 设置定期更新
  statusInterval = setInterval(sendStatusUpdate, config.statusInterval);
  logger.info(`状态更新已启动，间隔: ${config.statusInterval}ms`);
}

/**
 * 停止状态更新
 */
function stopStatusUpdates() {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
    logger.info('状态更新已停止');
  }
}

/**
 * 发送状态更新
 */
function sendStatusUpdate() {
  if (!isConnected) return;
  
  const statusData = {
    deviceId: deviceInfo.deviceId,
    status: 'online',
    hardware: getHardwareInfo(),
    gpioPins: gpioManager.getAllPins(),
    i2cDevices: i2cManager.getAllDevices()
  };
  
  socket.emit('status-update', statusData);
  logger.debug('状态更新已发送');
}

/**
 * 处理系统控制命令
 * @param {Object} data - 命令数据
 */
function handleSystemControl(data) {
  logger.info(`收到系统控制命令: ${data.command}`);
  
  switch (data.command) {
    case 'update-status':
      // 立即发送状态更新
      sendStatusUpdate();
      break;
      
    case 'restart':
      // 重启客户端
      logger.info('正在重启客户端...');
      setTimeout(() => {
        process.exit(0); // 退出进程，依赖进程管理器（如PM2）重新启动
      }, 1000);
      break;
      
    case 'shutdown':
      // 关闭客户端
      logger.info('正在关闭客户端...');
      setTimeout(() => {
        process.exit(0);
      }, 1000);
      break;
      
    default:
      logger.warn(`未知的系统命令: ${data.command}`);
      break;
  }
}

/**
 * 处理GPIO控制命令
 * @param {Object} data - 命令数据
 */
function handleGpioControl(data) {
  logger.info(`收到GPIO控制命令: ${data.command}, 引脚: ${data.pin}`);
  
  let result;
  
  try {
    switch (data.command) {
      case 'setup':
        result = gpioManager.setupPin(data.pin, data.mode, data.options);
        break;
        
      case 'write':
        result = gpioManager.writePin(data.pin, data.value);
        break;
        
      case 'read':
        result = gpioManager.readPin(data.pin);
        break;
        
      case 'release':
        result = gpioManager.releasePin(data.pin);
        break;
        
      case 'release-all':
        result = gpioManager.releaseAllPins();
        break;
        
      default:
        throw new Error(`未知的GPIO命令: ${data.command}`);
    }
    
    // 发送成功结果
    socket.emit('gpio-result', {
      pin: data.pin,
      command: data.command,
      success: true,
      result
    });
  } catch (error) {
    logger.error(`GPIO操作失败: ${error.message}`);
    
    // 发送错误结果
    socket.emit('gpio-result', {
      pin: data.pin,
      command: data.command,
      success: false,
      error: error.message
    });
  }
}

/**
 * 处理I2C控制命令
 * @param {Object} data - 命令数据
 */
function handleI2cControl(data) {
  logger.info(`收到I2C控制命令: ${data.command}, 总线: ${data.busNumber}, 地址: ${data.address}`);
  
  let result;
  
  try {
    switch (data.command) {
      case 'scan':
        result = i2cManager.scanBus(data.busNumber);
        break;
        
      case 'read':
        result = i2cManager.readDevice(data.busNumber, data.address, data.sensorType);
        
        // 如果读取成功，发送传感器数据
        if (result) {
          socket.emit('sensor-data', {
            deviceId: deviceInfo.deviceId,
            sensorType: data.sensorType || 'i2c',
            data: result
          });
        }
        break;
        
      case 'write':
        result = i2cManager.writeDevice(data.busNumber, data.address, data.values);
        break;
        
      default:
        throw new Error(`未知的I2C命令: ${data.command}`);
    }
    
    // 发送成功结果
    socket.emit('i2c-result', {
      busNumber: data.busNumber,
      address: data.address,
      command: data.command,
      success: true,
      result
    });
  } catch (error) {
    logger.error(`I2C操作失败: ${error.message}`);
    
    // 发送错误结果
    socket.emit('i2c-result', {
      busNumber: data.busNumber,
      address: data.address,
      command: data.command,
      success: false,
      error: error.message
    });
  }
}

/**
 * 优雅关闭
 */
function gracefulShutdown() {
  logger.info('正在关闭客户端...');
  
  // 停止状态更新
  stopStatusUpdates();
  
  // 释放所有GPIO引脚
  gpioManager.releaseAllPins();
  
  // 关闭I2C连接
  i2cManager.closeAll();
  
  // 断开Socket连接
  if (socket && isConnected) {
    socket.disconnect();
  }
  
  logger.info('客户端已关闭');
  process.exit(0);
}

// 处理进程退出
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
  logger.error(`未捕获的异常: ${error.message}`);
  logger.error(error.stack);
  gracefulShutdown();
});

// 启动客户端
logger.info('树莓派硬件控制客户端启动中...');
logger.info(`设备ID: ${deviceInfo.deviceId}`);
logger.info(`设备名称: ${deviceInfo.name}`);
logger.info(`服务器URL: ${config.serverUrl}`);

// 连接到服务器
connectToServer(); 