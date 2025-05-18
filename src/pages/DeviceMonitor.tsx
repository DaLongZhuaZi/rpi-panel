import React, { useState, useEffect } from 'react';
import { 
  ApiOutlined, 
  WifiOutlined, 
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined
} from '@ant-design/icons';

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  data?: {
    [key: string]: any;
  };
}

const DeviceMonitor: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      // 模拟从API获取设备数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const mockDevices: Device[] = [
        {
          id: 'door-lock-001',
          name: '主门门锁',
          type: 'door-lock',
          status: 'online',
          lastSeen: '2025-04-23 14:02:35',
          data: {
            battery: 85,
            lockStatus: 'locked',
            temperature: 24.5,
            openCount: 6
          }
        },
        {
          id: 'temp-sensor-001',
          name: '温湿度传感器',
          type: 'sensor',
          status: 'online',
          lastSeen: '2025-04-23 14:03:10',
          data: {
            temperature: 23.2,
            humidity: 45.8,
            battery: 92
          }
        },
        {
          id: 'light-001',
          name: '主灯控制器',
          type: 'light',
          status: 'online',
          lastSeen: '2025-04-23 14:01:22',
          data: {
            status: 'on',
            brightness: 80,
            autoMode: true
          }
        },
        {
          id: 'camera-001',
          name: '入口摄像头',
          type: 'camera',
          status: 'offline',
          lastSeen: '2025-04-23 11:45:18'
        }
      ];
      
      setDevices(mockDevices);
      setLoading(false);
    } catch (error) {
      console.error('获取设备数据失败:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };

  const renderDeviceDetails = () => {
    if (!selectedDevice) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
          <InfoCircleOutlined className="text-4xl mb-2" />
          <p>请选择一个设备查看详情</p>
        </div>
      );
    }

    const { id, name, type, status, lastSeen, data } = selectedDevice;

    return (
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'online' ? 'bg-green-100 text-green-800' :
            status === 'offline' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status === 'online' ? '在线' : status === 'offline' ? '离线' : '错误'}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-sm">
            <span className="text-gray-500">设备ID: </span>
            <span>{id}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">设备类型: </span>
            <span>{type === 'door-lock' ? '门锁' : 
                   type === 'sensor' ? '传感器' : 
                   type === 'light' ? '灯光' : 
                   type === 'camera' ? '摄像头' : type}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">最后活动: </span>
            <span>{lastSeen}</span>
          </div>
        </div>
        
        {data && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">设备数据</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-600">{
                    key === 'battery' ? '电池电量' :
                    key === 'temperature' ? '温度' :
                    key === 'humidity' ? '湿度' :
                    key === 'lockStatus' ? '锁状态' :
                    key === 'openCount' ? '开门次数' :
                    key === 'status' ? '状态' :
                    key === 'brightness' ? '亮度' :
                    key === 'autoMode' ? '自动模式' : key
                  }</span>
                  <span className="font-medium">{
                    key === 'battery' ? `${value}%` :
                    key === 'temperature' ? `${value}°C` :
                    key === 'humidity' ? `${value}%` :
                    key === 'lockStatus' ? (value === 'locked' ? '已锁定' : '已解锁') :
                    key === 'openCount' ? `${value}次` :
                    key === 'status' ? (value === 'on' ? '开启' : '关闭') :
                    key === 'brightness' ? `${value}%` :
                    key === 'autoMode' ? (value ? '开启' : '关闭') : value
                  }</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex space-x-3">
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            onClick={() => console.log('发送命令到设备:', id)}
          >
            发送命令
          </button>
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setSelectedDevice(null)}
          >
            关闭详情
          </button>
        </div>
      </div>
    );
  };

  const renderDeviceStatus = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>在线</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span>离线</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>错误</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>未知</span>
          </div>
        );
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'door-lock':
        return <span className="text-2xl">🔒</span>;
      case 'sensor':
        return <span className="text-2xl">🌡️</span>;
      case 'light':
        return <span className="text-2xl">💡</span>;
      case 'camera':
        return <span className="text-2xl">📹</span>;
      default:
        return <span className="text-2xl">📱</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">设备列表</h2>
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? <LoadingOutlined /> : "🔄"}
          </button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500">加载设备列表...</p>
          </div>
        ) : devices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {devices.map((device) => (
              <div 
                key={device.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDevice?.id === device.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleDeviceSelect(device)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.id}</p>
                  </div>
                  <div>
                    {renderDeviceStatus(device.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <InfoCircleOutlined className="text-4xl mb-2" />
            <p>未找到设备</p>
          </div>
        )}
      </div>
      
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold">设备详情</h2>
        </div>
        
        {renderDeviceDetails()}
      </div>
      
      <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">MQTT 连接状态</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ApiOutlined className="text-xl mr-2 text-primary" />
              <h3 className="font-medium">服务器连接</h3>
            </div>
            <div className="flex items-center mt-2">
              <CheckOutlined className="text-green-500 mr-2" />
              <span>已连接到服务器</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              服务器: mqtt://server.example.com:1883
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <WifiOutlined className="text-xl mr-2 text-primary" />
              <h3 className="font-medium">网络状态</h3>
            </div>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>网络状态良好</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              上行/下行: 24.5 KB/s / 102.3 KB/s
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <InfoCircleOutlined className="text-xl mr-2 text-primary" />
              <h3 className="font-medium">消息统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-sm text-gray-500">已发送</div>
                <div className="font-medium">157</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">已接收</div>
                <div className="font-medium">243</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">错误</div>
                <div className="font-medium">0</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">重连次数</div>
                <div className="font-medium">1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMonitor; 