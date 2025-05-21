const winston = require('winston');

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'gpio-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'gpio.log' })
  ]
});

// 内存中存储GPIO引脚配置（实际项目中可考虑使用数据库）
const gpioPins = {};
const devicePinMapping = {}; // 设备到引脚的映射

const gpioController = {
  // API控制器：获取所有配置的GPIO引脚
  getAllPins: (req, res) => {
    const { deviceId } = req.query;
    
    if (deviceId) {
      // 如果指定了设备ID，只返回该设备的引脚
      const pinIds = devicePinMapping[deviceId] || [];
      const pins = pinIds.map(pinId => gpioPins[pinId]).filter(Boolean);
      return res.json(pins);
    }
    
    // 否则返回所有引脚
    res.json(Object.values(gpioPins));
  },
  
  // API控制器：获取特定GPIO引脚状态
  getPinStatus: (req, res) => {
    const { pin } = req.params;
    const pinId = parseInt(pin, 10);
    
    if (isNaN(pinId) || !gpioPins[pinId]) {
      return res.status(404).json({ error: '引脚未找到或未配置' });
    }
    
    res.json(gpioPins[pinId]);
  },
  
  // API控制器：配置GPIO引脚
  setupPin: (req, res) => {
    const { pin, mode, initialState, pullUpDown, alias, deviceId } = req.body;
    const pinId = parseInt(pin, 10);
    
    if (isNaN(pinId)) {
      return res.status(400).json({ error: '无效的引脚编号' });
    }
    
    if (!['in', 'out'].includes(mode)) {
      return res.status(400).json({ error: '模式必须为 "in" 或 "out"' });
    }
    
    // 创建或更新引脚配置
    gpioPins[pinId] = {
      pin: pinId,
      mode,
      value: mode === 'out' ? (initialState === 1 ? 1 : 0) : 0,
      pullUpDown: ['up', 'down', 'none'].includes(pullUpDown) ? pullUpDown : 'none',
      alias: alias || `GPIO-${pinId}`,
      deviceId: deviceId || null,
      lastUpdated: new Date()
    };
    
    // 更新设备到引脚的映射
    if (deviceId) {
      if (!devicePinMapping[deviceId]) {
        devicePinMapping[deviceId] = [];
      }
      if (!devicePinMapping[deviceId].includes(pinId)) {
        devicePinMapping[deviceId].push(pinId);
      }
    }
    
    logger.info(`GPIO引脚已配置: ${pinId}, 模式: ${mode}`);
    res.json(gpioPins[pinId]);
  },
  
  // API控制器：更新GPIO引脚值
  updatePinValue: (req, res) => {
    const { pin } = req.params;
    const { value } = req.body;
    const pinId = parseInt(pin, 10);
    
    if (isNaN(pinId) || !gpioPins[pinId]) {
      return res.status(404).json({ error: '引脚未找到或未配置' });
    }
    
    if (gpioPins[pinId].mode !== 'out') {
      return res.status(400).json({ error: '只能更新输出模式的引脚值' });
    }
    
    // 验证值是否有效
    const newValue = parseInt(value, 10);
    if (![0, 1].includes(newValue)) {
      return res.status(400).json({ error: '值必须为 0 或 1' });
    }
    
    // 更新引脚值
    gpioPins[pinId].value = newValue;
    gpioPins[pinId].lastUpdated = new Date();
    
    logger.info(`GPIO引脚值已更新: ${pinId}, 值: ${newValue}`);
    
    // 这里应该发送命令到树莓派设备更新实际引脚状态
    // 可以通过WebSocket实现
    
    res.json(gpioPins[pinId]);
  },
  
  // API控制器：释放GPIO引脚
  releasePin: (req, res) => {
    const { pin } = req.params;
    const pinId = parseInt(pin, 10);
    
    if (isNaN(pinId) || !gpioPins[pinId]) {
      return res.status(404).json({ error: '引脚未找到或未配置' });
    }
    
    // 从设备映射中移除
    const deviceId = gpioPins[pinId].deviceId;
    if (deviceId && devicePinMapping[deviceId]) {
      devicePinMapping[deviceId] = devicePinMapping[deviceId].filter(id => id !== pinId);
      if (devicePinMapping[deviceId].length === 0) {
        delete devicePinMapping[deviceId];
      }
    }
    
    // 删除引脚配置
    delete gpioPins[pinId];
    
    logger.info(`GPIO引脚已释放: ${pinId}`);
    res.json({ message: `引脚 ${pinId} 已释放` });
  },
  
  // API控制器：释放所有GPIO引脚
  releaseAllPins: (req, res) => {
    const { deviceId } = req.query;
    
    if (deviceId) {
      // 只释放特定设备的引脚
      const pinIds = devicePinMapping[deviceId] || [];
      pinIds.forEach(pinId => {
        delete gpioPins[pinId];
      });
      delete devicePinMapping[deviceId];
      
      logger.info(`设备的所有GPIO引脚已释放: ${deviceId}`);
      return res.json({ message: `设备 ${deviceId} 的所有引脚已释放`, count: pinIds.length });
    }
    
    // 释放所有引脚
    const count = Object.keys(gpioPins).length;
    Object.keys(gpioPins).forEach(pinId => {
      delete gpioPins[pinId];
    });
    Object.keys(devicePinMapping).forEach(deviceId => {
      delete devicePinMapping[deviceId];
    });
    
    logger.info('所有GPIO引脚已释放');
    res.json({ message: '所有引脚已释放', count });
  }
};

module.exports = gpioController; 