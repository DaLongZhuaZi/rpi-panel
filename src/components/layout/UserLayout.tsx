import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
}

// 用户界面专用布局组件
const UserLayout: React.FC<UserLayoutProps> = ({ 
  children, 
  showBackButton = false, 
  title = '实验室门禁系统' 
}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  );

  // 检测当前时间，更新时间显示并切换深色/浅色模式
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // 更新时间显示
      setCurrentTime(
        now.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      );
      
      // 根据时间自动切换浅色/深色模式 (晚上8点到早上6点使用深色模式)
      const hour = now.getHours();
      setIsDarkMode(hour >= 20 || hour < 6);
    };
    
    updateTime(); // 初始更新
    const timer = setInterval(updateTime, 60000); // 每分钟更新一次
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={`
      flex flex-col h-screen
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}
      transition-colors duration-300
    `}>
      {/* 顶部栏 */}
      <header className={`
        p-4 flex items-center justify-between
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
        shadow-md
      `}>
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className={`
                p-2 mr-2 rounded-full 
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
              `}
            >
              <span>←</span>
            </button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="text-sm">
          <span>{currentTime}</span>
        </div>
      </header>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* 底部状态栏 */}
      <footer className={`
        py-2 px-4 text-center text-xs
        ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}
      `}>
        智能物联网实验室门禁系统 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default UserLayout; 