const winston = require('winston');

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'i2c-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'i2c.log' })
  ]
});

// 内存中存储I2C设备信息（实际项目中可考虑使用数据库）
const i2cDevices = {};
const deviceReadings = {};

// I2C设备类型映射表
const I2C_DEVICE_TYPES = {
  '0x23': ['BH1750', '光照传感器'],
  '0x76': ['BME280', '温湿度气压传感器'],
  '0x77': ['BME280', '温湿度气压传感器(备用地址)'],
  '0x68': ['DS3231', '实时时钟'],
  '0x3C': ['SSD1306', 'OLED显示屏'],
  '0x40': ['INA219', '电流传感器']
};

const i2cController = {
  // API控制器：扫描I2C设备
  scanDevices: (req, res) => {
    const { bus } = req.params;
    const busNumber = bus ? parseInt(bus, 10) : 1;
    
    if (isNaN(busNumber) || busNumber < 0) {
      return res.status(400).json({ error: '无效的总线编号' });
    }
    
    // 在真实环境中，应该发送命令到树莓派，让其执行I2C扫描
    // 这里为了演示，我们模拟一些设备地址
    
    // 模拟数据：总线1上检测到的设备
    const busScanResults = {
      1: [0x23, 0x76, 0x68],
      0: [0x40, 0x3C]
    };
    
    const addresses = busScanResults[busNumber] || [];
    
    // 为每个地址添加设备类型信息
    const results = addresses.map(address => {
      const hexAddress = `0x${address.toString(16)}`;
      const deviceInfo = I2C_DEVICE_TYPES[hexAddress];
      
      return {
        address: hexAddress,
        busNumber,
        type: deviceInfo ? deviceInfo[0] : 'Unknown',
        description: deviceInfo ? deviceInfo[1] : '未知设备'
      };
    });
    
    res.json(results);
  },
  
  // API控制器：获取所有已配置的I2C设备
  getAllDevices: (req, res) => {
    const { deviceId } = req.query;
    
    if (deviceId) {
      // 筛选特定设备的I2C设备配置
      const filteredDevices = Object.values(i2cDevices).filter(
        device => device.deviceId === deviceId
      );
      return res.json(filteredDevices);
    }
    
    // 返回所有I2C设备
    res.json(Object.values(i2cDevices));
  },
  
  // API控制器：获取特定I2C设备信息
  getDeviceById: (req, res) => {
    const { deviceId } = req.params;
    
    if (!i2cDevices[deviceId]) {
      return res.status(404).json({ error: 'I2C设备未找到' });
    }
    
    res.json(i2cDevices[deviceId]);
  },
  
  // API控制器：添加I2C设备
  addDevice: (req, res) => {
    const { busNumber, address, name, description, deviceId } = req.body;
    
    if (!busNumber || !address) {
      return res.status(400).json({ error: '总线编号和地址是必需的' });
    }
    
    // 将地址转换为十六进制字符串
    let hexAddress;
    if (typeof address === 'string' && address.toLowerCase().startsWith('0x')) {
      hexAddress = address.toLowerCase();
    } else {
      const addrNum = parseInt(address, 10);
      if (isNaN(addrNum) || addrNum < 0 || addrNum > 127) {
        return res.status(400).json({ error: '无效的I2C地址' });
      }
      hexAddress = `0x${addrNum.toString(16).padStart(2, '0')}`;
    }
    
    // 检查是否已存在相同的设备配置
    const i2cDeviceId = `i2c-${busNumber}-${hexAddress}`;
    
    if (i2cDevices[i2cDeviceId]) {
      return res.status(409).json({ error: '该I2C设备配置已存在' });
    }
    
    // 获取设备类型信息
    const deviceTypeInfo = I2C_DEVICE_TYPES[hexAddress] || ['未知设备', ''];
    
    // 创建新的I2C设备配置
    i2cDevices[i2cDeviceId] = {
      id: i2cDeviceId,
      busNumber: parseInt(busNumber, 10),
      address: hexAddress,
      name: name || deviceTypeInfo[0],
      description: description || deviceTypeInfo[1],
      deviceId: deviceId || null,
      createdAt: new Date(),
      lastRead: null
    };
    
    logger.info(`I2C设备已添加: ${i2cDeviceId}`);
    res.status(201).json(i2cDevices[i2cDeviceId]);
  },
  
  // API控制器：从I2C设备读取数据
  readDevice: (req, res) => {
    const { bus, address } = req.params;
    
    if (!bus || !address) {
      return res.status(400).json({ error: '总线编号和地址是必需的' });
    }
    
    const busNumber = parseInt(bus, 10);
    let hexAddress;
    
    if (address.toLowerCase().startsWith('0x')) {
      hexAddress = address.toLowerCase();
    } else {
      const addrNum = parseInt(address, 10);
      if (isNaN(addrNum)) {
        return res.status(400).json({ error: '无效的I2C地址' });
      }
      hexAddress = `0x${addrNum.toString(16).padStart(2, '0')}`;
    }
    
    const i2cDeviceId = `i2c-${busNumber}-${hexAddress}`;
    
    // 检查设备是否已配置
    if (!i2cDevices[i2cDeviceId]) {
      return res.status(404).json({ error: 'I2C设备未配置' });
    }
    
    // 在实际环境中，应该发送命令到树莓派读取数据
    // 这里模拟一些传感器数据
    let sensorData;
    const deviceType = i2cDevices[i2cDeviceId].name.toUpperCase();
    
    if (deviceType.includes('BME280')) {
      sensorData = {
        temperature: 22 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        pressure: 1000 + Math.random() * 15
      };
    } else if (deviceType.includes('BH1750')) {
      sensorData = {
        light: 200 + Math.random() * 800
      };
    } else if (deviceType.includes('DS3231')) {
      const now = new Date();
      sensorData = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds()
      };
    } else {
      sensorData = {
        value: Math.random() * 100
      };
    }
    
    // 记录读取时间
    const timestamp = new Date();
    i2cDevices[i2cDeviceId].lastRead = timestamp;
    
    // 保存读取的数据
    if (!deviceReadings[i2cDeviceId]) {
      deviceReadings[i2cDeviceId] = [];
    }
    
    deviceReadings[i2cDeviceId].push({
      timestamp,
      data: sensorData
    });
    
    // 只保留最近的100条记录
    if (deviceReadings[i2cDeviceId].length > 100) {
      deviceReadings[i2cDeviceId].shift();
    }
    
    logger.info(`从I2C设备读取数据: ${i2cDeviceId}`);
    
    res.json({
      deviceId: i2cDeviceId,
      timestamp,
      data: sensorData
    });
  },
  
  // API控制器：向I2C设备写入数据
  writeDevice: (req, res) => {
    const { bus, address } = req.params;
    const { register, value } = req.body;
    
    if (!bus || !address) {
      return res.status(400).json({ error: '总线编号和地址是必需的' });
    }
    
    if (register === undefined || value === undefined) {
      return res.status(400).json({ error: '寄存器和值是必需的' });
    }
    
    const busNumber = parseInt(bus, 10);
    let hexAddress;
    
    if (address.toLowerCase().startsWith('0x')) {
      hexAddress = address.toLowerCase();
    } else {
      const addrNum = parseInt(address, 10);
      if (isNaN(addrNum)) {
        return res.status(400).json({ error: '无效的I2C地址' });
      }
      hexAddress = `0x${addrNum.toString(16).padStart(2, '0')}`;
    }
    
    const i2cDeviceId = `i2c-${busNumber}-${hexAddress}`;
    
    // 检查设备是否已配置
    if (!i2cDevices[i2cDeviceId]) {
      return res.status(404).json({ error: 'I2C设备未配置' });
    }
    
    // 在实际环境中，应该发送命令到树莓派写入数据
    // 这里只是记录请求
    
    logger.info(`向I2C设备写入数据: ${i2cDeviceId}, 寄存器: ${register}, 值: ${value}`);
    
    res.json({
      deviceId: i2cDeviceId,
      register,
      value,
      timestamp: new Date(),
      success: true
    });
  },
  
  // API控制器：删除I2C设备配置
  removeDevice: (req, res) => {
    const { deviceId } = req.params;
    
    if (!i2cDevices[deviceId]) {
      return res.status(404).json({ error: 'I2C设备未找到' });
    }
    
    // 删除设备配置
    delete i2cDevices[deviceId];
    
    // 删除设备读取历史
    delete deviceReadings[deviceId];
    
    logger.info(`I2C设备已删除: ${deviceId}`);
    res.json({ message: `I2C设备 ${deviceId} 已删除` });
  },
  
  // API控制器：获取设备历史数据
  getDeviceHistory: (req, res) => {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;
    
    if (!i2cDevices[deviceId]) {
      return res.status(404).json({ error: 'I2C设备未找到' });
    }
    
    // 返回设备读取历史
    if (!deviceReadings[deviceId]) {
      return res.json([]);
    }
    
    const history = deviceReadings[deviceId].slice(-parseInt(limit, 10));
    res.json(history);
  }
};

module.exports = i2cController; 