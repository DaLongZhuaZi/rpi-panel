import * as React from 'react';
import { 
  SettingOutlined, 
  AppstoreOutlined as ApiOutlinedIcon, 
  InfoCircleOutlined,
  UserOutlined as LockOutlinedIcon,
  WifiOutlined,
  LoadingOutlined,
  CheckOutlined,
  CloseOutlined 
} from '@ant-design/icons';
import mqttClient from '../hardware/mqtt-client';

const { useState, useEffect } = React;

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  description: string;
}

// 设置页面组件
const Settings: React.FC = () => {
  // 创建图标组件变量
  const SettingIcon = SettingOutlined;
  const ApiOutlined = ApiOutlinedIcon;
  const InfoCircleIcon = InfoCircleOutlined;
  const LockOutlined = LockOutlinedIcon;
  const WifiIcon = WifiOutlined;
  const LoadingIcon = LoadingOutlined;
  const CheckIcon = CheckOutlined;
  const CloseIcon = CloseOutlined;

  // 常规设置状态
  const [deviceName, setDeviceName] = useState<string>('RPi-Panel-001');
  const [language, setLanguage] = useState<string>('zh-CN');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [screenTimeout, setScreenTimeout] = useState<number>(300);
  
  // 连接设置状态
  const [mqttServer, setMqttServer] = useState<string>('mqtt://localhost:1883');
  const [mqttUsername, setMqttUsername] = useState<string>('user');
  const [mqttPassword, setMqttPassword] = useState<string>('password');
  const [apiUrl, setApiUrl] = useState<string>('https://api.example.com/v1');
  
  // 访问设置状态
  const [accessPassword, setAccessPassword] = useState<string>('123456');
  const [confirmAccessPassword, setConfirmAccessPassword] = useState<string>('');
  const [autoLockDelay, setAutoLockDelay] = useState<number>(5);
  const [allowFingerprint, setAllowFingerprint] = useState<boolean>(true);
  const [allowBluetooth, setAllowBluetooth] = useState<boolean>(true);
  const [allowRemote, setAllowRemote] = useState<boolean>(true);
  
  // 系统设置状态
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [logLevel, setLogLevel] = useState<string>('info');
  const [restartRequired, setRestartRequired] = useState<boolean>(false);
  
  // 通用状态
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<string>('general');
  
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: '常规设置',
      icon: <SettingIcon />,
      description: '设备名称、语言、界面和显示设置'
    },
    {
      id: 'connection',
      title: '连接设置',
      icon: <WifiIcon />,
      description: 'MQTT服务器配置和API连接设置'
    },
    {
      id: 'access',
      title: '访问设置',
      icon: <LockOutlined />,
      description: '访问控制和安全设置'
    },
    {
      id: 'system',
      title: '系统设置',
      icon: <InfoCircleIcon />,
      description: '系统维护、日志和调试设置'
    }
  ];

  // 模拟加载设置
  useEffect(() => {
    // 实际应用中，这里会从本地存储或API加载设置
    console.log('加载设置...');
  }, []);
  
  // 保存设置
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // 检查密码是否匹配 (仅对访问设置部分)
      if (activeSection === 'access' && accessPassword !== confirmAccessPassword) {
        throw new Error('密码不匹配');
      }
      
      // 模拟API保存
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 成功保存后
      setSaveSuccess(true);
      if (activeSection === 'connection') {
        setRestartRequired(true);
      }
      
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveSuccess(false);
      
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };
  
  // 渲染常规设置部分
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
          设备名称
        </label>
        <input
          type="text"
          id="deviceName"
          value={deviceName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeviceName(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          语言
        </label>
        <select
          id="language"
          value={language}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English (US)</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
          界面主题
        </label>
        <select
          id="theme"
          value={theme}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value as 'light' | 'dark')}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="screenTimeout" className="block text-sm font-medium text-gray-700 mb-1">
          屏幕超时时间 (秒)
        </label>
        <input
          type="number"
          id="screenTimeout"
          value={screenTimeout}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScreenTimeout(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          设置屏幕自动关闭的时间，设为0则不会自动关闭
        </p>
      </div>
    </div>
  );
  
  // 渲染连接设置部分
  const renderConnectionSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-4 flex items-center">
          <ApiOutlined className="mr-2" />
          MQTT服务器设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="mqttServer" className="block text-sm font-medium text-gray-700 mb-1">
              MQTT服务器地址
            </label>
            <input
              type="text"
              id="mqttServer"
              value={mqttServer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMqttServer(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="mqtt://server:port"
            />
          </div>
          
          <div>
            <label htmlFor="mqttUsername" className="block text-sm font-medium text-gray-700 mb-1">
              MQTT用户名
            </label>
            <input
              type="text"
              id="mqttUsername"
              value={mqttUsername}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMqttUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="mqttPassword" className="block text-sm font-medium text-gray-700 mb-1">
              MQTT密码
            </label>
            <input
              type="password"
              id="mqttPassword"
              value={mqttPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMqttPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => {
                console.log('测试MQTT连接');
                // 实际应用中会测试MQTT连接
                const options = {
                  host: mqttServer.split('://')[1]?.split(':')[0] || 'localhost',
                  port: Number(mqttServer.split(':')[2]) || 1883,
                  username: mqttUsername,
                  password: mqttPassword
                };
                
                // 模拟连接测试
                setTimeout(() => {
                  alert('MQTT连接测试成功!');
                }, 1000);
              }}
            >
              测试连接
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-md font-medium mb-4 flex items-center">
          <ApiOutlined className="mr-2" />
          API设置
        </h3>
        
        <div>
          <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
            API服务器地址
          </label>
          <input
            type="text"
            id="apiUrl"
            value={apiUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiUrl(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="https://api.example.com/v1"
          />
          <p className="mt-1 text-sm text-gray-500">
            设置后端API服务器地址，用于获取预约和用户数据
          </p>
        </div>
      </div>
    </div>
  );
  
  // 渲染访问设置部分
  const renderAccessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-4 flex items-center">
          <LockOutlined className="mr-2" />
          门禁密码设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="accessPassword" className="block text-sm font-medium text-gray-700 mb-1">
              门禁密码
            </label>
            <input
              type="password"
              id="accessPassword"
              value={accessPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccessPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="请输入6位数字密码"
            />
          </div>
          
          <div>
            <label htmlFor="confirmAccessPassword" className="block text-sm font-medium text-gray-700 mb-1">
              确认门禁密码
            </label>
            <input
              type="password"
              id="confirmAccessPassword"
              value={confirmAccessPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmAccessPassword(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                confirmAccessPassword && accessPassword !== confirmAccessPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="请再次输入密码"
            />
            {confirmAccessPassword && accessPassword !== confirmAccessPassword && (
              <p className="mt-1 text-sm text-red-600">两次输入的密码不一致</p>
            )}
          </div>
          
          <div>
            <label htmlFor="autoLockDelay" className="block text-sm font-medium text-gray-700 mb-1">
              自动锁定延时 (秒)
            </label>
            <input
              type="number"
              id="autoLockDelay"
              value={autoLockDelay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoLockDelay(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              min="0"
              max="60"
            />
            <p className="mt-1 text-sm text-gray-500">
              开门后自动锁定的时间，设为0表示立即锁定
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-md font-medium mb-4">访问方式</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="allowFingerprint"
              name="allowFingerprint"
              type="checkbox"
              checked={allowFingerprint}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllowFingerprint(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="allowFingerprint" className="ml-2 block text-sm text-gray-700">
              启用指纹验证
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="allowBluetooth"
              name="allowBluetooth"
              type="checkbox"
              checked={allowBluetooth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllowBluetooth(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="allowBluetooth" className="ml-2 block text-sm text-gray-700">
              启用蓝牙验证
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="allowRemote"
              name="allowRemote"
              type="checkbox"
              checked={allowRemote}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllowRemote(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="allowRemote" className="ml-2 block text-sm text-gray-700">
              启用远程开门
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  // 渲染系统设置部分
  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-4 flex items-center">
          <InfoCircleIcon className="mr-2" />
          系统维护
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="autoUpdate"
              name="autoUpdate"
              type="checkbox"
              checked={autoUpdate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoUpdate(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="autoUpdate" className="ml-2 block text-sm text-gray-700">
              启用自动更新
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="debugMode"
              name="debugMode"
              type="checkbox"
              checked={debugMode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebugMode(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700">
              启用调试模式
            </label>
          </div>
          
          <div>
            <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 mb-1">
              日志级别
            </label>
            <select
              id="logLevel"
              value={logLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLogLevel(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="error">错误</option>
              <option value="warn">警告</option>
              <option value="info">信息</option>
              <option value="debug">调试</option>
              <option value="trace">跟踪</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-md font-medium mb-4">系统操作</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                if (window.confirm('确定要重启设备吗？')) {
                  console.log('重启设备...');
                  // 模拟重启
                  alert('设备将在5秒后重启');
                }
              }}
            >
              重启设备
            </button>
            
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                console.log('检查更新...');
                // 模拟检查更新
                setTimeout(() => {
                  alert('您的设备已是最新版本');
                }, 1000);
              }}
            >
              检查更新
            </button>
            
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              onClick={() => {
                if (window.confirm('确定要恢复出厂设置吗？这将删除所有设置和数据！')) {
                  console.log('恢复出厂设置...');
                  // 模拟恢复出厂设置
                  alert('已恢复出厂设置，设备将重启');
                }
              }}
            >
              恢复出厂设置
            </button>
            
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                console.log('下载日志...');
                // 模拟下载日志
                alert('日志已下载到/logs/system.log');
              }}
            >
              下载系统日志
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-md font-medium mb-2">系统信息</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-500">系统版本</div>
            <div>v1.0.0</div>
            
            <div className="text-gray-500">硬件型号</div>
            <div>Raspberry Pi 4 Model B</div>
            
            <div className="text-gray-500">序列号</div>
            <div>RP-{deviceName}</div>
            
            <div className="text-gray-500">内存使用</div>
            <div>512MB / 2GB</div>
            
            <div className="text-gray-500">存储空间</div>
            <div>4.2GB / 16GB</div>
            
            <div className="text-gray-500">运行时间</div>
            <div>3天 12小时 23分钟</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // 渲染当前活动设置部分
  const renderActiveSettings = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'connection':
        return renderConnectionSettings();
      case 'access':
        return renderAccessSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 左侧导航 */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold">设置</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              className={`w-full p-4 text-left flex items-start hover:bg-gray-50 ${
                activeSection === section.id ? 'bg-blue-50 border-l-4 border-primary' : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mr-3 text-xl text-gray-500">{section.icon}</div>
              <div>
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 右侧设置内容 */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
        <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {settingsSections.find(section => section.id === activeSection)?.title}
          </h3>
          {restartRequired && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              需要重启
            </div>
          )}
        </div>
        
        <div className="mt-6">
          {renderActiveSettings()}
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => {
              // 重新加载当前设置
              console.log('重置设置');
            }}
          >
            取消
          </button>
          <button
            type="button"
            disabled={saving}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
            onClick={handleSave}
          >
            {saving ? (
              <span className="flex items-center">
                <LoadingIcon className="mr-2" />
                保存中...
              </span>
            ) : saveSuccess === true ? (
              <span className="flex items-center">
                <CheckIcon className="mr-2" />
                已保存
              </span>
            ) : saveSuccess === false ? (
              <span className="flex items-center">
                <CloseIcon className="mr-2" />
                保存失败
              </span>
            ) : (
              '保存设置'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 