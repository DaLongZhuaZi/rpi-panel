/**
 * 日志控制器
 * 用于处理系统、设备、GPIO和I2C日志的查询和管理
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// 创建日志目录
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 日志格式
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// 创建日志记录器
const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.File({ filename: path.join(logsDir, 'log-error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logsDir, 'log.log') })
  ]
});

// 在开发环境下也将日志输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console());
}

// 内存缓存，用于存储最近的日志
const logCache = {
  system: [],
  device: {},
  gpio: [],
  i2c: []
};

// 最大缓存日志数
const MAX_LOGS = 1000;

/**
 * 添加系统日志
 * @param {string} level - 日志级别 (info, warn, error)
 * @param {string} message - 日志消息
 */
function addSystemLog(level, message) {
  const log = {
    level,
    message,
    timestamp: new Date()
  };
  
  // 添加到缓存
  logCache.system.push(log);
  if (logCache.system.length > MAX_LOGS) {
    logCache.system.shift(); // 移除最旧的日志
  }
  
  // 使用winston记录日志
  logger.log(level, message);
  
  return log;
}

/**
 * 添加设备日志
 * @param {string} deviceId - 设备ID
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 */
function addDeviceLog(deviceId, level, message) {
  const log = {
    deviceId,
    level,
    message,
    timestamp: new Date()
  };
  
  // 如果设备不存在，初始化日志数组
  if (!logCache.device[deviceId]) {
    logCache.device[deviceId] = [];
  }
  
  // 添加到缓存
  logCache.device[deviceId].push(log);
  if (logCache.device[deviceId].length > MAX_LOGS) {
    logCache.device[deviceId].shift(); // 移除最旧的日志
  }
  
  // 使用winston记录日志
  logger.log(level, `[设备: ${deviceId}] ${message}`);
  
  return log;
}

/**
 * 添加GPIO日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 */
function addGpioLog(level, message) {
  const log = {
    level,
    message,
    timestamp: new Date()
  };
  
  // 添加到缓存
  logCache.gpio.push(log);
  if (logCache.gpio.length > MAX_LOGS) {
    logCache.gpio.shift(); // 移除最旧的日志
  }
  
  // 使用winston记录日志
  logger.log(level, `[GPIO] ${message}`);
  
  return log;
}

/**
 * 添加I2C日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 */
function addI2cLog(level, message) {
  const log = {
    level,
    message,
    timestamp: new Date()
  };
  
  // 添加到缓存
  logCache.i2c.push(log);
  if (logCache.i2c.length > MAX_LOGS) {
    logCache.i2c.shift(); // 移除最旧的日志
  }
  
  // 使用winston记录日志
  logger.log(level, `[I2C] ${message}`);
  
  return log;
}

/**
 * 获取系统日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function getSystemLogs(req, res) {
  const level = req.query.level;
  const limit = parseInt(req.query.limit) || 100;
  
  let logs = [...logCache.system];
  
  // 按级别筛选
  if (level) {
    logs = logs.filter(log => log.level === level);
  }
  
  // 按时间降序排序
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 限制返回数量
  logs = logs.slice(0, limit);
  
  res.json({ logs });
}

/**
 * 获取设备日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function getDeviceLogs(req, res) {
  const deviceId = req.query.deviceId;
  const limit = parseInt(req.query.limit) || 100;
  
  let logs = [];
  
  if (deviceId && deviceId !== 'all') {
    // 获取特定设备的日志
    logs = logCache.device[deviceId] || [];
  } else {
    // 获取所有设备的日志
    Object.values(logCache.device).forEach(deviceLogs => {
      logs = logs.concat(deviceLogs);
    });
  }
  
  // 按时间降序排序
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 限制返回数量
  logs = logs.slice(0, limit);
  
  res.json({ logs });
}

/**
 * 获取GPIO日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function getGpioLogs(req, res) {
  const level = req.query.level;
  const limit = parseInt(req.query.limit) || 100;
  
  let logs = [...logCache.gpio];
  
  // 按级别筛选
  if (level) {
    logs = logs.filter(log => log.level === level);
  }
  
  // 按时间降序排序
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 限制返回数量
  logs = logs.slice(0, limit);
  
  res.json({ logs });
}

/**
 * 获取I2C日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function getI2cLogs(req, res) {
  const level = req.query.level;
  const limit = parseInt(req.query.limit) || 100;
  
  let logs = [...logCache.i2c];
  
  // 按级别筛选
  if (level) {
    logs = logs.filter(log => log.level === level);
  }
  
  // 按时间降序排序
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 限制返回数量
  logs = logs.slice(0, limit);
  
  res.json({ logs });
}

/**
 * 清除所有日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function clearAllLogs(req, res) {
  // 清除内存缓存
  logCache.system = [];
  logCache.device = {};
  logCache.gpio = [];
  logCache.i2c = [];
  
  // 记录清除操作
  addSystemLog('info', '所有日志已被清除');
  
  res.json({ message: '所有日志已清除', success: true });
}

// 导出模块
module.exports = {
  // 日志记录函数
  addSystemLog,
  addDeviceLog,
  addGpioLog,
  addI2cLog,
  
  // API控制器
  getSystemLogs,
  getDeviceLogs,
  getGpioLogs,
  getI2cLogs,
  clearAllLogs
}; 