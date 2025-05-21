import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined, 
  SettingOutlined, 
  TeamOutlined, 
  LockOutlined,
  ApiOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  ToolOutlined
} from '@ant-design/icons';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/').filter(Boolean)[1] || '';

  const menuItems: MenuItem[] = [
    {
      key: '',
      title: '控制台',
      icon: <DashboardOutlined />,
      path: '/admin'
    },
    {
      key: 'labs',
      title: '实验室管理',
      icon: <BankOutlined />,
      path: '/admin/labs'
    },
    {
      key: 'locks',
      title: '门锁管理',
      icon: <LockOutlined />,
      path: '/admin/locks'
    },
    {
      key: 'access',
      title: '权限管理',
      icon: <TeamOutlined />,
      path: '/admin/access'
    },
    {
      key: 'devices',
      title: '设备监控',
      icon: <ApiOutlined />,
      path: '/admin/devices'
    },
    {
      key: 'hardware',
      title: '硬件测试',
      icon: <ToolOutlined />,
      path: '/admin/hardware'
    },
    {
      key: 'settings',
      title: '系统设置',
      icon: <SettingOutlined />,
      path: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    // TODO: 处理登出逻辑
    navigate('/admin-login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <div 
        className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* 头部Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center">
          <div className={`${collapsed ? 'mx-auto' : 'mr-4'}`}>
            <LockOutlined className="text-2xl text-primary" />
      </div>
          {!collapsed && (
            <h1 className="text-lg font-bold text-primary-light">实验室门禁系统</h1>
          )}
        </div>
        
        {/* 菜单 */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul>
            {menuItems.map(item => (
              <li key={item.key} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm ${
                    currentPath === item.key 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className={`${collapsed ? 'mx-auto text-lg' : 'mr-4'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 底部操作区 */}
        <div className="p-4 border-t border-gray-700">
          <button 
            className="flex items-center text-gray-300 hover:text-white w-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className={`${collapsed ? 'mx-auto' : 'mr-4'}`}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            {!collapsed && <span>收起菜单</span>}
          </button>
          
          <button 
            className="flex items-center text-gray-300 hover:text-white mt-4 w-full"
            onClick={handleLogout}
          >
            <span className={`${collapsed ? 'mx-auto' : 'mr-4'}`}>
              <LogoutOutlined />
            </span>
            {!collapsed && <span>退出登录</span>}
          </button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.key === currentPath)?.title || '控制台'}
          </h2>
        </header>
        
        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 