// 使用条件导入，在浏览器环境中使用模拟模块
import { childProcess, util } from './browser-mocks';

/**
 * I2C设备类型定义
 */
export interface I2CDevice {
  address: string;
  type: string;
  description: string;
}

/**
 * I2C传感器数据
 */
export interface I2CSensorData {
  [key: string]: number | string | object;
}

/**
 * I2C设备类型映射
 */
const I2C_DEVICE_TYPES: Record<string, { description: string }> = {
  'BME280': { description: '温湿度气压传感器' },
  'BH1750': { description: '光照传感器' },
  'DS3231': { description: '实时时钟' },
  'SSD1306': { description: 'OLED显示屏' },
  'PCA9685': { description: 'PWM控制器' },
  'ADS1115': { description: 'ADC转换器' },
  'MPU6050': { description: '加速度计/陀螺仪' }
};

/**
 * I2C接口类
 * 用于与I2C设备进行交互
 */
export class I2CInterface {
  private execPromise: any;

  constructor() {
    this.execPromise = util.promisify(childProcess.exec);
  }

  /**
   * 扫描I2C总线上的设备
   * @param busNumber 总线号
   */
  async scanBus(busNumber: number = 1): Promise<I2CDevice[]> {
    if (typeof window !== 'undefined') {
      // 在浏览器环境中返回模拟数据
      return [
        { address: '0x76', type: 'BME280', description: '温湿度气压传感器' },
        { address: '0x23', type: 'BH1750', description: '光照传感器' },
        { address: '0x68', type: 'DS3231', description: '实时时钟' }
      ];
    }
    
    try {
      const { stdout } = await this.execPromise(`i2cdetect -y ${busNumber}`);
      const devices: I2CDevice[] = [];
      
      // 解析 i2cdetect 的输出，提取设备地址
      const lines = stdout.split('\n').slice(1); // 跳过标题行
      for (const line of lines) {
        const parts = line.trim().split(':');
        if (parts.length !== 2) continue;
        
        const rowPrefix = parts[0].trim();
        const addresses = parts[1].trim().split(' ').filter(Boolean);
        
        for (const addr of addresses) {
          if (addr !== '--') {
            const hexAddr = `0x${rowPrefix}${addr}`;
            const device = this.identifyDevice(hexAddr);
            devices.push(device);
          }
        }
      }
      
      return devices;
    } catch (error) {
      console.error(`扫描I2C总线失败: ${error}`);
      return [];
    }
  }

  /**
   * 识别I2C设备类型
   * @param address 设备地址
   */
  private identifyDevice(address: string): I2CDevice {
    // 根据地址尝试识别设备类型
    // 实际项目中可以扩展这个逻辑
    let type = 'Unknown';
    let description = '未知设备';
    
    if (address === '0x76' || address === '0x77') {
      type = 'BME280';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x23' || address === '0x5C') {
      type = 'BH1750';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x68') {
      type = 'DS3231';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x3C' || address === '0x3D') {
      type = 'SSD1306';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x40') {
      type = 'PCA9685';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x48' || address === '0x49' || address === '0x4A' || address === '0x4B') {
      type = 'ADS1115';
      description = I2C_DEVICE_TYPES[type].description;
    } else if (address === '0x68' || address === '0x69') {
      type = 'MPU6050';
      description = I2C_DEVICE_TYPES[type].description;
    }
    
    return { address, type, description };
  }

  /**
   * 读取I2C设备数据
   * @param busNumber 总线号
   * @param address 设备地址
   * @param sensorType 传感器类型
   */
  async readDevice(busNumber: number, address: string, sensorType: string): Promise<I2CSensorData> {
    if (typeof window !== 'undefined') {
      // 在浏览器环境中返回模拟数据
      switch (sensorType) {
        case 'BME280':
          return {
            temperature: 25 + Math.random() * 5,
            humidity: 50 + Math.random() * 20,
            pressure: 1000 + Math.random() * 20
          };
        case 'BH1750':
          return {
            light: 500 + Math.random() * 500
          };
        case 'DS3231':
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
        case 'MPU6050':
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
        default:
          return {
            value: Math.random() * 100,
            timestamp: new Date().toISOString()
          };
      }
    }
    
    try {
      // 实际项目中应该实现针对不同设备类型的读取逻辑
      // 这里只是一个简单的示例
      const addrNum = parseInt(address.replace('0x', ''), 16);
      const { stdout } = await this.execPromise(`i2cget -y ${busNumber} ${addrNum} 0x00 w`);
      
      // 解析读取的数据
      // 实际项目中需要根据设备类型进行特定解析
      const value = parseInt(stdout.trim(), 16);
      
      return {
        value,
        raw: stdout.trim(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`读取I2C设备失败: ${error}`);
      return {
        error: `读取失败: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 写入I2C设备
   * @param busNumber 总线号
   * @param address 设备地址
   * @param register 寄存器地址
   * @param value 值
   */
  async writeDevice(busNumber: number, address: string, register: number, value: number): Promise<boolean> {
    if (typeof window !== 'undefined') {
      console.log(`模拟写入I2C设备: 总线 ${busNumber}, 地址 ${address}, 寄存器 ${register}, 值 ${value}`);
      return true;
    }
    
    try {
      const addrNum = parseInt(address.replace('0x', ''), 16);
      await this.execPromise(`i2cset -y ${busNumber} ${addrNum} ${register} ${value}`);
      return true;
    } catch (error) {
      console.error(`写入I2C设备失败: ${error}`);
      return false;
    }
  }
} 