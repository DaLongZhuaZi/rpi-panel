// 使用条件导入，在浏览器环境中使用模拟模块
import { childProcess, util } from './browser-mocks';

/**
 * GPIO接口类
 * 用于与树莓派GPIO进行交互
 */
export class GPIOInterface {
  private execPromise: any;

  constructor() {
    this.execPromise = util.promisify(childProcess.exec);
  }

  /**
   * 设置GPIO引脚模式
   * @param pin 引脚号
   * @param mode 模式 (in/out)
   */
  async setupPin(pin: number, mode: 'in' | 'out'): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.log(`模拟设置GPIO引脚 ${pin} 为 ${mode} 模式`);
        return true;
      }
      
      await this.execPromise(`gpio -g mode ${pin} ${mode}`);
      return true;
    } catch (error) {
      console.error(`设置GPIO引脚失败: ${error}`);
      return false;
    }
  }

  /**
   * 读取GPIO引脚状态
   * @param pin 引脚号
   */
  async readPin(pin: number): Promise<number> {
    try {
      if (typeof window !== 'undefined') {
        // 在浏览器环境中返回随机值
        return Math.round(Math.random());
      }
      
      const { stdout } = await this.execPromise(`gpio -g read ${pin}`);
      return parseInt(stdout.trim(), 10);
    } catch (error) {
      console.error(`读取GPIO引脚失败: ${error}`);
      return -1;
    }
  }

  /**
   * 写入GPIO引脚状态
   * @param pin 引脚号
   * @param value 值 (0/1)
   */
  async writePin(pin: number, value: 0 | 1): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.log(`模拟写入GPIO引脚 ${pin} 值为 ${value}`);
        return true;
      }
      
      await this.execPromise(`gpio -g write ${pin} ${value}`);
      return true;
    } catch (error) {
      console.error(`写入GPIO引脚失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取所有GPIO引脚状态
   */
  async getAllPins(): Promise<Record<number, number>> {
    if (typeof window !== 'undefined') {
      // 在浏览器环境中返回模拟数据
      const pins: Record<number, number> = {};
      for (let i = 2; i <= 27; i++) {
        pins[i] = Math.round(Math.random());
      }
      return pins;
    }
    
    try {
      const { stdout } = await this.execPromise('gpio readall');
      const pinStates: Record<number, number> = {};
      
      // 解析 gpio readall 的输出，提取GPIO引脚状态
      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/\|\s+(\d+)\s+\|\s+([01])\s+\|/);
        if (match) {
          const pin = parseInt(match[1], 10);
          const value = parseInt(match[2], 10);
          pinStates[pin] = value;
        }
      }
      
      return pinStates;
    } catch (error) {
      console.error(`获取所有GPIO引脚状态失败: ${error}`);
      return {};
    }
  }
} 