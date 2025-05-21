import { exec } from 'child_process';
import { promisify } from 'util';

// 创建一个安全的 promisify 包装
function safePromisify(fn: any): (...args: any[]) => Promise<any> {
  if (typeof fn !== 'function') {
    // 如果不是函数，创建一个模拟函数用于开发环境
    return (...args: any[]) => Promise.resolve({ stdout: '', stderr: '' });
  }
  return promisify(fn);
}

const execAsync = safePromisify(exec);

export interface I2CDevice {
  busNumber: number;
  address: number;
  name: string;
  description?: string;
}

export interface I2CSensorData {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  light?: number;
  [key: string]: any;
}

export class I2CInterface {
  private static instance: I2CInterface;
  private connectedDevices: Map<string, I2CDevice>;
  private isRaspberryPi: boolean | null = null;
  private i2cBusAvailable: boolean | null = null;

  private constructor() {
    this.connectedDevices = new Map();
  }

  public static getInstance(): I2CInterface {
    if (!I2CInterface.instance) {
      I2CInterface.instance = new I2CInterface();
    }
    return I2CInterface.instance;
  }

  /**
   * 检查是否在树莓派环境中运行
   */
  public async checkIsRaspberryPi(): Promise<boolean> {
    if (this.isRaspberryPi !== null) {
      return this.isRaspberryPi;
    }

    try {
      // 检查平台类型
      if (process.platform === 'win32') {
        console.log('Running on Windows, I2C features will be simulated');
        this.isRaspberryPi = false;
        return false;
      }

      // 检查/proc/cpuinfo中是否包含Raspberry Pi特定信息
      const { stdout } = await execAsync('cat /proc/cpuinfo | grep "Raspberry Pi"');
      this.isRaspberryPi = stdout.length > 0;
      return this.isRaspberryPi;
    } catch (error) {
      console.error('Failed to check if running on Raspberry Pi:', error);
      this.isRaspberryPi = false;
      return false;
    }
  }

  /**
   * 检查I2C总线是否可用
   */
  public async checkI2CBusAvailable(): Promise<boolean> {
    if (this.i2cBusAvailable !== null) {
      return this.i2cBusAvailable;
    }

    try {
      // 检查是否在树莓派上运行
      const isRpi = await this.checkIsRaspberryPi();
      if (!isRpi) {
        this.i2cBusAvailable = false;
        return false;
      }

      // 检查I2C设备文件是否存在
      const { stdout: i2cDev } = await execAsync('ls /dev/i2c-* 2>/dev/null || echo ""');
      this.i2cBusAvailable = i2cDev.trim().length > 0;
      
      // 如果没有I2C设备文件，尝试加载I2C内核模块
      if (!this.i2cBusAvailable) {
        await execAsync('sudo modprobe i2c-dev');
        const { stdout: checkAgain } = await execAsync('ls /dev/i2c-* 2>/dev/null || echo ""');
        this.i2cBusAvailable = checkAgain.trim().length > 0;
      }
      
      return this.i2cBusAvailable;
    } catch (error) {
      console.error('Failed to check I2C bus availability:', error);
      this.i2cBusAvailable = false;
      return false;
    }
  }

  /**
   * 扫描I2C总线上的设备
   */
  public async scanI2CDevices(busNumber = 1): Promise<number[]> {
    try {
      const isAvailable = await this.checkI2CBusAvailable();
      if (!isAvailable) {
        console.log('I2C bus is not available, returning simulated data');
        // 返回一些模拟的I2C地址
        return [0x23, 0x27, 0x76, 0x68];
      }

      const { stdout } = await execAsync(`i2cdetect -y ${busNumber} | grep -v "^   " | grep -o "[0-9a-f][0-9a-f]" | grep -v -- "--"`);
      return stdout.trim().split('\n').map((addr: string) => parseInt(addr, 16));
    } catch (error) {
      console.error(`Failed to scan I2C devices on bus ${busNumber}:`, error);
      // 返回一些模拟的I2C地址
      return [0x23, 0x27, 0x76, 0x68];
    }
  }

  /**
   * 添加I2C设备到已连接设备列表
   */
  public addDevice(device: I2CDevice): void {
    const deviceId = `${device.busNumber}-${device.address.toString(16)}`;
    this.connectedDevices.set(deviceId, device);
  }

