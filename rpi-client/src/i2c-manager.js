/**
 * I2C管理器
 * 负责处理I2C设备的操作
 */

// 尝试加载i2c-bus模块，如果不在树莓派上运行，可能会失败
let i2c;
try {
  i2c = require('i2c-bus');
} catch (error) {
  console.warn('无法加载i2c-bus模块，I2C功能将不可用');
  i2c = null;
}

/**
 * I2C设备类型映射
 * 包含常见I2C设备的地址和读取方法
 */
const I2C_DEVICE_TYPES = {
  // BME280温湿度气压传感器
  BME280: {
    addresses: [0x76, 0x77],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的BME280读取逻辑
      return {
        temperature: 25 + Math.random() * 5,
        humidity: 50 + Math.random() * 20,
        pressure: 1000 + Math.random() * 20
      };
    }
  },
  
  // BH1750光照传感器
  BH1750: {
    addresses: [0x23, 0x5C],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的BH1750读取逻辑
      return {
        light: 500 + Math.random() * 500
      };
    }
  },
  
  // DS3231实时时钟
  DS3231: {
    addresses: [0x68],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的DS3231读取逻辑
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        temperature: 25 + Math.random() * 5
      };
    }
  },
  
  // SSD1306 OLED显示屏
  SSD1306: {
    addresses: [0x3C, 0x3D],
    read: async (bus, address) => {
      // OLED显示屏通常不需要读取数据
      return {
        status: 'ok'
      };
    }
  },
  
  // PCA9685 PWM控制器
  PCA9685: {
    addresses: [0x40],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的PCA9685读取逻辑
      return {
        frequency: 1000,
        channels: 16
      };
    }
  },
  
  // ADS1115 ADC转换器
  ADS1115: {
    addresses: [0x48, 0x49, 0x4A, 0x4B],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的ADS1115读取逻辑
      return {
        channel0: Math.random() * 3.3,
        channel1: Math.random() * 3.3,
        channel2: Math.random() * 3.3,
        channel3: Math.random() * 3.3
      };
    }
  },
  
  // MPU6050加速度计/陀螺仪
  MPU6050: {
    addresses: [0x68, 0x69],
    read: async (bus, address) => {
      // 实际项目中应该实现真正的MPU6050读取逻辑
      return {
        accelerometer: {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1
        },
        gyroscope: {
          x: Math.random() * 250 - 125,
          y: Math.random() * 250 - 125,
          z: Math.random() * 250 - 125
        },
        temperature: 25 + Math.random() * 5
      };
    }
  }
};

class I2cManager {
  constructor(logger) {
    this.logger = logger || console;
    this.buses = {}; // 存储打开的I2C总线
    this.devices = {}; // 存储已配置的I2C设备
  }
  
  /**
   * 获取I2C总线
   * @param {number} busNumber - 总线号
   * @returns {Object} I2C总线对象
   */
  async getBus(busNumber) {
    if (!i2c) {
      throw new Error('I2C功能不可用');
    }
    
    if (!this.buses[busNumber]) {
      try {
        this.buses[busNumber] = await i2c.openPromisified(busNumber);
        this.logger.info(`已打开I2C总线 ${busNumber}`);
      } catch (error) {
        this.logger.error(`打开I2C总线 ${busNumber} 失败: ${error.message}`);
        throw new Error(`无法打开I2C总线 ${busNumber}: ${error.message}`);
      }
    }
    
    return this.buses[busNumber];
  }
  
  /**
   * 扫描I2C总线上的设备
   * @param {number} busNumber - 总线号
   * @returns {Array} 发现的设备列表
   */
  async scanBus(busNumber) {
    this.logger.info(`扫描I2C总线 ${busNumber}`);
    
    if (!i2c) {
      // 如果I2C不可用，返回模拟数据
      this.logger.warn('I2C功能不可用，返回模拟数据');
      return this._mockScanResults();
    }
    
    try {
      const bus = await this.getBus(busNumber);
      const devices = [];
      
      // 扫描所有可能的I2C地址 (0x03-0x77)
      for (let addr = 0x03; addr <= 0x77; addr++) {
        try {
          await bus.i2cRead(addr, 1, Buffer.alloc(1));
          
          // 找到设备，尝试识别类型
          const deviceInfo = this._identifyDevice(addr);
          devices.push({
            address: `0x${addr.toString(16).padStart(2, '0')}`,
            type: deviceInfo.type,
            description: deviceInfo.description
          });
          
          this.logger.info(`在地址 0x${addr.toString(16)} 发现I2C设备: ${deviceInfo.type}`);
        } catch (error) {
          // 地址上没有设备，继续扫描
        }
      }
      
      return devices;
    } catch (error) {
      this.logger.error(`扫描I2C总线失败: ${error.message}`);
      return this._mockScanResults();
    }
  }
  
  /**
   * 识别I2C设备类型
   * @param {number} address - I2C地址
   * @returns {Object} 设备信息
   */
  _identifyDevice(address) {
    // 根据地址尝试识别设备类型
    for (const [type, info] of Object.entries(I2C_DEVICE_TYPES)) {
      if (info.addresses.includes(address)) {
        return {
          type,
          description: this._getDeviceDescription(type)
        };
      }
    }
    
    // 未识别的设备
    return {
      type: 'Unknown',
      description: '未知设备'
    };
  }
  
