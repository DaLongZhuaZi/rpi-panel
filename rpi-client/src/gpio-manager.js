const winston = require('winston');
const { Gpio } = require('onoff');

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'gpio-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'gpio.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * 树莓派GPIO管理器
 */
class GPIOManager {
  constructor() {
    // 存储已配置的GPIO引脚
    this.pins = {};
    
    // 引脚方向模式映射
    this.directionModes = {
      'in': 'in',
      'out': 'out',
      'input': 'in',
      'output': 'out'
    };
    
    // 上拉下拉电阻模式映射
    this.pullModes = {
      'up': 'up',
      'down': 'down',
      'none': 'none',
      'pullup': 'up',
      'pulldown': 'down'
    };
  }
  
  /**
   * 初始化GPIO管理器
   */
  async initialize() {
    logger.info('初始化GPIO管理器');
    
    // 检查onoff模块兼容性
    try {
      const testPin = new Gpio(4, 'in');
      testPin.unexport();
      logger.info('GPIO检查通过');
    } catch (error) {
      // 检查是否在树莓派上运行，如果不是，就使用模拟模式
      if (error.code === 'ENOENT') {
        logger.warn('检测到非树莓派环境，将使用模拟GPIO模式');
        this.simulationMode = true;
      } else {
        throw new Error(`GPIO初始化失败: ${error.message}`);
      }
    }
    
    return true;
  }
  
  /**
   * 设置GPIO引脚
   * @param {number} pinNumber - 引脚号
   * @param {string} mode - 模式 ('in'/'out')
   * @param {Object} options - 配置选项
   * @returns {Promise<Object>} 引脚信息
   */
  async setupPin(pinNumber, mode, options = {}) {
    const pin = parseInt(pinNumber, 10);
    
    if (isNaN(pin) || pin < 0) {
      throw new Error(`无效的引脚号: ${pinNumber}`);
    }
    
    // 转换为onoff支持的模式
    const direction = this.directionModes[mode.toLowerCase()];
    if (!direction) {
      throw new Error(`不支持的GPIO模式: ${mode}`);
    }
    
    // 处理配置选项
    const pullUpDown = this.pullModes[options.pullUpDown?.toLowerCase()] || 'none';
    const initialState = options.initialState === 1 || options.initialState === true ? 1 : 0;
    
    // 如果引脚已经配置，先释放
    if (this.pins[pin]) {
      await this.releasePin(pin);
    }
    
    try {
      // 在模拟模式下，只记录操作
      if (this.simulationMode) {
        this.pins[pin] = {
          pin,
          direction,
          value: direction === 'in' ? 0 : initialState,
          pullUpDown,
          alias: options.alias || `PIN${pin}`,
          simulated: true
        };
        
        logger.info(`已配置模拟GPIO引脚 ${pin} 为 ${direction} 模式, 上拉/下拉: ${pullUpDown}, 初始值: ${initialState}`);
      } else {
        // 在真实模式下，配置物理GPIO
        const gpioObject = new Gpio(pin, direction, 'none', { activeLow: false });
        
        // 如果是输出模式，设置初始值
        if (direction === 'out') {
          await gpioObject.write(initialState);
        }
        
        // 存储引脚对象和配置
        this.pins[pin] = {
          pin,
          direction,
          gpioObject,
          value: direction === 'in' ? await gpioObject.read() : initialState,
          pullUpDown,
          alias: options.alias || `PIN${pin}`
        };
        
        logger.info(`已配置GPIO引脚 ${pin} 为 ${direction} 模式, 上拉/下拉: ${pullUpDown}, 初始值: ${initialState}`);
      }
      
      return {
        pin,
        mode: direction,
        value: this.pins[pin].value,
        pullUpDown,
        alias: this.pins[pin].alias
      };
    } catch (error) {
      logger.error(`配置GPIO引脚 ${pin} 失败: ${error.message}`);
      throw new Error(`配置GPIO引脚失败: ${error.message}`);
    }
  }
  
