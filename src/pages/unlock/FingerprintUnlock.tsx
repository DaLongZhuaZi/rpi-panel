import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  ScanOutlined, 
  UnlockOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const FingerprintUnlock: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'waiting' | 'scanning' | 'success' | 'error'>('waiting');
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
  
  // 开始指纹扫描过程
  const startScanning = () => {
    if (status === 'waiting') {
      setStatus('scanning');
      
      // 模拟指纹识别过程 (2秒后返回结果)
      setTimeout(() => {
        // 模拟指纹识别成功
        const success = Math.random() > 0.3; // 70%的成功率
        
        if (success) {
          setStatus('success');
          // 成功后3秒返回主界面
          setTimeout(() => {
            navigate('/user');
          }, 3000);
        } else {
          setStatus('error');
          // 失败后2秒重置状态
          setTimeout(() => {
            setStatus('waiting');
          }, 2000);
        }
      }, 2000);
    }
  };
  
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
        <h1 className="ml-4 text-xl font-semibold">指纹开锁</h1>
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
                  ${isDarkMode ? 'border-green-600' : 'border-green-500'}
                `}>
                  <ScanOutlined className={`text-6xl ${isDarkMode ? 'text-green-600' : 'text-green-500'}`} />
                </div>
                <h2 className="text-xl font-semibold mb-2">请按压指纹传感器</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  将您的手指放在指纹传感器上进行验证
                </p>
              </div>
              
              <button
                onClick={startScanning}
                className={`
                  w-full py-3 rounded-lg font-medium transition-colors duration-200
                  ${isDarkMode 
                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                `}
              >
                开始识别
              </button>
            </>
          ) : status === 'scanning' ? (
            <div className="py-10">
              <div className="relative mx-auto mb-6">
                <div className={`
                  w-32 h-32 rounded-full border-4 flex items-center justify-center
                  ${isDarkMode ? 'border-blue-600' : 'border-blue-500'}
                `}>
                  <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400 opacity-30"></div>
                  <ScanOutlined className={`text-6xl ${isDarkMode ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <LoadingOutlined className="text-2xl mb-3 text-blue-500" />
                <h2 className="text-xl font-semibold">正在扫描指纹...</h2>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  请保持手指稳定，不要移动
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
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">指纹验证成功！</h2>
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
                  <ScanOutlined className="text-5xl text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">指纹不匹配！</h2>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                请确认您的指纹已注册，或尝试其他验证方式
              </p>
            </div>
          )}
        </div>
        
        {/* 底部提示信息 */}
        <div className={`mt-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-sm mb-2">
            若无法使用指纹识别，请尝试其他验证方式
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

export default FingerprintUnlock; 