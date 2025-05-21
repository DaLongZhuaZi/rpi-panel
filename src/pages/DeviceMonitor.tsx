import React, { useState, useEffect } from 'react';
import { 
  ApiOutlined, 
  WifiOutlined, 
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { fetchDevices } from '../api/devices';
import type { Device } from '../types/device';
import { deviceMqttCommands, MqttCommandOption } from '../mocks/mqttCommands';
import { sendMqttCommand } from '../api/mqtt';

const DeviceMonitor: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 新增：MQTT命令弹窗相关状态
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<MqttCommandOption | null>(null);
  const [commandParams, setCommandParams] = useState<Record<string, any>>({});
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandResult, setCommandResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (e) {
      setError('获取设备数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };

  // 新增：打开命令弹窗
  const handleOpenCommandModal = () => {
    setSelectedCommand(null);
    setCommandParams({});
    setCommandResult(null);
    setIsCommandModalOpen(true);
  };
  // 关闭命令弹窗
  const handleCloseCommandModal = () => {
    setIsCommandModalOpen(false);
    setSelectedCommand(null);
    setCommandParams({});
    setCommandResult(null);
  };
  // 选择命令类型
  const handleCommandChange = (cmdKey: string) => {
    if (!selectedDevice) return;
    const options = deviceMqttCommands[selectedDevice.type] || [];
    const cmd = options.find(c => c.key === cmdKey) || null;
    setSelectedCommand(cmd);
    // 初始化参数
    if (cmd && cmd.params) {
      const initialParams: Record<string, any> = {};
      cmd.params.forEach(p => {
        initialParams[p.key] = p.default ?? (p.type === 'boolean' ? false : '');
      });
      setCommandParams(initialParams);
    } else {
      setCommandParams({});
    }
  };
  // 参数输入
  const handleParamChange = (key: string, value: any) => {
    setCommandParams(prev => ({ ...prev, [key]: value }));
  };
  // 发送命令
  const handleSendCommand = async () => {
    if (!selectedDevice || !selectedCommand) return;
    setCommandLoading(true);
    setCommandResult(null);
    try {
      const res = await sendMqttCommand({
        deviceId: selectedDevice.id,
        command: selectedCommand.key,
        params: commandParams
      });
      setCommandResult(res);
    } catch (e) {
      setCommandResult({ success: false, message: '命令发送失败' });
    } finally {
      setCommandLoading(false);
    }
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
            onClick={handleOpenCommandModal}
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

  // 新增：命令弹窗UI
  const renderCommandModal = () => {
    if (!selectedDevice || !isCommandModalOpen) return null;
    const options = deviceMqttCommands[selectedDevice.type] || [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
          <h3 className="text-lg font-semibold mb-4">发送MQTT命令</h3>
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            onClick={handleCloseCommandModal}
          >
            <CloseOutlined />
          </button>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">命令类型</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedCommand?.key || ''}
              onChange={e => handleCommandChange(e.target.value)}
            >
              <option value="">请选择命令</option>
              {options.map(cmd => (
                <option key={cmd.key} value={cmd.key}>{cmd.label}</option>
              ))}
            </select>
          </div>
          {selectedCommand && selectedCommand.params && selectedCommand.params.length > 0 && (
            <div className="mb-4 space-y-3">
              {selectedCommand.params.map(param => (
                <div key={param.key}>
                  <label className="block text-gray-700 text-sm mb-1">{param.label}</label>
                  {param.type === 'number' ? (
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={commandParams[param.key] ?? ''}
                      onChange={e => handleParamChange(param.key, Number(e.target.value))}
                    />
                  ) : param.type === 'boolean' ? (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={commandParams[param.key] ? 'true' : 'false'}
                      onChange={e => handleParamChange(param.key, e.target.value === 'true')}
                    >
                      <option value="true">是</option>
                      <option value="false">否</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={commandParams[param.key] ?? ''}
                      onChange={e => handleParamChange(param.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {commandResult && (
            <div className={`mb-4 p-3 rounded ${commandResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {commandResult.success ? <CheckOutlined className="mr-2" /> : <CloseOutlined className="mr-2" />}
              {commandResult.message}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handleCloseCommandModal}
              disabled={commandLoading}
            >取消</button>
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              onClick={handleSendCommand}
              disabled={!selectedCommand || commandLoading}
            >
              {commandLoading ? <LoadingOutlined /> : '发送' }
            </button>
          </div>
        </div>
      </div>
    );
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-red-500">
            <CloseOutlined className="text-4xl mb-2" />
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              onClick={handleRefresh}
            >重试</button>
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
      {renderCommandModal()}
    </div>
  );
};

export default DeviceMonitor; 