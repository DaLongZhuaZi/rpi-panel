import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GPIOPinConfig {
  pin: number;
  mode: 'in' | 'out';
  initialState?: 0 | 1;  // 仅对输出模式有效
  pullUpDown?: 'up' | 'down' | 'none';  // 上拉/下拉设置
  alias?: string;  // 引脚别名
}

export interface GPIOPinStatus {
  pin: number;
  mode: 'in' | 'out';
  value: 0 | 1;
  alias?: string;
}

// 定义树莓派BCM引脚和WiringPi引脚映射，使用BCM编号
const PIN_MAPPING: Record<number, number> = {
  // BCM: WiringPi
  2: 8,   // I2C SDA
  3: 9,   // I2C SCL
  4: 7,
  17: 0,
  18: 1,  // PWM
  27: 2,
  22: 3,
  23: 4,
  24: 5,
  25: 6,
  // UART
  14: 15, // UART TX
  15: 16, // UART RX
  // 更多引脚...
};

/**
 * GPIO接口类 - 单例模式
 */
export class GPIOInterface {
  private static instance: GPIOInterface;
  private configuredPins: Map<number, GPIOPinConfig>;
  private isRaspberryPi: boolean | null = null;
  private gpioAvailable: boolean | null = null;
  
  private constructor() {
    this.configuredPins = new Map();
  }
  
  public static getInstance(): GPIOInterface {
    if (!GPIOInterface.instance) {
      GPIOInterface.instance = new GPIOInterface();
    }
    return GPIOInterface.instance;
  }
  
