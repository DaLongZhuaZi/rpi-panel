import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  MobileOutlined, 
  UnlockOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const BluetoothUnlock: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'waiting' | 'connecting' | 'success' | 'error'>('waiting');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // 检测当前时间以设置深色/浅色模式
  useEffect(() => {
    const checkDarkMode = () => {
      const hour = new Date().getHours();
      setIsDarkMode(hour >= 20 || hour < 6);
    };
    
    checkDarkMode(); // 初始检查
    const timer = setInterval(checkDarkMode, 60000); // 每分钟检查一次
    
    return () => clearInterval(timer);
  }, []);
  
  // 仅防止双指缩放
  useEffect(() => {
    // 禁止双指缩放
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // 只添加防止缩放的监听器
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    // 清理函数
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);
  
  // 模拟蓝牙连接过程
  const startConnection = () => {
    if (status === 'waiting') {
      setStatus('connecting');
      
      // 模拟连接过程
      setTimeout(() => {
        // 模拟连接成功（80%成功率）
        const success = Math.random() > 0.2;
        
        if (success) {
          setStatus('success');
          // 成功后3秒返回主界面
          setTimeout(() => {
            navigate('/user');
          }, 3000);
        } else {
          setStatus('error');
          // 失败后2秒重置
          setTimeout(() => {
            setStatus('waiting');
          }, 2000);
        }
      }, 2000);
    }
  };
  
  // 生成二维码（这里只是模拟，实际应用需要使用实际的微信小程序二维码）
  const renderQRCode = () => (
    <div className={`
      w-40 h-40 mx-auto flex items-center justify-center border-2 
      ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
    `}>
      <div className="text-center">
        <span className="block text-4xl mb-2">🔍</span>
        <span className="text-xs">微信小程序二维码</span>
      </div>
    </div>
  );
  
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* 顶部导航栏 */}
      <div className={`p-4 flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <button
          onClick={() => navigate('/user')}
          className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">蓝牙开锁</h1>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`
          w-full max-w-sm p-6 rounded-lg text-center shadow-md
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        `}>
          {status === 'waiting' ? (
            <>
              <div className="mb-6">
                <div className={`
                  w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-4
                  ${isDarkMode ? 'border-purple-600' : 'border-purple-500'}
                `}>
                  <MobileOutlined className={`text-6xl ${isDarkMode ? 'text-purple-600' : 'text-purple-500'}`} />
                </div>
                <h2 className="text-xl font-semibold mb-2">蓝牙开锁</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  请确保已打开蓝牙并靠近门锁
                </p>
                
                {renderQRCode()}
                
                <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="mb-1">1. 扫描上方二维码</p>
                  <p className="mb-1">2. 打开微信小程序</p>
                  <p>3. 按照小程序提示完成开锁</p>
                </div>
              </div>
              
              <button
                onClick={startConnection}
                className={`
                  w-full py-3 rounded-lg font-medium transition-colors duration-200
                  ${isDarkMode 
                    ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }
                `}
              >
                开始连接
              </button>
            </>
          ) : status === 'connecting' ? (
            <div className="py-10">
              <div className="relative mx-auto mb-6">
                <div className={`
                  w-32 h-32 rounded-full border-4 flex items-center justify-center
                  ${isDarkMode ? 'border-blue-600' : 'border-blue-500'}
                `}>
                  <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400 opacity-30"></div>
                  <MobileOutlined className={`text-6xl ${isDarkMode ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <LoadingOutlined className="text-2xl mb-3 text-blue-500" />
                <h2 className="text-xl font-semibold">正在连接蓝牙...</h2>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  请确保手机靠近门锁并保持蓝牙开启
                </p>
              </div>
            </div>
          ) : status === 'success' ? (
            <div className="py-10">
              <div className="relative mx-auto mb-6">
                <div className="animate-ping absolute inset-0 rounded-full bg-green-400 opacity-50"></div>
                <div className={`
                  relative w-32 h-32 mx-auto rounded-full flex items-center justify-center 
                  ${isDarkMode ? 'bg-green-700' : 'bg-green-500'}
                `}>
                  <UnlockOutlined className="text-5xl text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">蓝牙开锁成功！</h2>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                门锁已开启，请在30秒内进入
              </p>
            </div>
          ) : (
            <div className="py-10">
              <div className="mx-auto mb-6">
                <div className={`
                  w-32 h-32 mx-auto rounded-full flex items-center justify-center 
                  ${isDarkMode ? 'bg-red-700' : 'bg-red-500'}
                `}>
                  <MobileOutlined className="text-5xl text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">蓝牙连接失败！</h2>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                请确保蓝牙已开启，手机靠近门锁，或尝试其他方式
              </p>
            </div>
          )}
        </div>
        
        {/* 底部提示信息 */}
        <div className={`mt-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-sm mb-2">
            若无法使用蓝牙开锁，请尝试其他验证方式
          </div>
          <button
            onClick={() => navigate('/user')}
            className={`
              text-sm py-2 px-4 rounded-lg transition-colors duration-200
              ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}
            `}
          >
            返回选择页面
          </button>
        </div>
      </div>
    </div>
  );
};

export default BluetoothUnlock; 