  /**
   * 获取所有已连接的I2C设备
   */
  public getConnectedDevices(): I2CDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * 从连接的设备中读取数据
   * 根据设备类型执行不同的读取命令
   */
  public async readFromDevice(busNumber: number, address: number): Promise<I2CSensorData> {
    try {
      const isAvailable = await this.checkI2CBusAvailable();
      if (!isAvailable) {
        console.log('I2C bus is not available, returning simulated data');
        const deviceId = `${busNumber}-${address.toString(16)}`;
        const device = this.connectedDevices.get(deviceId);
        if (device) {
          return this.mockReadSensorData(device.name);
        }
        return this.mockReadSensorData('unknown');
      }

      // 检测设备类型并执行相应的读取逻辑
      // 这里以BME280传感器为例 (温度、湿度、气压)
      const deviceId = `${busNumber}-${address.toString(16)}`;
      const device = this.connectedDevices.get(deviceId);
      
      if (!device) {
        throw new Error(`Device not found: bus ${busNumber}, address 0x${address.toString(16)}`);
      }

      // 实际应用中需要根据不同设备类型实现不同的读取逻辑
      if (device.name.includes('BME280')) {
        // 使用i2c-tools读取BME280传感器数据
        const data: I2CSensorData = {};
        
        // 温度
        const { stdout: tempData } = await execAsync(`i2cget -y ${busNumber} 0x${address.toString(16)} 0xFA w`);
        const rawTemp = parseInt(tempData, 16);
        data.temperature = this.calculateBME280Temperature(rawTemp);
        
        // 湿度
        const { stdout: humData } = await execAsync(`i2cget -y ${busNumber} 0x${address.toString(16)} 0xFD w`);
        const rawHum = parseInt(humData, 16);
        data.humidity = this.calculateBME280Humidity(rawHum);
        
        // 气压
        const { stdout: presData } = await execAsync(`i2cget -y ${busNumber} 0x${address.toString(16)} 0xF7 w`);
        const rawPres = parseInt(presData, 16);
        data.pressure = this.calculateBME280Pressure(rawPres);
        
        return data;
      }
      
      // BH1750光照传感器
      if (device.name.includes('BH1750')) {
        const { stdout: lightData } = await execAsync(`i2cget -y ${busNumber} 0x${address.toString(16)} 0x23 w`);
        const rawLight = parseInt(lightData, 16);
        return { light: rawLight / 1.2 }; // 转换为lux
      }

      // 如果是未知设备，尝试通用读取
      const { stdout: genericData } = await execAsync(`i2cdump -y ${busNumber} 0x${address.toString(16)} b`);
      return { rawData: genericData };
    } catch (error) {
      console.error(`Failed to read from I2C device (bus ${busNumber}, address 0x${address.toString(16)}):`, error);
      // 返回模拟数据
      const deviceId = `${busNumber}-${address.toString(16)}`;
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        return this.mockReadSensorData(device.name);
      }
      return this.mockReadSensorData('unknown');
    }
  }

  /**
   * 向I2C设备写入数据
   */
  public async writeToDevice(busNumber: number, address: number, register: number, value: number): Promise<void> {
    try {
      const isAvailable = await this.checkI2CBusAvailable();
      if (!isAvailable) {
        console.log('I2C bus is not available, simulating write operation');
        return; // 模拟写入成功
      }

      await execAsync(`i2cset -y ${busNumber} 0x${address.toString(16)} 0x${register.toString(16)} 0x${value.toString(16)}`);
    } catch (error) {
      console.error(`Failed to write to I2C device (bus ${busNumber}, address 0x${address.toString(16)}):`, error);
      // 在非树莓派环境中，不抛出错误
      if (await this.checkIsRaspberryPi()) {
        throw error;
      }
    }
  }

  /**
   * 温度计算函数 (BME280)
   * 注意：这是简化版，真实实现需要根据BME280的校准值进行更复杂的计算
   */
  private calculateBME280Temperature(rawValue: number): number {
    // 简化计算，真实实现需要更复杂的计算和校准值
    return (rawValue / 100).toFixed(1) as unknown as number;
  }

  /**
   * 湿度计算函数 (BME280)
   */
  private calculateBME280Humidity(rawValue: number): number {
    // 简化计算
    return (rawValue / 1024).toFixed(1) as unknown as number;
  }

  /**
   * 气压计算函数 (BME280)
   */
  private calculateBME280Pressure(rawValue: number): number {
    // 简化计算
    return (rawValue / 256).toFixed(1) as unknown as number;
  }

  /**
   * 模拟读取数据（开发环境使用）
   */
  public mockReadSensorData(deviceType: string): I2CSensorData {
    if (deviceType.includes('BME280')) {
      return {
        temperature: 22 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        pressure: 1000 + Math.random() * 15
      };
    }
    
    if (deviceType.includes('BH1750')) {
      return {
        light: 200 + Math.random() * 800
      };
    }
    
    return {
      value: Math.random() * 100
    };
  }
} 