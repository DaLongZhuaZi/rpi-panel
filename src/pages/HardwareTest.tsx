import React, { useEffect, useState } from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SettingOutlined,
  ApiOutlined,
  PlusOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { HardwareService, HardwareStatus, I2CDeviceReading } from '../services/hardware-service';
import { I2CDevice, I2CSensorData } from '../hardware/i2c-interface';
import { GPIOPinConfig, GPIOPinStatus } from '../hardware/gpio-interface';

// I2C设备类型和名称映射
const I2C_DEVICE_TYPES: Record<number, string[]> = {
  0x23: ['BH1750', '光照传感器'],
  0x76: ['BME280', '温湿度气压传感器'],
  0x68: ['DS3231', '实时时钟'],
  0x3C: ['SSD1306', 'OLED显示屏'],
  0x40: ['INA219', '电流传感器'],
  0x77: ['BME280', '温湿度气压传感器(备用地址)']
};

// 默认GPIO引脚配置
const DEFAULT_GPIO_PINS: GPIOPinConfig[] = [
  { pin: 17, mode: 'out', initialState: 0, alias: 'LED1' },
  { pin: 22, mode: 'out', initialState: 0, alias: 'LED2' },
  { pin: 23, mode: 'in', pullUpDown: 'up', alias: '按钮1' },
  { pin: 24, mode: 'in', pullUpDown: 'up', alias: '按钮2' }
];

