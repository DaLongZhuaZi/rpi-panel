import { GPIOInterface, GPIOPinConfig, GPIOPinStatus } from '../hardware/gpio-interface';
import { I2CInterface, I2CDevice, I2CSensorData } from '../hardware/i2c-interface';

export type HardwareStatus = {
  isRaspberryPi: boolean;
  gpioAvailable: boolean;
  i2cAvailable: boolean;
  gpioConfiguredPins: number;
  i2cConnectedDevices: number;
  systemInfo?: Record<string, string>;
};

export type I2CDeviceReading = {
  device: I2CDevice;
  data: I2CSensorData;
  timestamp: number;
  error?: string;
};

export class HardwareService {
  private static instance: HardwareService;
  private gpioInterface: GPIOInterface;
  private i2cInterface: I2CInterface;
  private deviceReadings: Map<string, I2CDeviceReading[]> = new Map();
  private readingInterval: NodeJS.Timeout | null = null;
  private isDevMode: boolean;

  private constructor() {
    this.gpioInterface = GPIOInterface.getInstance();
    this.i2cInterface = I2CInterface.getInstance();
    this.isDevMode = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): HardwareService {
    if (!HardwareService.instance) {
      HardwareService.instance = new HardwareService();
    }
    return HardwareService.instance;
  }

  /**
   * 初始化硬件服务
   */
  public async initialize(): Promise<HardwareStatus> {
    // 检查系统环境
    const isRaspberryPi = await this.i2cInterface.checkIsRaspberryPi();
    const gpioAvailable = await this.gpioInterface.checkGPIOAvailable();
    const i2cAvailable = await this.i2cInterface.checkI2CBusAvailable();

    // 获取系统信息
    let systemInfo: Record<string, string> | undefined;
    if (isRaspberryPi) {
      systemInfo = await this.getSystemInfo();
    }

    return {
      isRaspberryPi,
      gpioAvailable,
      i2cAvailable,
      gpioConfiguredPins: 0,
      i2cConnectedDevices: 0,
      systemInfo
    };
  }