  /**
   * 写入GPIO引脚值
   * @param {number} pinNumber - 引脚号
   * @param {number|boolean} value - 值 (0/1 或 false/true)
   * @returns {Promise<number>} 写入的值
   */
  async writePin(pinNumber, value) {
    const pin = parseInt(pinNumber, 10);
    
    if (!this.pins[pin]) {
      throw new Error(`引脚 ${pin} 未配置`);
    }
    
    if (this.pins[pin].direction !== 'out') {
      throw new Error(`引脚 ${pin} 不是输出模式`);
    }
    
    // 转换值为0或1
    const writeValue = value === 1 || value === true ? 1 : 0;
    
    try {
      // 在模拟模式下，只记录操作
      if (this.simulationMode || this.pins[pin].simulated) {
        this.pins[pin].value = writeValue;
        logger.info(`已写入模拟GPIO引脚 ${pin} 值: ${writeValue}`);
      } else {
        // 在真实模式下，写入物理GPIO
        await this.pins[pin].gpioObject.write(writeValue);
        this.pins[pin].value = writeValue;
        logger.info(`已写入GPIO引脚 ${pin} 值: ${writeValue}`);
      }
      
      return writeValue;
    } catch (error) {
      logger.error(`写入GPIO引脚 ${pin} 失败: ${error.message}`);
      throw new Error(`写入GPIO失败: ${error.message}`);
    }
  }
  
  /**
   * 读取GPIO引脚值
   * @param {number} pinNumber - 引脚号
   * @returns {Promise<number>} 读取的值
   */
  async readPin(pinNumber) {
    const pin = parseInt(pinNumber, 10);
    
    if (!this.pins[pin]) {
      throw new Error(`引脚 ${pin} 未配置`);
    }
    
    try {
      let value;
      
      // 在模拟模式下，返回存储的值
      if (this.simulationMode || this.pins[pin].simulated) {
        value = this.pins[pin].value;
        
        // 如果是输入引脚，生成随机值模拟读取
        if (this.pins[pin].direction === 'in') {
          value = Math.round(Math.random());
          this.pins[pin].value = value;
        }
        
        logger.info(`已读取模拟GPIO引脚 ${pin} 值: ${value}`);
      } else {
        // 在真实模式下，读取物理GPIO
        value = await this.pins[pin].gpioObject.read();
        this.pins[pin].value = value;
        logger.info(`已读取GPIO引脚 ${pin} 值: ${value}`);
      }
      
      return value;
    } catch (error) {
      logger.error(`读取GPIO引脚 ${pin} 失败: ${error.message}`);
      throw new Error(`读取GPIO失败: ${error.message}`);
    }
  }
  
  /**
   * 释放GPIO引脚
   * @param {number} pinNumber - 引脚号
   * @returns {Promise<boolean>} 成功标志
   */
  async releasePin(pinNumber) {
    const pin = parseInt(pinNumber, 10);
    
    if (!this.pins[pin]) {
      return true; // 引脚未配置，视为释放成功
    }
    
    try {
      // 在模拟模式下，只删除记录
      if (this.simulationMode || this.pins[pin].simulated) {
        delete this.pins[pin];
        logger.info(`已释放模拟GPIO引脚 ${pin}`);
      } else {
        // 在真实模式下，释放物理GPIO
        await this.pins[pin].gpioObject.unexport();
        delete this.pins[pin];
        logger.info(`已释放GPIO引脚 ${pin}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`释放GPIO引脚 ${pin} 失败: ${error.message}`);
      throw new Error(`释放GPIO失败: ${error.message}`);
    }
  }
  
  /**
   * 获取所有引脚状态
   * @returns {Promise<Array>} 引脚状态数组
   */
  async getAllPinStatus() {
    const pinStatus = [];
    
    for (const pinNumber in this.pins) {
      try {
        const pin = this.pins[pinNumber];
        
        // 如果是输入引脚，获取当前值
        if (pin.direction === 'in' && !this.simulationMode && !pin.simulated) {
          pin.value = await pin.gpioObject.read();
        }
        
        pinStatus.push({
          pin: parseInt(pinNumber, 10),
          mode: pin.direction,
          value: pin.value,
          pullUpDown: pin.pullUpDown,
          alias: pin.alias
        });
      } catch (error) {
        logger.error(`获取引脚 ${pinNumber} 状态失败: ${error.message}`);
      }
    }
    
    return pinStatus;
  }
  
  /**
   * 清理所有GPIO资源
   * @returns {Promise<boolean>} 成功标志
   */
  async cleanup() {
    logger.info('正在清理GPIO资源');
    
    const pins = Object.keys(this.pins);
    for (const pinNumber of pins) {
      try {
        await this.releasePin(pinNumber);
      } catch (error) {
        logger.error(`清理GPIO引脚 ${pinNumber} 失败: ${error.message}`);
      }
    }
    
    logger.info('GPIO资源清理完成');
    return true;
  }
}

module.exports = GPIOManager; 