import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  KeyOutlined,
  AppstoreOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
  ExperimentOutlined,
  LockOutlined
} from '@ant-design/icons';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString('zh-CN'));
  
  const DashboardIcon = DashboardOutlined;
  const KeyIcon = KeyOutlined;
  const AppstoreIcon = AppstoreOutlined;
  const SettingIcon = SettingOutlined;
  const MenuIcon = MenuOutlined;
  const CloseIcon = CloseOutlined;
  const ExperimentIcon = ExperimentOutlined;
  const LockIcon = LockOutlined;
  
  // 确保占满整个视口
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body, html, #root, .App {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 更新时间显示
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('zh-CN'));
    }, 1000);
    
    return () => {
      document.head.removeChild(styleElement);
      clearInterval(timeInterval);
    };
  }, []);
  
  const menuItems = [
    { path: '/admin/', label: '预约面板', icon: <DashboardIcon /> },
    { path: '/admin/labs', label: '实验室管理', icon: <ExperimentIcon /> },
    { path: '/admin/locks', label: '门锁管理', icon: <LockIcon /> },
    { path: '/admin/access', label: '门禁控制', icon: <KeyIcon /> },
    { path: '/admin/devices', label: '设备监控', icon: <AppstoreIcon /> },
    { path: '/admin/settings', label: '系统设置', icon: <SettingIcon /> },
  ];

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 关闭菜单的函数
  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full min-h-screen w-full md:flex-row">
      {/* 移动端菜单按钮 */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold truncate max-w-[70%]">
          {menuItems.find(item => item.path === location.pathname)?.label || '实验室管理系统'}
        </h1>
        <button 
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={toggleMenu}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* 侧边导航 - 大屏幕固定显示，小屏幕条件显示 */}
      <div className={`
        bg-gray-800 text-white flex flex-col overflow-auto
        ${mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'} 
        md:block md:sticky md:top-0 md:h-screen md:w-64 md:min-w-0 md:flex-shrink-0
      `}>
        {/* 标题/Logo */}
        <div className="p-4 text-xl font-bold border-b border-gray-700 flex justify-between items-center">
          <span>实验室管理系统</span>
          {/* 移动端关闭按钮 */}
          <button 
            className="md:hidden p-2 text-white hover:text-gray-300"
            onClick={closeMenu}
          >
            <CloseIcon />
          </button>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-5 py-3 hover:bg-gray-700 ${
                    location.pathname === item.path ? 'bg-primary-dark text-white' : 'text-gray-300'
                  }`}
                  onClick={closeMenu} // 点击菜单项时关闭移动端菜单
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* 底部状态信息 */}
        <div className="p-4 text-sm text-gray-400 border-t border-gray-700">
          <div className="truncate">设备状态: 正常</div>
          <div className="truncate">连接状态: 在线</div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 顶部状态栏 - 仅在平板及以上设备显示 */}
        <header className="hidden md:flex bg-white border-b border-gray-200 p-3 justify-between items-center shadow-sm">
          <h1 className="text-lg md:text-xl font-semibold truncate">
            {menuItems.find(item => item.path === location.pathname)?.label || '实验室管理系统'}
          </h1>
          <div className="text-xs md:text-sm text-gray-500 flex">
            <span className="mr-3 hidden lg:inline">{currentTime}</span>
            <span className="truncate">ID: RPi-Panel-001</span>
          </div>
        </header>
        
        {/* 内容区域 */}
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5 bg-gray-100">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 