  /**
   * 获取树莓派系统信息
   */
  private async getSystemInfo(): Promise<Record<string, string>> {
    if (this.isDevMode) {
      return {
        model: 'Raspberry Pi 4 Model B Rev 1.2',
        cpuTemp: '45.8°C',
        cpuLoad: '0.52, 0.48, 0.42',
        memoryUsage: '512MB/4GB',
        uptime: '5 days, 3 hours',
        kernelVersion: '5.15.32-v8+'
      };
    }

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const [modelCmd, tempCmd, uptimeCmd, kernelCmd, memCmd] = await Promise.all([
        execAsync('cat /proc/device-tree/model'),
        execAsync("vcgencmd measure_temp | cut -d'=' -f2"),
        execAsync('uptime -p'),
        execAsync('uname -r'),
        execAsync("free -h | grep 'Mem:' | awk '{print $3\"/\"$2}'")
      ]);

      return {
        model: modelCmd.stdout.trim(),
        cpuTemp: tempCmd.stdout.trim(),
        uptime: uptimeCmd.stdout.trim().replace('up ', ''),
        kernelVersion: kernelCmd.stdout.trim(),
        memoryUsage: memCmd.stdout.trim()
      };
    } catch (error) {
      console.error('Failed to get system info:', error);
      return {
        model: 'Unknown',
        error: 'Failed to get system info'
      };
    }
  }

  /**
   * 扫描I2C总线上的设备
   */
  public async scanI2CDevices(busNumber = 1): Promise<number[]> {
    if (this.isDevMode) {
      // 模拟一些I2C设备地址
      return [0x23, 0x76, 0x68];
    }
    return await this.i2cInterface.scanI2CDevices(busNumber);
  }

  /**
   * 配置I2C设备
   */
  public configureI2CDevice(device: I2CDevice): void {
    this.i2cInterface.addDevice(device);
  }

  /**
   * 获取所有配置的I2C设备
   */
  public getConfiguredI2CDevices(): I2CDevice[] {
    return this.i2cInterface.getConnectedDevices();
  }

  /**
   * 读取I2C设备数据
   */
  public async readI2CDevice(busNumber: number, address: number): Promise<I2CSensorData> {
    try {
      if (this.isDevMode) {
        const devices = this.i2cInterface.getConnectedDevices();
        const device = devices.find(d => d.busNumber === busNumber && d.address === address);
        if (!device) {
          throw new Error('Device not found');
        }
        return this.i2cInterface.mockReadSensorData(device.name);
      }
      return await this.i2cInterface.readFromDevice(busNumber, address);
    } catch (error) {
      console.error(`Failed to read from I2C device (${busNumber}, 0x${address.toString(16)}):`, error);
      throw error;
    }
  }

  /**
   * 开始周期性读取I2C设备数据
   * @param intervalMs 读取间隔(毫秒)
   * @param maxReadings 每个设备保存的最大读数数量
   */
  public startPeriodicReading(intervalMs = 5000, maxReadings = 100): void {
    if (this.readingInterval) {
      clearInterval(this.readingInterval);
    }

    this.readingInterval = setInterval(async () => {
      const devices = this.i2cInterface.getConnectedDevices();
      
      for (const device of devices) {
        try {
          const deviceId = `${device.busNumber}-${device.address.toString(16)}`;
          let data: I2CSensorData;
          
          if (this.isDevMode) {
            data = this.i2cInterface.mockReadSensorData(device.name);
          } else {
            data = await this.i2cInterface.readFromDevice(device.busNumber, device.address);
          }

          // 保存读取的数据
          if (!this.deviceReadings.has(deviceId)) {
            this.deviceReadings.set(deviceId, []);
          }

          const readings = this.deviceReadings.get(deviceId)!;
          readings.push({
            device,
            data,
            timestamp: Date.now()
          });

          // 限制保存的数据量
          if (readings.length > maxReadings) {
            readings.shift();
          }
        } catch (error) {
          console.error(`Failed to read from device ${device.name}:`, error);
          
          // 记录错误
          const deviceId = `${device.busNumber}-${device.address.toString(16)}`;
          if (!this.deviceReadings.has(deviceId)) {
            this.deviceReadings.set(deviceId, []);
          }
          
          const readings = this.deviceReadings.get(deviceId)!;
          readings.push({
            device,
            data: {},
            timestamp: Date.now(),
            error: `读取失败: ${error}`
          });
        }
      }
    }, intervalMs);
  }

  /**
   * 停止周期性读取
   */
  public stopPeriodicReading(): void {
    if (this.readingInterval) {
      clearInterval(this.readingInterval);
      this.readingInterval = null;
    }
  }

  /**
   * 获取设备的历史读数
   */
  public getDeviceReadings(busNumber: number, address: number): I2CDeviceReading[] {
    const deviceId = `${busNumber}-${address.toString(16)}`;
    return this.deviceReadings.get(deviceId) || [];
  }

  /**
   * 获取所有设备的最新读数
   */
  public getAllLatestReadings(): I2CDeviceReading[] {
    const result: I2CDeviceReading[] = [];
    
    for (const [deviceId, readings] of this.deviceReadings.entries()) {
      if (readings.length > 0) {
        result.push(readings[readings.length - 1]);
      }
    }
    
    return result;
  }

  /**
   * 配置GPIO引脚
   */
  public async configureGPIOPin(config: GPIOPinConfig): Promise<boolean> {
    if (this.isDevMode) {
      return true;
    }
    return await this.gpioInterface.setupPin(config);
  }

  /**
   * 写入GPIO引脚
   */
  public async writeGPIOPin(pin: number, value: 0 | 1): Promise<boolean> {
    if (this.isDevMode) {
      return this.gpioInterface.mockWritePin(pin, value);
    }
    return await this.gpioInterface.writePin(pin, value);
  }

  /**
   * 读取GPIO引脚
   */
  public async readGPIOPin(pin: number): Promise<0 | 1 | null> {
    if (this.isDevMode) {
      return this.gpioInterface.mockReadPin(pin);
    }
    return await this.gpioInterface.readPin(pin);
  }

  /**
   * 获取所有GPIO引脚状态
   */
  public async getAllGPIOPinStatus(): Promise<GPIOPinStatus[]> {
    return await this.gpioInterface.getAllPinStatus();
  }

  /**
   * 释放GPIO引脚
   */
  public async releaseGPIOPin(pin: number): Promise<boolean> {
    if (this.isDevMode) {
      return true;
    }
    return await this.gpioInterface.releasePin(pin);
  }

  /**
   * 清理资源
   */
  public async cleanup(): Promise<void> {
    this.stopPeriodicReading();
    
    if (!this.isDevMode) {
      await this.gpioInterface.releaseAllPins();
    }
  }
} 