const HardwareTest: React.FC = () => {
  const [hardwareService] = useState(() => HardwareService.getInstance());
  const [status, setStatus] = useState<HardwareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [i2cDevices, setI2cDevices] = useState<I2CDevice[]>([]);
  const [i2cAddresses, setI2cAddresses] = useState<number[]>([]);
  const [gpioPins, setGpioPins] = useState<GPIOPinStatus[]>([]);
  const [i2cReadings, setI2cReadings] = useState<I2CDeviceReading[]>([]);
  const [scanningDevices, setScanningDevices] = useState(false);
  const [selectedBus, setSelectedBus] = useState(1);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceAddress, setNewDeviceAddress] = useState('');

  // 初始化硬件服务
  useEffect(() => {
    const initHardware = async () => {
      try {
        setLoading(true);
        setError(null);
        const hwStatus = await hardwareService.initialize();
        setStatus(hwStatus);
        
        // 如果是开发模式或硬件可用，初始化一些模拟设备
        if (process.env.NODE_ENV === 'development' || (hwStatus.i2cAvailable && hwStatus.gpioAvailable)) {
          setupDefaultDevices();
        }
        
        // 刷新设备列表
        refreshDevicesList();
      } catch (err) {
        setError('初始化硬件失败: ' + String(err));
      } finally {
        setLoading(false);
      }
    };

    initHardware();

    // 组件卸载时清理
    return () => {
      hardwareService.stopPeriodicReading();
      hardwareService.cleanup().catch(console.error);
    };
  }, [hardwareService]);

  // 设置默认设备（用于开发或初始化）
  const setupDefaultDevices = () => {
    // 默认I2C设备
    const defaultI2CDevices: I2CDevice[] = [
      { busNumber: 1, address: 0x76, name: 'BME280', description: '温湿度气压传感器' },
      { busNumber: 1, address: 0x23, name: 'BH1750', description: '光照传感器' }
    ];

    defaultI2CDevices.forEach(device => {
      hardwareService.configureI2CDevice(device);
    });

    // 默认GPIO引脚
    DEFAULT_GPIO_PINS.forEach(pin => {
      hardwareService.configureGPIOPin(pin).catch(console.error);
    });
  };

  // 刷新设备列表
  const refreshDevicesList = async () => {
    try {
      // 获取I2C设备
      const configuredDevices = hardwareService.getConfiguredI2CDevices();
      setI2cDevices(configuredDevices);
      
      // 获取GPIO引脚状态
      const pinStatus = await hardwareService.getAllGPIOPinStatus();
      setGpioPins(pinStatus);
      
      // 获取最新读数
      const readings = hardwareService.getAllLatestReadings();
      setI2cReadings(readings);
    } catch (err) {
      console.error('刷新设备列表失败:', err);
    }
  };

  // 扫描I2C设备
  const scanI2CDevices = async () => {
    try {
      setScanningDevices(true);
      setError(null);
      const addresses = await hardwareService.scanI2CDevices(selectedBus);
      setI2cAddresses(addresses);
    } catch (err) {
      setError('扫描I2C设备失败: ' + String(err));
    } finally {
      setScanningDevices(false);
    }
  };

  // 添加I2C设备
  const handleAddI2CDevice = () => {
    try {
      if (!newDeviceAddress) {
        setError('请输入有效的设备地址');
        return;
      }
      
      const address = parseInt(newDeviceAddress, 16);
      if (isNaN(address) || address < 0 || address > 127) {
        setError('请输入有效的I2C地址 (0x00-0x7F)');
        return;
      }
      
      const name = newDeviceName || guessDeviceName(address);
      
      hardwareService.configureI2CDevice({
        busNumber: selectedBus,
        address,
        name,
        description: `手动添加的${name}设备`
      });
      
      setNewDeviceName('');
      setNewDeviceAddress('');
      refreshDevicesList();
    } catch (err) {
      setError('添加I2C设备失败: ' + String(err));
    }
  };

  // 根据地址猜测设备类型
  const guessDeviceName = (address: number): string => {
    const knownDevice = I2C_DEVICE_TYPES[address];
    return knownDevice ? knownDevice[0] : `未知设备(0x${address.toString(16)})`;
  };

  // 切换GPIO引脚状态
  const toggleGPIOPin = async (pin: number, currentValue: 0 | 1) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      await hardwareService.writeGPIOPin(pin, newValue);
      // 刷新引脚状态
      const pinStatus = await hardwareService.getAllGPIOPinStatus();
      setGpioPins(pinStatus);
    } catch (err) {
      setError(`设置GPIO引脚 ${pin} 失败: ` + String(err));
    }
  };

  // 开始/停止监控
  const toggleMonitoring = () => {
    if (isMonitoring) {
      hardwareService.stopPeriodicReading();
      setIsMonitoring(false);
    } else {
      hardwareService.startPeriodicReading(2000);
      setIsMonitoring(true);
      
      // 定期刷新读数
      const intervalId = setInterval(() => {
        const readings = hardwareService.getAllLatestReadings();
        setI2cReadings(readings);
      }, 2000);
      
      // 清理
      return () => clearInterval(intervalId);
    }
  };

  // 手动读取I2C设备数据
  const readI2CDevice = async (device: I2CDevice) => {
    try {
      setError(null);
      const data = await hardwareService.readI2CDevice(device.busNumber, device.address);
      
      // 更新读数列表
      const deviceId = `${device.busNumber}-${device.address.toString(16)}`;
      const reading: I2CDeviceReading = {
        device,
        data,
        timestamp: Date.now()
      };
      
      setI2cReadings(prev => {
        const filtered = prev.filter(r => 
          !(r.device.busNumber === device.busNumber && r.device.address === device.address)
        );
        return [...filtered, reading];
      });
    } catch (err) {
      setError(`读取设备 ${device.name} (0x${device.address.toString(16)}) 失败: ` + String(err));
    }
  };

  // 渲染设备状态指示器
  const renderStatusIndicator = (isAvailable: boolean, label: string) => (
    <div className="flex items-center">
      {isAvailable ? (
        <CheckCircleOutlined className="text-green-500 mr-2" />
      ) : (
        <CloseCircleOutlined className="text-red-500 mr-2" />
      )}
      <span>{label}</span>
    </div>
  );

  // 格式化传感器数据显示
  const formatSensorData = (data: I2CSensorData): React.ReactNode => {
    if (!data || Object.keys(data).length === 0) {
      return <span className="text-gray-400">无数据</span>;
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="text-gray-500 mr-1">
              {key === 'temperature' ? '温度:' :
               key === 'humidity' ? '湿度:' :
               key === 'pressure' ? '气压:' :
               key === 'light' ? '光照:' : `${key}:`}
            </span>
            <span className="font-semibold">
              {typeof value === 'number' ? 
                key === 'temperature' ? `${value.toFixed(1)}°C` :
                key === 'humidity' ? `${value.toFixed(1)}%` :
                key === 'pressure' ? `${value.toFixed(1)}hPa` :
                key === 'light' ? `${value.toFixed(1)}lux` :
                `${value}` : String(value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <LoadingOutlined className="text-3xl text-primary mb-4" />
        <p>正在初始化硬件接口...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">硬件设备测试</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center">
            <CloseCircleOutlined className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* 硬件状态 */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <SettingOutlined className="mr-2" />
          系统状态
        </h2>
        
        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                {renderStatusIndicator(status.isRaspberryPi, '树莓派环境')}
              </div>
              <div className="mb-4">
                {renderStatusIndicator(status.gpioAvailable, 'GPIO可用')}
              </div>
              <div className="mb-4">
                {renderStatusIndicator(status.i2cAvailable, 'I2C总线可用')}
              </div>
            </div>
            
            {status.systemInfo && (
              <div className="border-l pl-6">
                <h3 className="font-semibold mb-2">系统信息</h3>
                <div className="text-sm space-y-1">
                  {Object.entries(status.systemInfo).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500 mr-2">
                        {key === 'model' ? '型号:' :
                         key === 'cpuTemp' ? 'CPU温度:' :
                         key === 'memoryUsage' ? '内存使用:' :
                         key === 'uptime' ? '运行时间:' :
                         key === 'kernelVersion' ? '内核版本:' : `${key}:`}
                      </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">无法获取系统状态</p>
        )}
      </div>
      
      {/* I2C设备探测 */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <ApiOutlined className="mr-2" />
          I2C设备探测
        </h2>
        
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">I2C总线</label>
            <select 
              className="border rounded px-3 py-2"
              value={selectedBus}
              onChange={e => setSelectedBus(Number(e.target.value))}
            >
              <option value={1}>Bus 1</option>
              <option value={0}>Bus 0</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm mb-1">&nbsp;</label>
            <button
              className="bg-primary text-white px-4 py-2 rounded flex items-center"
              onClick={scanI2CDevices}
              disabled={scanningDevices}
            >
              {scanningDevices ? <LoadingOutlined className="mr-2" /> : <SyncOutlined className="mr-2" />}
              扫描I2C设备
            </button>
          </div>
        </div>
        
        {i2cAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">检测到的设备</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {i2cAddresses.map(address => {
                const deviceType = I2C_DEVICE_TYPES[address];
                return (
                  <div key={address} className="border rounded-lg p-3 bg-gray-50">
                    <div className="font-mono mb-1">0x{address.toString(16).padStart(2, '0')}</div>
                    {deviceType ? (
                      <div className="text-sm text-primary">{deviceType[0]}</div>
                    ) : (
                      <div className="text-sm text-gray-500">未知设备</div>
                    )}
                    {deviceType && <div className="text-xs text-gray-500">{deviceType[1]}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 添加I2C设备 */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">添加I2C设备</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm mb-1">设备名称</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="BME280"
                value={newDeviceName}
                onChange={e => setNewDeviceName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">设备地址 (0x00-0x7F)</label>
              <input
                type="text"
                className="border rounded px-3 py-2"
                placeholder="0x76"
                value={newDeviceAddress}
                onChange={e => setNewDeviceAddress(e.target.value)}
              />
            </div>
            <div>
              <button
                className="bg-primary text-white px-4 py-2 rounded flex items-center"
                onClick={handleAddI2CDevice}
              >
                <PlusOutlined className="mr-2" />
                添加设备
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 已配置的I2C设备 */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <ApiOutlined className="mr-2" />
            I2C设备监控
          </h2>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded flex items-center ${
                isMonitoring ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
              onClick={toggleMonitoring}
            >
              {isMonitoring ? '停止监控' : '开始监控'}
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded flex items-center"
              onClick={refreshDevicesList}
            >
              <SyncOutlined className="mr-2" />
              刷新
            </button>
          </div>
        </div>
        
        {i2cDevices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>未配置I2C设备</p>
            <p className="text-sm mt-2">请先扫描并添加I2C设备</p>
          </div>
        ) : (
          <div className="space-y-4">
            {i2cDevices.map(device => {
              const reading = i2cReadings.find(r => 
                r.device.busNumber === device.busNumber && r.device.address === device.address
              );
              
              return (
                <div key={`${device.busNumber}-${device.address}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <div className="text-sm text-gray-500">
                        地址: 0x{device.address.toString(16).padStart(2, '0')}, 
                        总线: {device.busNumber}
                      </div>
                      {device.description && (
                        <div className="text-xs text-gray-500">{device.description}</div>
                      )}
                    </div>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => readI2CDevice(device)}
                    >
                      读取
                    </button>
                  </div>
                  
                  {reading ? (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-2">
                        上次读取: {formatTimestamp(reading.timestamp)}
                      </div>
                      {reading.error ? (
                        <div className="text-red-500 text-sm">{reading.error}</div>
                      ) : (
                        formatSensorData(reading.data)
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded text-gray-400 text-sm">
                      尚未读取数据
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* GPIO引脚控制 */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <ApiOutlined className="mr-2" />
          GPIO引脚控制
        </h2>
        
        {gpioPins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>未配置GPIO引脚</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gpioPins.map(pin => (
              <div key={pin.pin} className="border rounded-lg p-4">
                <div className="mb-2">
                  <span className="font-semibold">{pin.alias || `GPIO-${pin.pin}`}</span>
                  <div className="text-xs text-gray-500">引脚 {pin.pin}, 模式: {pin.mode === 'in' ? '输入' : '输出'}</div>
                </div>
                
                {pin.mode === 'out' ? (
                  <button
                    className={`w-full py-2 px-4 rounded ${
                      pin.value === 1 ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}
                    onClick={() => toggleGPIOPin(pin.pin, pin.value)}
                  >
                    {pin.value === 1 ? '高电平 (ON)' : '低电平 (OFF)'}
                  </button>
                ) : (
                  <div className={`py-2 px-4 rounded text-center ${
                    pin.value === 1 ? 'bg-gray-100' : 'bg-yellow-100'
                  }`}>
                    {pin.value === 1 ? '高电平' : '低电平'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareTest; 