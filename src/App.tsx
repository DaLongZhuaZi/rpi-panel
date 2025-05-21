import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AccessControl from './pages/AccessControl';
import DeviceMonitor from './pages/DeviceMonitor';
import Settings from './pages/Settings';
import UserInterface from './pages/UserInterface';
import PasswordUnlock from './pages/unlock/PasswordUnlock';
import FingerprintUnlock from './pages/unlock/FingerprintUnlock';
import BluetoothUnlock from './pages/unlock/BluetoothUnlock';
import AdminLogin from './pages/AdminLogin';
import LabManagement from './pages/LabManagement';
import LockManagement from './pages/LockManagement';
import HardwareTest from './pages/HardwareTest';
import { initializeServices } from './services/init-service';

function App() {
  // 添加全局事件监听和样式
  useEffect(() => {
    // 防止双指缩放
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // 处理窗口大小变化，更新CSS变量
    const handleResize = () => {
      // 设置视口高度变量，解决移动端100vh问题
      document.documentElement.style.setProperty(
        '--vh', 
        `${window.innerHeight * 0.01}px`
      );
    };
    
    // 初始化设置
    handleResize();
    
    // 添加事件监听器
    document.addEventListener('touchstart', preventZoom, { passive: false });
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 初始化服务
  useEffect(() => {
    const init = async () => {
      try {
        await initializeServices();
      } catch (error) {
        console.error('初始化服务失败:', error);
      }
    };
    
    init();
  }, []);
  
  return (
    <Router basename="/">
      <div className="App container-fluid">
        <Routes>
          {/* 用户界面路由 */}
          <Route path="/user" element={<UserInterface />} />
          <Route path="/user/unlock/password" element={<PasswordUnlock />} />
          <Route path="/user/unlock/fingerprint" element={<FingerprintUnlock />} />
          <Route path="/user/unlock/bluetooth" element={<BluetoothUnlock />} />
          
          {/* 管理员登录页面 */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* 管理员功能页面 */}
          <Route path="/admin/*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="labs" element={<LabManagement />} />
                <Route path="locks" element={<LockManagement />} />
                <Route path="access" element={<AccessControl />} />
                <Route path="devices" element={<DeviceMonitor />} />
                <Route path="hardware" element={<HardwareTest />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </MainLayout>
          } />
          
          {/* 默认路由 - 重定向到用户界面 */}
          <Route path="/" element={<UserInterface />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 