  /**
   * 获取设备描述
   * @param {string} type - 设备类型
   * @returns {string} 设备描述
   */
  _getDeviceDescription(type) {
    const descriptions = {
      BME280: '温湿度气压传感器',
      BH1750: '光照传感器',
      DS3231: '实时时钟',
      SSD1306: 'OLED显示屏',
      PCA9685: 'PWM控制器',
      ADS1115: 'ADC转换器',
      MPU6050: '加速度计/陀螺仪'
    };
    
    return descriptions[type] || '未知设备';
  }
  
  /**
   * 生成模拟扫描结果
   * @returns {Array} 模拟的设备列表
   */
  _mockScanResults() {
    // 返回一些模拟的I2C设备
    return [
      { address: '0x76', type: 'BME280', description: '温湿度气压传感器' },
      { address: '0x23', type: 'BH1750', description: '光照传感器' },
      { address: '0x68', type: 'DS3231', description: '实时时钟' }
    ];
  }
  
  /**
   * 添加I2C设备
   * @param {number} busNumber - 总线号
   * @param {string} address - 设备地址
   * @param {string} type - 设备类型
   * @returns {Object} 设备信息
   */
  addDevice(busNumber, address, type) {
    const deviceId = `${busNumber}-${address}`;
    
    this.devices[deviceId] = {
      id: deviceId,
      busNumber,
      address,
      type,
      description: this._getDeviceDescription(type),
      addedAt: new Date()
    };
    
    this.logger.info(`添加I2C设备: ${type} 在总线 ${busNumber}, 地址 ${address}`);
    return this.devices[deviceId];
  }
  
  /**
   * 读取I2C设备数据
   * @param {number} busNumber - 总线号
   * @param {string} address - 设备地址
   * @param {string} type - 设备类型
   * @returns {Object} 读取的数据
   */
  async readDevice(busNumber, address, type) {
    this.logger.info(`读取I2C设备: ${type} 在总线 ${busNumber}, 地址 ${address}`);
    
    if (!i2c) {
      // 如果I2C不可用，返回模拟数据
      return this._mockReadDevice(type);
    }
    
    try {
      // 标准化地址格式
      const addrNum = typeof address === 'string' && address.startsWith('0x')
        ? parseInt(address, 16)
        : parseInt(address, 10);
      
      // 获取总线
      const bus = await this.getBus(busNumber);
      
      // 如果有针对该设备类型的读取方法，使用它
      if (I2C_DEVICE_TYPES[type] && I2C_DEVICE_TYPES[type].read) {
        return await I2C_DEVICE_TYPES[type].read(bus, addrNum);
      }
      
      // 否则尝试通用读取
      const buffer = Buffer.alloc(32); // 分配32字节的缓冲区
      const bytesRead = await bus.i2cRead(addrNum, buffer.length, buffer);
      
      return {
        raw: Array.from(buffer.slice(0, bytesRead)),
        bytesRead
      };
    } catch (error) {
      this.logger.error(`读取I2C设备失败: ${error.message}`);
      return this._mockReadDevice(type);
    }
  }
  
  /**
   * 模拟读取I2C设备
   * @param {string} type - 设备类型
   * @returns {Object} 模拟数据
   */
  _mockReadDevice(type) {
    this.logger.warn(`使用模拟数据代替I2C设备 ${type} 的实际读取`);
    
    if (I2C_DEVICE_TYPES[type] && I2C_DEVICE_TYPES[type].read) {
      return I2C_DEVICE_TYPES[type].read(null, null);
    }
    
    // 默认模拟数据
    return {
      timestamp: new Date(),
      value: Math.random() * 100,
      mock: true
    };
  }
  
  /**
   * 写入I2C设备
   * @param {number} busNumber - 总线号
   * @param {string} address - 设备地址
   * @param {Array|Object} values - 要写入的值
   * @returns {boolean} 是否成功
   */
  async writeDevice(busNumber, address, values) {
    this.logger.info(`写入I2C设备: 总线 ${busNumber}, 地址 ${address}`);
    
    if (!i2c) {
      this.logger.warn('I2C功能不可用，模拟写入成功');
      return true;
    }
    
    try {
      // 标准化地址格式
      const addrNum = typeof address === 'string' && address.startsWith('0x')
        ? parseInt(address, 16)
        : parseInt(address, 10);
      
      // 获取总线
      const bus = await this.getBus(busNumber);
      
      // 如果值是数组，将其转换为Buffer
      if (Array.isArray(values)) {
        const buffer = Buffer.from(values);
        await bus.i2cWrite(addrNum, buffer.length, buffer);
      } 
      // 如果值是对象，根据寄存器写入
      else if (typeof values === 'object') {
        for (const [register, value] of Object.entries(values)) {
          const regNum = typeof register === 'string' && register.startsWith('0x')
            ? parseInt(register, 16)
            : parseInt(register, 10);
          
          const buffer = Buffer.alloc(2);
          buffer[0] = regNum;
          buffer[1] = value;
          
          await bus.i2cWrite(addrNum, buffer.length, buffer);
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error(`写入I2C设备失败: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 获取所有已配置的I2C设备
   * @returns {Array} 设备列表
   */
  getAllDevices() {
    return Object.values(this.devices);
  }
  
  /**
   * 关闭所有I2C总线
   */
  async closeAll() {
    for (const [busNumber, bus] of Object.entries(this.buses)) {
      try {
        await bus.close();
        this.logger.info(`已关闭I2C总线 ${busNumber}`);
      } catch (error) {
        this.logger.error(`关闭I2C总线 ${busNumber} 失败: ${error.message}`);
      }
    }
    
    this.buses = {};
  }
}

module.exports = I2cManager; 