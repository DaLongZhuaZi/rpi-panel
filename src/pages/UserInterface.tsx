import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LockOutlined,
  ScanOutlined,
  MobileOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const UserInterface: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));
  const [currentDate, setCurrentDate] = useState<string>(formatDate(new Date()));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // 实验室基本信息
  const labInfo = {
    name: "智能物联网实验室",
    address: "东九实验楼",
    roomNumber: "405"
  };
  
  // 更新时间并检查是否应该切换到深色模式
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now));
      setCurrentDate(formatDate(now));
      
      // 根据时间自动切换浅色/深色模式 (晚上8点到早上6点使用深色模式)
      const hour = now.getHours();
      setIsDarkMode(hour >= 20 || hour < 6);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 防止触摸屏误操作：仅限制缩放，但允许点击
  useEffect(() => {
    // 禁止双指缩放
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // 添加事件监听器 - 只保留防止缩放功能
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    // 添加CSS样式防止用户选择文本
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body {
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      html, #root, .App {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // 格式化时间，显示时:分:秒
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  }
  
  // 格式化日期，显示年-月-日 星期几
  function formatDate(date: Date): string {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} 星期${weekDay}`;
  }
  
  // 导航到不同的开锁界面
  const navigateToUnlock = (method: string) => {
    navigate(`/user/unlock/${method}`);
  };
  
  return (
    <div 
      className={`flex flex-col h-full min-h-screen w-full p-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* 实验室信息区域 */}
      <div className={`w-full px-4 py-3 rounded-b-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-md`}>
        <h1 className="text-2xl font-bold text-center mb-2">{labInfo.name}</h1>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <EnvironmentOutlined className="mr-2" />
            <span>{labInfo.address}</span>
          </div>
          <div className="flex items-center">
            <InfoCircleOutlined className="mr-2" />
            <span>房间号: {labInfo.roomNumber}</span>
          </div>
        </div>
      </div>
      
      {/* 时间信息区域 */}
      <div className={`w-full mt-2 px-4 py-3 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-md text-center`}>
        <div className="flex items-center justify-center mb-1">
          <ClockCircleOutlined className="mr-2 text-xl" />
          <span className="text-xl">{currentTime}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentDate}
        </div>
      </div>
      
      {/* 开锁方式选择区域 - 使用flex-1确保填充剩余空间 */}
      <div className="flex-1 flex flex-col justify-center p-4">
        <h2 className={`text-xl font-semibold mb-4 text-center ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          请选择开锁方式
        </h2>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
          <button
            onClick={() => navigateToUnlock('password')}
            className={`aspect-square p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode 
                ? 'bg-blue-900 hover:bg-blue-800 text-white' 
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
            } transition-colors duration-200`}
          >
            <LockOutlined className="text-3xl mb-2" />
            <span>密码开锁</span>
          </button>
          
          <button
            onClick={() => navigateToUnlock('fingerprint')}
            className={`aspect-square p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode 
                ? 'bg-green-900 hover:bg-green-800 text-white' 
                : 'bg-green-100 hover:bg-green-200 text-green-800'
            } transition-colors duration-200`}
          >
            <ScanOutlined className="text-3xl mb-2" />
            <span>指纹开锁</span>
          </button>
          
          <button
            onClick={() => navigateToUnlock('bluetooth')}
            className={`aspect-square p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode 
                ? 'bg-purple-900 hover:bg-purple-800 text-white' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
            } transition-colors duration-200`}
          >
            <MobileOutlined className="text-3xl mb-2" />
            <span>蓝牙开锁</span>
          </button>
          
          <button
            onClick={() => navigate('/admin-login')}
            className={`aspect-square p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } transition-colors duration-200`}
          >
            <span className="text-3xl mb-2">👤</span>
            <span>管理员入口</span>
          </button>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <div className={`w-full p-2 text-center text-sm ${
        isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-white'
      } shadow-inner`}>
        系统状态: 正常运行中 | 版本: v1.0.0
      </div>
    </div>
  );
};

export default UserInterface; 