  /**
   * 检查是否在树莓派环境中运行
   */
  public async checkIsRaspberryPi(): Promise<boolean> {
    if (this.isRaspberryPi !== null) {
      return this.isRaspberryPi;
    }

    try {
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
   * 检查GPIO是否可用
   */
  public async checkGPIOAvailable(): Promise<boolean> {
    if (this.gpioAvailable !== null) {
      return this.gpioAvailable;
    }
    
    try {
      // 检查是否在树莓派上运行
      const isRpi = await this.checkIsRaspberryPi();
      if (!isRpi) {
        this.gpioAvailable = false;
        return false;
      }
      
      // 检查GPIO sysfs接口是否存在
      const { stdout } = await execAsync('ls /sys/class/gpio 2>/dev/null || echo ""');
      this.gpioAvailable = stdout.trim().length > 0;
      
      return this.gpioAvailable;
    } catch (error) {
      console.error('Failed to check GPIO availability:', error);
      this.gpioAvailable = false;
      return false;
    }
  }
  
  /**
   * 初始化指定的GPIO引脚
   */
  public async setupPin(config: GPIOPinConfig): Promise<boolean> {
    try {
      const isAvailable = await this.checkGPIOAvailable();
      if (!isAvailable) {
        console.error('GPIO is not available');
        return false;
      }
      
      // 导出引脚到sysfs
      await execAsync(`echo ${config.pin} > /sys/class/gpio/export`);
      
      // 设置引脚方向
      await execAsync(`echo "${config.mode}" > /sys/class/gpio/gpio${config.pin}/direction`);
      
      // 如果是输出模式且指定了初始状态
      if (config.mode === 'out' && config.initialState !== undefined) {
        await execAsync(`echo ${config.initialState} > /sys/class/gpio/gpio${config.pin}/value`);
      }
      
      // 设置上拉/下拉（需要使用gpio命令，属于WiringPi）
      if (config.pullUpDown && config.pullUpDown !== 'none') {
        const wiringPiPin = PIN_MAPPING[config.pin] || config.pin;
        const pullMode = config.pullUpDown === 'up' ? 'up' : 'down';
        await execAsync(`gpio -g mode ${config.pin} ${config.mode === 'in' ? 'in' : 'out'}`);
        await execAsync(`gpio -g mode ${config.pin} ${pullMode}`);
      }
      
      // 保存引脚配置
      this.configuredPins.set(config.pin, config);
      
      return true;
    } catch (error) {
      console.error(`Failed to setup GPIO pin ${config.pin}:`, error);
      return false;
    }
  }
  
  /**
   * 释放指定的GPIO引脚
   */
  public async releasePin(pin: number): Promise<boolean> {
    try {
      if (!this.configuredPins.has(pin)) {
        return false;
      }
      
      await execAsync(`echo ${pin} > /sys/class/gpio/unexport`);
      this.configuredPins.delete(pin);
      
      return true;
    } catch (error) {
      console.error(`Failed to release GPIO pin ${pin}:`, error);
      return false;
    }
  }
  
  /**
   * 释放所有配置的GPIO引脚
   */
  public async releaseAllPins(): Promise<boolean> {
    try {
      const pins = Array.from(this.configuredPins.keys());
      
      for (const pin of pins) {
        await this.releasePin(pin);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to release all GPIO pins:', error);
      return false;
    }
  }
  
  /**
   * 设置GPIO引脚输出值
   */
  public async writePin(pin: number, value: 0 | 1): Promise<boolean> {
    try {
      const config = this.configuredPins.get(pin);
      
      if (!config || config.mode !== 'out') {
        console.error(`Pin ${pin} is not configured as output`);
        return false;
      }
      
      await execAsync(`echo ${value} > /sys/class/gpio/gpio${pin}/value`);
      
      return true;
    } catch (error) {
      console.error(`Failed to write to GPIO pin ${pin}:`, error);
      return false;
    }
  }
  
  /**
   * 读取GPIO引脚输入值
   */
  public async readPin(pin: number): Promise<0 | 1 | null> {
    try {
      const config = this.configuredPins.get(pin);
      
      if (!config) {
        console.error(`Pin ${pin} is not configured`);
        return null;
      }
      
      const { stdout } = await execAsync(`cat /sys/class/gpio/gpio${pin}/value`);
      return parseInt(stdout.trim()) as 0 | 1;
    } catch (error) {
      console.error(`Failed to read from GPIO pin ${pin}:`, error);
      return null;
    }
  }
  
  /**
   * 获取所有配置的GPIO引脚状态
   */
  public async getAllPinStatus(): Promise<GPIOPinStatus[]> {
    try {
      const pins = Array.from(this.configuredPins.keys());
      const statuses: GPIOPinStatus[] = [];
      
      for (const pin of pins) {
        const config = this.configuredPins.get(pin);
        if (!config) continue;
        
        let value: 0 | 1;
        if (config.mode === 'out') {
          value = config.initialState || 0;
        } else {
          const readValue = await this.readPin(pin);
          value = readValue !== null ? readValue : 0;
        }
        
        statuses.push({
          pin,
          mode: config.mode,
          value,
          alias: config.alias
        });
      }
      
      return statuses;
    } catch (error) {
      console.error('Failed to get all GPIO pin statuses:', error);
      return [];
    }
  }
  
  /**
   * 模拟GPIO引脚读取（开发环境使用）
   */
  public mockReadPin(pin: number): 0 | 1 {
    // 随机返回高低电平，或者根据保存的状态返回
    const config = this.configuredPins.get(pin);
    
    if (!config) {
      return 0;
    }
    
    if (config.mode === 'out' && config.initialState !== undefined) {
      return config.initialState;
    }
    
    // 输入模式或未设置初始状态时随机生成
    return Math.random() > 0.5 ? 1 : 0;
  }
  
  /**
   * 模拟GPIO写入操作（开发环境使用）
   */
  public mockWritePin(pin: number, value: 0 | 1): boolean {
    const config = this.configuredPins.get(pin);
    
    if (!config || config.mode !== 'out') {
      return false;
    }
    
    // 更新保存的状态
    this.configuredPins.set(pin, {
      ...config,
      initialState: value
    });
    
    return true;
  }
} 