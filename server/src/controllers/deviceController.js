const winston = require('winston');

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'device-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'device.log' })
  ]
});

// 内存中存储设备信息（实际项目中应使用数据库）
const devices = {};
const devicesBySocketId = {};
const deviceHistory = {};
const sensorData = {};

const deviceController = {
  // 注册设备
  registerDevice: (socketId, data) => {
    const { deviceId, type, name, description } = data;
    
    if (!deviceId) {
      logger.error('设备注册失败: 没有设备ID');
      return;
    }
    
    devices[deviceId] = {
      id: deviceId,
      type: type || 'unknown',
      name: name || `设备 ${deviceId}`,
      description: description || '',
      status: 'online',
      lastSeen: new Date(),
      socketId,
      ipAddress: data.ipAddress || 'unknown',
      hardware: data.hardware || {}
    };
    
    devicesBySocketId[socketId] = deviceId;
    logger.info(`设备已注册: ${deviceId}`);
  },
  
  // 移除设备（断开连接时）
  removeDevice: (socketId) => {
    const deviceId = devicesBySocketId[socketId];
    if (deviceId && devices[deviceId]) {
      devices[deviceId].status = 'offline';
      devices[deviceId].lastSeen = new Date();
      delete devices[deviceId].socketId;
      delete devicesBySocketId[socketId];
      logger.info(`设备标记为离线: ${deviceId}`);
    }
  },
  
  // 通过socketId获取设备ID
  getDeviceIdBySocketId: (socketId) => {
    return devicesBySocketId[socketId];
  },
  
  // 通过设备ID获取socketId
  getSocketIdByDeviceId: (deviceId) => {
    return devices[deviceId]?.socketId;
  },
  
  // 获取在线设备列表
  getOnlineDevices: () => {
    return Object.values(devices).filter(device => device.status === 'online');
  },
  
  // 获取特定类型的设备
  getDevicesByType: (type) => {
    return Object.values(devices).filter(device => device.type === type);
  },
  
  // 更新设备状态
  updateDeviceStatus: (socketId, data) => {
    const deviceId = devicesBySocketId[socketId] || data.deviceId;
    
    if (!deviceId || !devices[deviceId]) {
      logger.error(`更新设备状态失败: 设备未注册 ${data.deviceId || socketId}`);
      return;
    }
    
    devices[deviceId] = {
      ...devices[deviceId],
      ...data,
      lastSeen: new Date()
    };
    
    logger.info(`设备状态已更新: ${deviceId}`);
    
    // 保存历史记录
    if (!deviceHistory[deviceId]) {
      deviceHistory[deviceId] = [];
    }
    
    deviceHistory[deviceId].push({
      timestamp: new Date(),
      status: data.status || devices[deviceId].status,
      hardware: data.hardware || {},
      data: data.data || {}
    });
    
    // 保留最近的500条记录
    if (deviceHistory[deviceId].length > 500) {
      deviceHistory[deviceId].shift();
    }
  },
  
  // 记录传感器数据
  recordSensorData: (data) => {
    const { deviceId, sensorType, data: sensorValues } = data;
    
    if (!deviceId || !sensorType) {
      logger.error('记录传感器数据失败: 缺少设备ID或传感器类型');
      return;
    }
    
    if (!sensorData[deviceId]) {
      sensorData[deviceId] = {};
    }
    
    if (!sensorData[deviceId][sensorType]) {
      sensorData[deviceId][sensorType] = [];
    }
    
    sensorData[deviceId][sensorType].push({
      timestamp: new Date(),
      values: sensorValues
    });
    
    // 保留最近的1000条记录
    if (sensorData[deviceId][sensorType].length > 1000) {
      sensorData[deviceId][sensorType].shift();
    }
    
    logger.info(`传感器数据已记录: ${deviceId}, ${sensorType}`);
    
    // 更新设备的最新传感器值
    if (!devices[deviceId]?.sensors) {
      devices[deviceId].sensors = {};
    }
    
    devices[deviceId].sensors[sensorType] = {
      lastReading: sensorValues,
      lastReadTime: new Date()
    };
  },
  
  // 向设备发送命令
  sendCommandToDevice: (io, deviceId, command, data) => {
    const socketId = devices[deviceId]?.socketId;
    
    if (!socketId) {
      logger.error(`发送命令失败: 设备离线或未注册 ${deviceId}`);
      return false;
    }
    
    io.to(socketId).emit(command, data);
    logger.info(`命令已发送到设备 ${deviceId}: ${command}`);
    return true;
  },
  
  // API控制器：获取所有设备
  getAllDevices: (req, res) => {
    const deviceList = Object.values(devices);
    res.json(deviceList);
  },
  
  // API控制器：根据ID获取设备
  getDeviceById: (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    res.json(devices[deviceId]);
  },
  
  // API控制器：添加设备
  addDevice: (req, res) => {
    const { deviceId, type, name, description } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: '设备ID是必需的' });
    }
    
    if (devices[deviceId]) {
      return res.status(409).json({ error: '设备已存在' });
    }
    
    devices[deviceId] = {
      id: deviceId,
      type: type || 'unknown',
      name: name || `设备 ${deviceId}`,
      description: description || '',
      status: 'offline',
      lastSeen: new Date()
    };
    
    logger.info(`手动添加设备: ${deviceId}`);
    res.status(201).json(devices[deviceId]);
  },
  
  // API控制器：更新设备
  updateDevice: (req, res) => {
    const { deviceId } = req.params;
    const updates = req.body;
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    // 禁止更新某些字段
    delete updates.id;
    delete updates.socketId;
    
    devices[deviceId] = {
      ...devices[deviceId],
      ...updates
    };
    
    logger.info(`设备已更新: ${deviceId}`);
    res.json(devices[deviceId]);
  },
  
  // API控制器：删除设备
  deleteDevice: (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    // 如果设备在线，只标记为离线
    if (devices[deviceId].status === 'online') {
      devices[deviceId].status = 'offline';
      logger.info(`设备标记为离线: ${deviceId}`);
      return res.json({ message: '设备已标记为离线' });
    }
    
    // 否则删除设备
    delete devices[deviceId];
    logger.info(`设备已删除: ${deviceId}`);
    res.json({ message: '设备已删除' });
  },
  
  // API控制器：获取设备状态
  getDeviceStatus: (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    res.json({
      deviceId,
      status: devices[deviceId].status,
      lastSeen: devices[deviceId].lastSeen,
      hardware: devices[deviceId].hardware,
      sensors: devices[deviceId].sensors || {}
    });
  },
  
  // API控制器：获取设备历史数据
  getDeviceHistory: (req, res) => {
    const { deviceId } = req.params;
    const { limit = 100, type } = req.query;
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    if (type && type !== 'status') {
      // 返回传感器数据
      if (!sensorData[deviceId] || !sensorData[deviceId][type]) {
        return res.json([]);
      }
      
      const data = sensorData[deviceId][type].slice(-parseInt(limit, 10));
      return res.json(data);
    }
    
    // 返回设备状态历史
    if (!deviceHistory[deviceId]) {
      return res.json([]);
    }
    
    const history = deviceHistory[deviceId].slice(-parseInt(limit, 10));
    res.json(history);
  },
  
  // API控制器：发送命令到设备
  sendCommand: (req, res) => {
    const { deviceId } = req.params;
    const { command, data } = req.body;
    
    if (!deviceId || !command) {
      return res.status(400).json({ error: '设备ID和命令是必需的' });
    }
    
    if (!devices[deviceId]) {
      return res.status(404).json({ error: '设备未找到' });
    }
    
    if (devices[deviceId].status !== 'online') {
      return res.status(400).json({ error: '设备当前不在线' });
    }
    
    const sent = deviceController.sendCommandToDevice(req.io, deviceId, command, data);
    
    if (sent) {
      res.json({ message: `命令已发送到设备: ${command}`, success: true });
    } else {
      res.status(500).json({ error: '发送命令失败', success: false });
    }
  }
};

module.exports = deviceController; 